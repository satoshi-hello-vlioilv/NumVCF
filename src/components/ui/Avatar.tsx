import { getAvatarColor, getInitials } from '../../utils/avatar';

interface AvatarProps {
  name: string;
  family?: string;
  given?: string;
  photo?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({ name, family, given, photo, size = 'md' }: AvatarProps) {
  const { bg, text } = getAvatarColor(name);
  const initials = getInitials(name, family, given);
  const sizeClass = sizeMap[size];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 font-semibold select-none`}
      style={{ backgroundColor: bg, color: text }}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
