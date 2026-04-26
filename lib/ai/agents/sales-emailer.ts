/**
 * Sales Emailer Agent — 船関係事業者への定期営業メール
 *
 * sales_email_targets に登録されたマリーナ・整備工場・釣具店などに
 * AIが文面を生成して定期送信。
 *
 * 注意:
 * - 必ず opt-out リンクを文末に。
 * - 同じ宛先に短期間で連投しない（last_emailed_atで制御）
 * - 法令（特商法・特電法）順守。同意なき大量送信は違法リスク。
 *   実運用前に法務確認のこと。
 */
import { createServiceClient } from '@/lib/supabase/service';
import { getAnthropic, getResend } from '@/lib/ai/clients';


export async function runSalesEmailerAgent(opts: { batchSize?: number } = {}) {
  const supabase = createServiceClient();
  const batchSize = opts.batchSize ?? 20;

  // 14日以上経過 or 未送信 のターゲットを抽出
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: targets } = await supabase
    .from('sales_email_targets')
    .select('*')
    .eq('status', 'active')
    .or(`last_emailed_at.is.null,last_emailed_at.lt.${fourteenDaysAgo}`)
    .order('last_emailed_at', { ascending: true, nullsFirst: true })
    .limit(batchSize);

  if (!targets || targets.length === 0) return { ok: true, sent: 0 };

  const results: any[] = [];
  for (const t of targets) {
    // カテゴリ別に文面を最適化
    const prompt = `中古船売買マーケットプレイス「${process.env.NEXT_PUBLIC_SITE_NAME}」から
「${t.business_name}」（カテゴリ: ${t.category ?? '船舶関連事業者'}、所在地: ${t.pref ?? ''}）宛の
営業メール（HTML形式）を作成してください。

【条件】
- サイト機能: 中古船・パーツ販売、AI登録支援、電子契約、ZOOM見学
- 提供価値: 在庫の販路拡大、買い手とのマッチング自動化
- 文末に必ず配信停止リンク: ${process.env.NEXT_PUBLIC_SITE_URL}/optout/{{target_id}}
- 押し売り感を避ける、丁寧で具体的
- 件名は20字程度

JSON形式: {"subject":"...","html":"..."}`;

    try {
      const resp = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = resp.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: string; text: string }).text)
        .join('\n');
      const mail = JSON.parse(text.replace(/```json|```/g, '').trim()) as {
        subject: string;
        html: string;
      };

      const html = mail.html.replaceAll('{{target_id}}', t.id);

      const sent = await getResend().emails.send({
        from: process.env.MAIL_FROM ?? 'no-reply@example.com',
        to: t.email,
        subject: mail.subject,
        html,
      });

      await supabase.from('sales_email_logs').insert({
        target_id: t.id,
        subject: mail.subject,
        body: html,
      });

      await supabase
        .from('sales_email_targets')
        .update({
          last_emailed_at: new Date().toISOString(),
          email_count: (t.email_count ?? 0) + 1,
        })
        .eq('id', t.id);

      results.push({ target: t.email, ok: true, message_id: (sent as any)?.data?.id });
    } catch (e: any) {
      results.push({ target: t.email, ok: false, error: String(e?.message ?? e) });
    }

    // レート制限：1秒待つ
    await new Promise((r) => setTimeout(r, 1000));
  }

  return { ok: true, sent: results.filter((r) => r.ok).length, results };
}
