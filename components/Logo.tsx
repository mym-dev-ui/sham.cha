export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5cc" />
          <stop offset="100%" stopColor="#00b8a9" />
        </linearGradient>
        <linearGradient id="facet2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0099ff" />
          <stop offset="100%" stopColor="#0055cc" />
        </linearGradient>
        <linearGradient id="facet3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ccaa" />
          <stop offset="100%" stopColor="#007755" />
        </linearGradient>
      </defs>
      {/* Top facet */}
      <polygon points="40,4 68,22 40,36 12,22" fill="url(#facet1)" opacity="0.95" />
      {/* Left facet */}
      <polygon points="12,22 40,36 40,72 12,52" fill="url(#facet3)" opacity="0.9" />
      {/* Right facet */}
      <polygon points="68,22 40,36 40,72 68,52" fill="url(#facet2)" opacity="0.85" />
    </svg>
  );
}
