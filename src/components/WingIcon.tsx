import React from 'react';

interface WingIconProps {
  slugOrId?: string;
  path?: string;
  size?: number;
  className?: string;
  color?: string;
}

const WING_PATHS: Record<string, string> = {
  academics: 'M3 9l9-5 9 5-9 5-9-5z M7 11.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5',
  competitions: 'M8 4h8v5a4 4 0 0 1-8 0V4z M8 6H5v1a3 3 0 0 0 3 3 M16 6h3v1a3 3 0 0 1-3 3 M12 13v4 M9 20h6',
  research: 'M10 3h4 M11 3v6l-6 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-6-10V3',
  'research-and-innovation': 'M10 3h4 M11 3v6l-6 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-6-10V3',
  sports: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M9 13.5L7 21l5-3 5 3-2-7.5',
  arts: 'M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-2 0-1.2-.8-1.6-.8-2.6 0-.9.7-1.4 1.8-1.4H18a3 3 0 0 0 3-3c0-5-4-9-9-9z',
  'arts-and-culture': 'M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-2 0-1.2-.8-1.6-.8-2.6 0-.9.7-1.4 1.8-1.4H18a3 3 0 0 0 3-3c0-5-4-9-9-9z',
  community: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  'community-service': 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
};

export default function WingIcon({
  slugOrId = '',
  path,
  size = 26,
  color = '#F2B84B',
  className = '',
}: WingIconProps) {
  const d = path || WING_PATHS[slugOrId.toLowerCase()] || WING_PATHS.competitions;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

