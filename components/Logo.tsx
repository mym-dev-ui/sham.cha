export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0d0" />
          <stop offset="100%" stopColor="#00c8b0" />
        </linearGradient>
        <linearGradient id="leftFacet" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00b8a0" />
          <stop offset="100%" stopColor="#006655" />
        </linearGradient>
        <linearGradient id="rightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0088ff" />
          <stop offset="100%" stopColor="#0044cc" />
        </linearGradient>
        <linearGradient id="bottomLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009977" />
          <stop offset="100%" stopColor="#004433" />
        </linearGradient>
        <linearGradient id="bottomRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066dd" />
          <stop offset="100%" stopColor="#002288" />
        </linearGradient>
      </defs>

      {/* Top facet - light cyan */}
      <polygon points="50,5 80,30 50,42 20,30" fill="url(#topFacet)" />

      {/* Upper-left inner facet */}
      <polygon points="20,30 50,42 38,58 14,44" fill="url(#leftFacet)" />

      {/* Upper-right inner facet */}
      <polygon points="80,30 50,42 62,58 86,44" fill="url(#rightFacet)" />

      {/* Lower-left facet */}
      <polygon points="14,44 38,58 30,75 10,60" fill="url(#bottomLeft)" />

      {/* Lower-right facet */}
      <polygon points="86,44 62,58 70,75 90,60" fill="url(#bottomRight)" />

      {/* Bottom point */}
      <polygon points="30,75 70,75 50,95 10,60 14,44" fill="url(#leftFacet)" opacity="0.5" />
      <polygon points="30,75 70,75 50,95 90,60 86,44" fill="url(#rightFacet)" opacity="0.4" />
      <polygon points="30,75 70,75 50,95" fill="#003366" />
    </svg>
  );
}
