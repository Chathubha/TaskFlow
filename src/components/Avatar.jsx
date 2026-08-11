import { initials, avatarColor } from '../lib/utils'

// Reusable avatar. Shows an uploaded image when available, otherwise
// initials on a deterministic pastel background.
export default function Avatar({ name = '', id = '', size = 'md', avatarUrl }) {
  const sizes = {
    sm: 'size-7 text-[10px]',
    md: 'size-9 text-xs',
    lg: 'size-12 text-sm',
    xl: 'size-20 text-lg',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        className={`inline-flex shrink-0 items-center justify-center rounded-full object-cover ring-2 ring-white ${sizes[size]}`}
      />
    )
  }

  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${sizes[size]} ${avatarColor(id)}`}
    >
      {initials(name) || '?'}
    </span>
  )
}
