/**
 * AIチャットボット・オーケストレーター
 *
 * ユーザーが自然言語で「この船を出品したい」「いい船を探したい」「契約書作って」など
 * 何を言っても、司令塔AIが意図を分類して適切な専門エージェントに振り分ける。
 *
 * 設計方針:
 * - 司令塔：Anthropic Claude (Sonnet) — 推論力で意図分類
 * - 専門エージェント：用途別に分離（疎結合）
 * - 各エージェントは ai_jobs テーブルにジョブを残し、再現可能
 */
import { createServiceClient } from '@/lib/supabase/service';
import { getAnthropic } from '@/lib/ai/clients';
import { runRegistrarAgent } from '@/lib/ai/agents/registrar';
import { runArticleWriterAgent } from '@/lib/ai/agents/article-writer';
import { runMatcherAgent } from '@/lib/ai/agents/matcher';


// 司令塔が判定可能なエージェント種別
export type AgentKind =
  | 'registrar'        // 船・パーツの登録支援
  | 'article_writer'   // SEO記事の生成
  | 'matcher'          // 探しています↔出品のマッチング
  | 'sns_poster'       // SNS自動投稿（cronから呼ぶ想定）
  | 'sales_emailer'    // 営業メール（cronから呼ぶ想定）
  | 'general_qa';      // 一般的な質問

export interface OrchestratorInput {
  userId: string;
  message: string;
  context?: {
    page?: string;       // ユーザーが今どのページにいるか
    boatId?: string;
    chatRoomId?: string;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface OrchestratorOutput {
  intent: AgentKind;
  reply: string;            // ユーザーに返すメッセージ
  data?: any;               // フォーム下書きや検索結果など
  followUp?: string[];      // 次のサジェスト
}

const SYSTEM_PROMPT = `あなたは中古船売買マーケットプレイスの統括AIアシスタントです。
ユーザーの発言を解析して、以下のいずれかの意図に分類してください:

- registrar: 船やパーツを「出品したい」「登録したい」「売りたい」
- article_writer: 「記事を書いて」「SEO」「紹介文を作って」
- matcher: 「こんな船を探している」「予算◯万円で」「おすすめは？」
- sns_poster: 「SNSに投稿」「Twitterに流して」
- general_qa: それ以外の質問・サイト使い方・補助金相談など

必ずJSONのみで返答してください。形式:
{"intent": "<上記キーのいずれか>", "extracted": {<関連情報>}, "user_reply": "<ユーザーへの最初の返答>"}

extracted例:
- registrar: {"title":"...","brand":"...","year":2018,"price":1500000,"location_pref":"福岡県"}
- matcher: {"budget_max":3000000,"size_min_ft":20,"size_max_ft":30,"preferred_period":"3ヶ月以内"}

不足情報があれば、user_reply で1〜2個だけ質問してください（一気に聞かない）。`;

export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const supabase = createServiceClient();

  // ジョブ記録（オーケストレーター起点）
  const { data: parentJob } = await supabase
    .from('ai_jobs')
    .insert({
      agent: 'orchestrator',
      task: 'classify_and_route',
      payload: { user_id: input.userId, message: input.message, context: input.context },
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  try {
    // 1) 司令塔で意図分類
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (input.history) {
      for (const h of input.history.slice(-6)) {
        messages.push({ role: h.role, content: h.content });
      }
    }
    messages.push({ role: 'user', content: input.message });

    const resp = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: string; text: string }).text)
      .join('\n');

    let parsed: { intent: AgentKind; extracted: any; user_reply: string };
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // パース失敗時はgeneral_qa扱い
      parsed = { intent: 'general_qa', extracted: {}, user_reply: text };
    }

    // 2) サブエージェント呼び出し
    let agentResult: any = null;
    switch (parsed.intent) {
      case 'registrar':
        agentResult = await runRegistrarAgent({
          userId: input.userId,
          extracted: parsed.extracted,
          parentJobId: parentJob?.id,
        });
        break;
      case 'article_writer':
        if (input.context?.boatId) {
          agentResult = await runArticleWriterAgent({
            boatId: input.context.boatId,
            parentJobId: parentJob?.id,
          });
        }
        break;
      case 'matcher':
        agentResult = await runMatcherAgent({
          userId: input.userId,
          criteria: parsed.extracted,
          parentJobId: parentJob?.id,
        });
        break;
      // sns_poster / sales_emailer はcron経由で実行
    }

    // 3) ジョブ完了記録
    await supabase
      .from('ai_jobs')
      .update({
        status: 'done',
        result: { intent: parsed.intent, extracted: parsed.extracted, agentResult },
        finished_at: new Date().toISOString(),
      })
      .eq('id', parentJob!.id);

    return {
      intent: parsed.intent,
      reply: parsed.user_reply,
      data: agentResult,
      followUp: buildFollowUps(parsed.intent),
    };
  } catch (e: any) {
    await supabase
      .from('ai_jobs')
      .update({
        status: 'failed',
        error: String(e?.message ?? e),
        finished_at: new Date().toISOString(),
      })
      .eq('id', parentJob!.id);
    throw e;
  }
}

function buildFollowUps(intent: AgentKind): string[] {
  switch (intent) {
    case 'registrar':
      return ['写真をアップロードしたい', '紹介文を自動生成', 'SNSに告知して'];
    case 'matcher':
      return ['もっと条件を絞る', '予算を上げて再検索', '探しています投稿に変える'];
    case 'article_writer':
      return ['SNS文案も作って', 'タイトル違いを3案'];
    default:
      return ['船を出品したい', '船を探したい', '補助金について'];
  }
}
