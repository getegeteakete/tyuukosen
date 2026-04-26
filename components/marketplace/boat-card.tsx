import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { formatYen } from '@/lib/utils';

export interface BoatCardData {
  id: string;
  title: string;
  brand?: string | null;
  year?: number | null;
  length_ft?: number | null;
  price: number;
  location_pref?: string | null;
  cover_image_url?: string | null;
  is_premium?: boolean | null;
  score?: number;
  ai_reason?: string;
}

export function BoatCard({ boat }: { boat: BoatCardData }) {
  return (
    <Link href={`/boats/${boat.id}`} className="card-soft block overflow-hidden">
      <div className="relative aspect-[4/3] bg-ocean-50 overflow-hidden">
        {boat.cover_image_url ? (
          // next/imageを使うとremotePatterns設定が必要なので、ここは標準imgで
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={boat.cover_image_url}
            alt={boat.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ocean-300">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path d="M4 22h24l-3 5H7l-3-5z" fill="currentColor" />
              <path d="M16 4l8 14H8L16 4z" fill="currentColor" opacity=".5" />
            </svg>
          </div>
        )}
        {boat.is_premium && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-coral-500 text-white text-[10px] font-medium">
            <Star className="inline" size={10} /> プレミアム
          </span>
        )}
        {boat.score != null && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-ocean-900/85 text-white text-[10px] font-medium">
            マッチ {boat.score}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-[11px] text-ocean-700">
          {boat.brand}{boat.year ? ` · ${boat.year}年式` : ''}{boat.length_ft ? ` · ${boat.length_ft}ft` : ''}
        </p>
        <h3 className="text-sm font-medium text-ocean-900 mt-1 line-clamp-2 leading-snug">
          {boat.title}
        </h3>
        <div className="mt-2.5 flex items-end justify-between">
          <p className="text-coral-500 font-bold">{formatYen(boat.price)}</p>
          {boat.location_pref && (
            <p className="text-[11px] text-ocean-700 flex items-center gap-0.5">
              <MapPin size={11} /> {boat.location_pref}
            </p>
          )}
        </div>
        {boat.ai_reason && (
          <p className="mt-2 text-[11px] text-ocean-700 bg-ocean-50 rounded p-2 line-clamp-2">
            💡 {boat.ai_reason}
          </p>
        )}
      </div>
    </Link>
  );
}
