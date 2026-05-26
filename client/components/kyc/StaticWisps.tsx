/**
 * StaticWisps — purely decorative background SVG.
 * No animation. Positioned absolute, fills parent (which must be relative + overflow-hidden).
 */
export function StaticWisps({ offsetY = 0 }: { offsetY?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      style={{ zIndex: 0, transform: offsetY !== 0 ? `translateY(${offsetY}px)` : undefined }}
    >
      <defs>
        <filter id="sw-glow" x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur stdDeviation="2" result="b1" />
          <feGaussianBlur stdDeviation="6" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sw-halo" x="-20%" y="-120%" width="140%" height="340%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      {/* Ambient halos */}
      <ellipse cx="640" cy="430" rx="560" ry="190"
        fill="rgba(0,51,141,0.022)" filter="url(#sw-halo)" />
      <ellipse cx="1080" cy="250" rx="360" ry="130"
        fill="rgba(70,0,160,0.016)" filter="url(#sw-halo)" />
      <ellipse cx="200" cy="650" rx="320" ry="120"
        fill="rgba(0,80,180,0.018)" filter="url(#sw-halo)" />

      {/* Broad soft volume sweeps */}
      <path d="M-100,370 C250,220 580,470 920,310 C1170,190 1360,390 1540,270"
        fill="none" stroke="rgba(0,65,155,0.032)" strokeWidth="48" filter="url(#sw-halo)" />
      <path d="M-100,570 C310,430 650,630 940,490 C1120,390 1350,550 1540,430"
        fill="none" stroke="rgba(55,0,135,0.026)" strokeWidth="52" filter="url(#sw-halo)" />
      <path d="M-100,220 C280,360 560,180 820,300 C1020,390 1280,220 1540,350"
        fill="none" stroke="rgba(0,90,200,0.020)" strokeWidth="38" filter="url(#sw-halo)" />

      {/* Mid-weight strands */}
      <path d="M-100,345 C210,205 490,415 790,295 C1030,195 1265,375 1540,255"
        fill="none" stroke="rgba(0,65,160,0.048)" strokeWidth="1.3" filter="url(#sw-glow)" />
      <path d="M-100,495 C270,355 550,555 830,415 C1065,315 1305,495 1540,375"
        fill="none" stroke="rgba(0,51,141,0.042)" strokeWidth="1.1" filter="url(#sw-glow)" />
      <path d="M-100,415 C330,295 610,475 865,355 C1090,265 1305,435 1540,325"
        fill="none" stroke="rgba(65,0,155,0.036)" strokeWidth="0.95" filter="url(#sw-glow)" />
      <path d="M-100,635 C290,495 590,685 890,545 C1110,435 1325,605 1540,495"
        fill="none" stroke="rgba(0,85,195,0.032)" strokeWidth="0.85" filter="url(#sw-glow)" />
      <path d="M-100,235 C230,145 510,305 765,205 C985,125 1245,285 1540,185"
        fill="none" stroke="rgba(35,0,115,0.028)" strokeWidth="0.75" filter="url(#sw-glow)" />
      <path d="M-100,730 C350,600 660,760 950,630 C1150,540 1360,690 1540,590"
        fill="none" stroke="rgba(0,60,140,0.025)" strokeWidth="0.7" filter="url(#sw-glow)" />

      {/* Hair-thin bright threads */}
      <path d="M-100,345 C210,205 490,415 790,295 C1030,195 1265,375 1540,255"
        fill="none" stroke="rgba(175,155,235,0.075)" strokeWidth="0.45" filter="url(#sw-glow)" />
      <path d="M-100,495 C270,355 550,555 830,415 C1065,315 1305,495 1540,375"
        fill="none" stroke="rgba(155,135,215,0.060)" strokeWidth="0.38" filter="url(#sw-glow)" />
      <path d="M-100,415 C330,295 610,475 865,355 C1090,265 1305,435 1540,325"
        fill="none" stroke="rgba(195,175,250,0.050)" strokeWidth="0.32" filter="url(#sw-glow)" />
    </svg>
  );
}
