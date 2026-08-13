import type { MemberTaste, Pair } from "@/lib/taste";

// The map is drawn as a chalk constellation: everyone sits on a circle,
// and the line between any two people is drawn heavier the more taste
// they share. A faint line means you have almost nothing in common.
//
// Deliberately NOT a force-directed layout. With four people that would
// imply precision the data does not have; the thickness carries the
// meaning and the positions are just even spacing.
export function TasteMap({
  members,
  pairs,
}: {
  members: MemberTaste[];
  pairs: Pair[];
}) {
  const size = 420;
  const c = size / 2;
  const r = size * 0.34;

  const points = new Map(
    members.map((m, i) => {
      // Start at the top and go clockwise.
      const angle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
      return [m.id, { x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r }];
    })
  );

  const strongest = Math.max(...pairs.map((p) => p.score), 0.0001);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-md overflow-visible"
      role="img"
      aria-label="Taste map: heavier lines connect members with more shared tags"
    >
      {pairs.map((p) => {
        const pa = points.get(p.a.id)!;
        const pb = points.get(p.b.id)!;
        const strength = p.score / strongest;
        return (
          <line
            key={`${p.a.id}-${p.b.id}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="var(--chalk)"
            strokeWidth={1 + strength * 7}
            strokeLinecap="round"
            opacity={0.12 + strength * 0.5}
          />
        );
      })}

      {members.map((m) => {
        const p = points.get(m.id)!;
        return (
          <g key={m.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={26}
              fill="var(--board)"
              stroke="var(--chalk)"
              strokeWidth={1.5}
              opacity={0.9}
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fill="var(--chalk)"
              style={{ fontFamily: "SchoolClub, sans-serif", fontSize: 15 }}
            >
              {m.name.toLowerCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
