import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type TooltipContentProps,
} from "recharts";
import { toGraphPoints, type GraphPoint } from "../format.ts";
import type { Move } from "../types.ts";

/**
 * Area chart of each move's `eval_after` from GET /state, from White's perspective.
 * Values are clamped to ±10 pawns. A mate score is drawn at ±10. Blunders are red dots.
 */
function EvalDot({ cx, cy, payload }: DotItemDotProps) {
  const point = payload as GraphPoint | undefined;
  if (cx == null || cy == null) return null;
  const blunder = Boolean(point?.isBlunder);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={blunder ? 5 : 2.5}
      fill={blunder ? "#e24b4b" : "#d9d3cb"}
      stroke={blunder ? "#12100e" : "none"}
      strokeWidth={blunder ? 1.5 : 0}
    />
  );
}

function EvalTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload.length === 0) return null;
  const point = payload[0]?.payload as GraphPoint | undefined;
  if (!point?.display) return null;
  return (
    <div className="rounded-lg bg-[#141210] px-2.5 py-1.5 text-xs shadow-lg ring-1 ring-white/10">
      <div className="text-muted">{point.title}</div>
      <div className={`mt-0.5 font-semibold tabular-nums ${point.isBlunder ? "text-blunder" : "text-cream"}`}>
        {point.display}
        {point.isBlunder ? " · blunder" : ""}
      </div>
    </div>
  );
}

export function EvalGraph({ moves }: { moves: Move[] }) {
  const points = toGraphPoints(moves);

  return (
    <section className="shrink-0">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Evaluation</h2>
        <p className="text-[11px] text-muted">White's side · mate at ±10</p>
      </div>
      <div className="h-40 w-full min-w-0">
        {points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            The graph fills in as moves are played.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#3c3834" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a39e96", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[-10, 10]}
                ticks={[-10, -5, 0, 5, 10]}
                width={36}
                tickFormatter={(value: number) => (value > 0 ? `+${value}` : `${value}`)}
                tick={{ fill: "#a39e96", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={0} stroke="#6d675f" />
              <Tooltip content={EvalTooltip} cursor={{ stroke: "#3c3834" }} />
              <Area
                type="linear"
                dataKey="pawns"
                stroke="#d9d3cb"
                strokeWidth={2}
                fill="#8fbc55"
                fillOpacity={0.22}
                baseValue={0}
                dot={EvalDot}
                activeDot={{ r: 4, fill: "#f4f1ea", stroke: "#12100e" }}
                isAnimationActive
                animationDuration={450}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
