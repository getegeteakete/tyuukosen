import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYen(n: number | null | undefined): string {
  if (n == null) return '—';
  return `¥${n.toLocaleString('ja-JP')}`;
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /vbscript:/gi,
];

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  let s = html;
  for (const p of DANGEROUS_PATTERNS) s = s.replace(p, '');
  s = s.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  s = s.replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, 'src=""');
  return s;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
