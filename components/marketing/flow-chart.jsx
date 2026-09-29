/** Decorative hero chart. Both lines draw themselves once on load, then stay put. */
export function FlowChart() {
  return (
    <svg viewBox="0 0 800 260" className="h-full w-full" fill="none" role="img" aria-label="Income and expenses over six months">
      <defs>
        <linearGradient id="fi" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fs" x1="0" x2="1">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {[60, 120, 180, 240].map((y) => (
        <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="var(--line)" />
      ))}
      <path d="M0 170 C90 150 130 90 220 100 S360 40 450 70 S620 30 700 45 L800 20 V260 H0Z" fill="url(#fi)" />
      <path className="animate-draw" style={{ "--len": 1000 }} d="M0 170 C90 150 130 90 220 100 S360 40 450 70 S620 30 700 45 L800 20" stroke="url(#fs)" strokeWidth="3" strokeLinecap="round" />
      <path className="animate-draw" style={{ "--len": 1000, animationDelay: "0.5s" }} d="M0 210 C100 200 140 190 230 195 S360 170 450 185 S620 160 700 172 L800 165" stroke="var(--expense)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1000" />
    </svg>
  );
}
