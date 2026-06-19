interface BadgeProps {
  label: string;
  variant?: 'default' | 'mobile' | 'work' | 'home' | 'fax' | 'other';
}

const variantMap: Record<string, string> = {
  default: 'bg-surface-card text-ink-secondary',
  mobile:  'bg-primary-100 text-primary-700',
  work:    'bg-teal-400/20 text-teal-600',
  home:    'bg-sage-400/20 text-sage-600',
  fax:     'bg-surface-card text-ink-secondary',
  other:   'bg-surface-card text-ink-secondary',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-2xs font-medium ${variantMap[variant] || variantMap.default}`}>
      {label}
    </span>
  );
}
