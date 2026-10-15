import { useEffect, useRef } from "react";
import type { Move, Rating } from "../types.ts";

const MARK: Record<Rating, { glyph: string; className: string }> = {
  best: { glyph: "✓", className: "text-best" },
  good: { glyph: "✓", className: "text-muted" },
  inaccuracy: { glyph: "?!", className: "font-semibold text-inaccuracy" },
  mistake: { glyph: "?", className: "font-semibold text-mistake" },
  blunder: { glyph: "??", className: "font-bold text-blunder" },
};

type Row = { number: number; white?: Move; black?: Move };

/** /state `moves` folded into White / Black columns, like a scoresheet. */
function rowsFrom(moves: Move[]): Row[] {
  const rows: Row[] = [];
  for (const move of moves) {
    if (!move || (move.color !== "white" && move.color !== "black")) continue;
    let row = rows.find((entry) => entry.number === move.number);
    if (!row) {
      row = { number: move.number };
      rows.push(row);
    }
    row[move.color] = move;
  }
  return rows;
}

function Cell({ move, latest }: { move: Move | undefined; latest: boolean }) {
  if (!move) return <span />;
  const mark = MARK[move.rating] ?? { glyph: "", className: "text-muted" };
  const detail = `${move.rating}${move.best ? ` · best ${move.best}` : ""} · ${move.loss} cp`;
  return (
    <span
      title={detail}
      className={`inline-flex min-w-0 items-baseline gap-1 rounded-md px-1.5 py-1 ${latest ? "move-in bg-white/5" : ""}`}
    >
      <span className="truncate font-semibold text-cream">{move.san}</span>
      {mark.glyph && <span className={`text-xs ${mark.className}`}>{mark.glyph}</span>}
    </span>
  );
}

export function MoveList({ moves }: { moves: Move[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const rows = rowsFrom(moves);
  const latestPly = moves.reduce((max, move) => Math.max(max, move?.ply ?? 0), 0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [moves.length]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h2 className="mb-2 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Moves</h2>
      <div className="grid grid-cols-[2.25rem_1fr_1fr] gap-x-1 border-b border-line px-1 pb-1.5 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        <span />
        <span>White</span>
        <span>Black</span>
      </div>
      <div ref={scroller} className="moves min-h-0 flex-1 overflow-y-auto pt-1">
        {rows.length === 0 && <p className="px-1 py-6 text-sm text-muted">No moves yet.</p>}
        {rows.map((row) => (
          <div key={row.number} className="grid grid-cols-[2.25rem_1fr_1fr] items-center gap-x-1 py-0.5">
            <span className="pr-1 text-right text-sm text-muted tabular-nums">{row.number}.</span>
            <Cell move={row.white} latest={row.white?.ply === latestPly} />
            <Cell move={row.black} latest={row.black?.ply === latestPly} />
          </div>
        ))}
      </div>
    </section>
  );
}
