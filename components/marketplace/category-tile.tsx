import Link from 'next/link';

export function CategoryTile({
  href, icon, label, sub,
}: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link href={href} className="card-soft p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-ocean-900">{label}</p>
        <p className="text-[11px] text-ocean-700">{sub}</p>
      </div>
    </Link>
  );
}
