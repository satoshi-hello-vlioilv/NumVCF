import { tagStyle } from '../../utils/tagStyle';

export function TagChip({ name, count }: { name: string; count?: number }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${tagStyle(name)}`}>
      {name}{count !== undefined && <span className="opacity-60 text-2xs">{count}</span>}
    </span>
  );
}
