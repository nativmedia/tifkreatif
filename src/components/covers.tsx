/**
 * Cover generatif bermotif "tenun pesisir" — pengganti foto pada data demo.
 * Deterministik dari `seed` agar stabil antar render, tanpa aset eksternal.
 */
const PALETTES: [string, string, string][] = [
  ["#101828", "#d92d3a", "#f4b740"], // navy laut, merah, emas
  ["#1b2a4a", "#f4b740", "#fff8ed"], // malam, emas, tulang
  ["#7a1622", "#101828", "#f2e7d5"], // merah tua, navy, pasir
  ["#0f3d2e", "#f4b740", "#fff8ed"], // hijau lorok, emas, tulang
];

export function PortfolioCover({
  seed,
  label,
  className = "",
}: {
  seed: number;
  label?: string;
  className?: string;
}) {
  const p = PALETTES[seed % PALETTES.length];
  const bandAngle = (seed % 2 === 0 ? -1 : 1) * (18 + (seed % 3) * 8);
  const sunX = 62 + (seed % 5) * 6;
  const sunY = 26 + (seed % 4) * 5;
  const sunR = 12 + (seed % 3) * 4;
  const rows = 3 + (seed % 3);

  const bands = Array.from({ length: rows }, (_, i) => {
    const y = 8 + i * (84 / rows);
    const h = 5 + ((seed + i) % 3) * 3;
    const c = i % 3 === 0 ? p[1] : i % 3 === 1 ? p[2] : "rgba(255,255,255,.16)";
    return <rect key={i} x={-30} y={y} width={180} height={h} fill={c} rx={h / 2} />;
  });

  return (
    <svg
      viewBox="0 0 120 90"
      role="img"
      aria-label={label ? `Sampul ilustratif: ${label}` : "Sampul ilustratif"}
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="120" height="90" fill={p[0]} />
      <circle cx={sunX} cy={sunY} r={sunR} fill={p[2]} opacity="0.9" />
      <circle cx={sunX} cy={sunY} r={sunR + 6} fill="none" stroke={p[2]} strokeOpacity="0.35" strokeWidth="1.5" />
      <g transform={`rotate(${bandAngle} 60 45)`} opacity="0.85">
        {bands}
      </g>
      <g fill="rgba(255,255,255,.25)">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={6 + ((seed * 7 + i * 17) % 110)} cy={6 + ((seed * 11 + i * 23) % 80)} r="1" />
        ))}
      </g>
      <path
        d="M0 78 Q 20 72, 40 78 T 80 78 T 120 78 V 90 H 0 Z"
        fill="rgba(255,255,255,.14)"
      />
    </svg>
  );
}
