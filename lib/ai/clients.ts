/**
 * SDKクライアントを遅延初期化するファクトリー
 *
 * 理由: モジュールトップレベルで `new Resend(...)` 等を呼ぶと、
 * Next.jsの「Collecting page data」フェーズで環境変数未設定時にビルドが落ちる。
 * 関数内で都度生成すれば、実際にAPIを叩く時点まで初期化を遅延できる。
 */
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

let _anthropic: Anthropic | null = null;
let _resend: Resend | null = null;

export function getAnthropic(): Anthropic {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

export function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  _resend = new Resend(apiKey);
  return _resend;
}
