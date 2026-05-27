/* Full-screen background wave animation. */
export function BackgroundWaves() {
  return (
    <>
      <style>{`
        @keyframes lw-drift-a {
          0%   { transform: translateX(0px)    translateY(0px);   }
          25%  { transform: translateX(60px)   translateY(-18px); }
          50%  { transform: translateX(120px)  translateY(8px);   }
          75%  { transform: translateX(50px)   translateY(-12px); }
          100% { transform: translateX(0px)    translateY(0px);   }
        }
        @keyframes lw-drift-b {
          0%   { transform: translateX(0px)    translateY(0px);  }
          30%  { transform: translateX(-80px)  translateY(20px); }
          60%  { transform: translateX(-140px) translateY(-6px); }
          80%  { transform: translateX(-60px)  translateY(14px); }
          100% { transform: translateX(0px)    translateY(0px);  }
        }
        @keyframes lw-drift-c {
          0%   { transform: translateX(0px)   translateY(0px);   }
          40%  { transform: translateX(100px) translateY(24px);  }
          70%  { transform: translateX(40px)  translateY(-16px); }
          100% { transform: translateX(0px)   translateY(0px);   }
        }
        @keyframes lw-drift-d {
          0%   { transform: translateX(0px)    translateY(0px);  }
          35%  { transform: translateX(-110px) translateY(-20px);}
          65%  { transform: translateX(-55px)  translateY(18px); }
          100% { transform: translateX(0px)    translateY(0px);  }
        }
        @keyframes lw-scroll {
          0%   { transform: translateX(-200px); }
          100% { transform: translateX(200px);  }
        }
        @keyframes lw-scroll-rev {
          0%   { transform: translateX(200px);  }
          100% { transform: translateX(-200px); }
        }
        @keyframes lw-fade {
          0%,100% { opacity: 0.22; }
          50%      { opacity: 0.60; }
        }
        @keyframes lw-fade-b {
          0%,100% { opacity: 0.45; }
          50%      { opacity: 0.12; }
        }
        .lwa   { animation: lw-drift-a   13s ease-in-out infinite; }
        .lwb   { animation: lw-drift-b   17s ease-in-out infinite; }
        .lwc   { animation: lw-drift-c   10s ease-in-out infinite; }
        .lwd   { animation: lw-drift-d   15s ease-in-out infinite; }
        .lwsc  { animation: lw-scroll    22s linear      infinite; }
        .lwscr { animation: lw-scroll-rev 28s linear     infinite; }
        .lwf   { animation: lw-fade       9s ease-in-out infinite; }
        .lwfb  { animation: lw-fade-b    13s ease-in-out infinite; }
      `}</style>

      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <defs>
          <filter id="lw-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3"  result="b1" />
            <feGaussianBlur stdDeviation="10" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lw-halo" x="-30%" y="-120%" width="160%" height="340%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="lw-core" x="-20%" y="-120%" width="140%" height="340%">
            <feGaussianBlur stdDeviation="1.5" result="b1" />
            <feGaussianBlur stdDeviation="6"   result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="lwb lwfb">
          <ellipse cx="720" cy="480" rx="700" ry="200"
            fill="#4C1D95" opacity="0.25" filter="url(#lw-halo)" />
        </g>
        <g className="lwa lwf">
          <ellipse cx="400" cy="580" rx="480" ry="170"
            fill="#3B0764" opacity="0.20" filter="url(#lw-halo)" />
        </g>
        <g className="lwc">
          <ellipse cx="1100" cy="340" rx="400" ry="150"
            fill="#6D28D9" opacity="0.16" filter="url(#lw-halo)" />
        </g>

        <g className="lwb" opacity="0.16">
          <path d="M-200,600 C200,420 500,700 720,520 C940,340 1200,620 1640,440"
            fill="none" stroke="#7C3AED" strokeWidth="2.5" filter="url(#lw-halo)" />
        </g>
        <g className="lwa" opacity="0.14">
          <path d="M-200,320 C300,520 600,240 720,400 C840,560 1140,300 1640,480"
            fill="none" stroke="#4C1D95" strokeWidth="3" filter="url(#lw-halo)" />
        </g>
        <g className="lwd" opacity="0.14">
          <path d="M-200,750 C250,560 550,780 780,620 C1010,460 1250,700 1640,560"
            fill="none" stroke="#5B21B6" strokeWidth="2" filter="url(#lw-halo)" />
        </g>

        <g className="lwa" opacity="0.28">
          <path d="M-200,570 C180,370 420,650 720,470 C1020,290 1280,550 1640,370"
            fill="none" stroke="#A855F7" strokeWidth="1.8" filter="url(#lw-glow)" />
        </g>
        <g className="lwc" opacity="0.22">
          <path d="M-200,330 C220,510 500,250 720,410 C940,570 1220,290 1640,490"
            fill="none" stroke="#9333EA" strokeWidth="1.5" filter="url(#lw-glow)" />
        </g>
        <g className="lwb lwf" opacity="0.20">
          <path d="M-200,670 C300,490 560,710 720,550 C880,390 1160,650 1640,490"
            fill="none" stroke="#C084FC" strokeWidth="1.2" filter="url(#lw-glow)" />
        </g>
        <g className="lwd" opacity="0.18">
          <path d="M-200,250 C280,430 540,190 720,350 C900,510 1180,250 1640,410"
            fill="none" stroke="#7C3AED" strokeWidth="1.0" filter="url(#lw-glow)" />
        </g>

        <g className="lwsc" opacity="0.35">
          <path d="M-300,490 C100,360 400,580 700,440 C1000,300 1300,520 1700,400"
            fill="none" stroke="#A78BFA" strokeWidth="1.2" filter="url(#lw-glow)" />
          <path d="M-300,510 C100,370 400,595 700,455 C1000,315 1300,535 1700,415"
            fill="none" stroke="#C4B5FD" strokeWidth="0.6" filter="url(#lw-glow)" />
        </g>
        <g className="lwscr" opacity="0.28">
          <path d="M-300,620 C150,480 430,660 720,530 C1010,400 1270,590 1700,470"
            fill="none" stroke="#8B5CF6" strokeWidth="1.0" filter="url(#lw-glow)" />
        </g>
        <g className="lwsc" style={{ animationDuration: "34s", animationDelay: "-10s" }} opacity="0.22">
          <path d="M-300,380 C180,280 470,450 730,350 C990,250 1280,420 1700,310"
            fill="none" stroke="#D946EF" strokeWidth="0.8" filter="url(#lw-glow)" />
        </g>
        <g className="lwscr" style={{ animationDuration: "20s", animationDelay: "-5s" }} opacity="0.18">
          <path d="M-300,740 C200,620 490,760 740,660 C990,560 1260,720 1700,620"
            fill="none" stroke="#A855F7" strokeWidth="0.7" filter="url(#lw-glow)" />
        </g>

        <g className="lwa" filter="url(#lw-core)">
          <path d="M-200,570 C180,370 420,650 720,470 C1020,290 1280,550 1640,370"
            fill="none" stroke="#E3D2F8" strokeWidth="0.9" opacity="0.55" />
          <path d="M-200,574 C180,374 420,654 720,474 C1020,294 1280,554 1640,374"
            fill="none" stroke="#D3B3FB" strokeWidth="0.5" opacity="0.35" />
        </g>
        <g className="lwc" filter="url(#lw-core)">
          <path d="M-200,330 C220,510 500,250 720,410 C940,570 1220,290 1640,490"
            fill="none" stroke="#E3D2F8" strokeWidth="0.8" opacity="0.45" />
        </g>
        <g className="lwb lwfb" filter="url(#lw-core)">
          <path d="M-200,670 C300,490 560,710 720,550 C880,390 1160,650 1640,490"
            fill="none" stroke="#D3B3FB" strokeWidth="0.7" opacity="0.40" />
        </g>

        <g className="lwsc" filter="url(#lw-core)" style={{ animationDuration: "22s" }}>
          <path d="M-300,490 C100,360 400,580 700,440 C1000,300 1300,520 1700,400"
            fill="none" stroke="#EDE9FE" strokeWidth="0.7" opacity="0.50" />
        </g>
        <g className="lwscr" filter="url(#lw-core)" style={{ animationDuration: "28s", animationDelay: "-8s" }}>
          <path d="M-300,620 C150,480 430,660 720,530 C1010,400 1270,590 1700,470"
            fill="none" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.40" />
        </g>
      </svg>
    </>
  );
}
