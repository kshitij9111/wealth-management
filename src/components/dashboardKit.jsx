import { useState, useEffect, useMemo, Fragment } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

// ═══ DESIGN TOKENS (mirrors MOFSL dashboard) ═══
export const C = { accent:"#3b82f6", green:"#22c55e", red:"#ef4444", purple:"#a855f7", teal:"#14b8a6", orange:"#f97316", pink:"#ec4899", amber:"#f59e0b", slate:"#64748b", sky:"#0ea5e9", indigo:"#6366f1" };
export const SEG_COLORS = [C.accent, C.green, C.purple, C.orange, C.teal, C.pink, C.amber];

export const fmt = (v, d=1) => {
  if (v == null || isNaN(v)) return "—";
  if (Math.abs(v) >= 100000) return `${(v/1000).toFixed(0)}K`;
  return typeof v === "number" ? v.toLocaleString("en-IN", {minimumFractionDigits:d, maximumFractionDigits:d}) : v;
};
export const fmtCr = v => v == null ? "—" : `₹${fmt(v, 0)}`;

const TipBox = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-gray-700">
    <p className="font-bold mb-1 text-gray-300">{label}</p>
    {payload.map((p, i) => <p key={i} className="flex justify-between gap-6"><span style={{color:p.color}}>{p.name}</span><span className="font-semibold text-white">{fmt(p.value)}</span></p>)}
  </div>;
};

export const KPI = ({ label, value, sub, color=C.accent, trend }) => <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
  <p className="text-2xl font-extrabold mt-1" style={{color}}>{value}</p>
  {sub && <p className={`text-xs mt-1 font-medium ${trend==="up"?"text-emerald-600":trend==="down"?"text-red-500":"text-gray-400"}`}>{trend==="up"?"▲ ":trend==="down"?"▼ ":""}{sub}</p>}
</div>;

export const Card = ({ children, className="" }) => <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>;
export const CT = ({ children }) => <h4 className="text-sm font-bold text-gray-700 mb-3">{children}</h4>;
export const Sec = ({ title, sub, children }) => <div className="mb-6">
  <div className="mb-3"><h3 className="text-base font-bold text-gray-900">{title}</h3>{sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}</div>
  {children}
</div>;
export const CW = ({ h=280, children }) => <ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>;
export const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />;
export const tip = <Tooltip content={<TipBox />} />;
export const leg = <Legend wrapperStyle={{fontSize:10}} />;

// ═══ FUNNEL ENGINE — segment-aware revenue → PAT calculation ═══
// type 'fee'  → revenue = (aum + nnm) × yieldBps / 10000
// type 'nii'  → revenue = (loanBook + bookGrowth) × spreadBps / 10000  (bookGrowth replaces nnm semantically)
// type 'fixed' → revenue = revenueCr (no AUM driver)
const TAX = 0.2517;

function calcSegment(seg, overrides={}) {
  const aum    = overrides.aum    ?? seg.aum    ?? 0;
  const nnm    = overrides.nnm    ?? seg.nnm    ?? 0;
  const yld    = overrides.yld    ?? seg.yld    ?? 0;          // bps
  const ci     = overrides.ci     ?? seg.ci     ?? 0;          // %
  const rev    = overrides.rev    ?? seg.rev    ?? 0;          // ₹ Cr (for 'fixed')
  const mult   = overrides.mult   ?? seg.mult   ?? 0;          // x
  const closingAUM = aum + nnm;
  const avgAUM = (aum + closingAUM) / 2;
  const revenue = seg.type === "fixed" ? rev : avgAUM * yld / 10000;
  const opex = revenue * ci / 100;
  const pbt = revenue - opex;
  const pat = pbt * (1 - TAX);
  const value = pat * mult;
  return { closingAUM, avgAUM, revenue, opex, pbt, pat, value };
}

// ═══ MAIN: WealthSOTPDashboard ═══
export function WealthSOTPDashboard({ company, snapshot, segments: initialSegments, lsKey }) {
  const [tab, setTab] = useState("overview");
  const [segs, setSegs] = useState(initialSegments);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === initialSegments.length) {
          setSegs(initialSegments.map((base, i) => ({ ...base, ...parsed[i] })));
        }
      }
    } catch {}
  }, [lsKey, initialSegments]);

  const updSeg = (i, field, val) => setSegs(prev => prev.map((s, j) => j === i ? { ...s, [field]: parseFloat(val) || 0 } : s));
  const reset  = () => { setSegs(initialSegments); try { localStorage.removeItem(lsKey); } catch {} };
  const save   = () => {
    try {
      const slim = segs.map(s => ({ aum:s.aum, nnm:s.nnm, yld:s.yld, ci:s.ci, rev:s.rev, mult:s.mult, bear:s.bear, bull:s.bull }));
      localStorage.setItem(lsKey, JSON.stringify(slim));
    } catch {}
    setSavedOk(true); setTimeout(() => setSavedOk(false), 1800);
  };

  // Computed rows for current state
  const calc = useMemo(() => {
    const rows = segs.map(s => ({ ...s, ...calcSegment(s) }));
    const totalPAT  = rows.reduce((a, r) => a + r.pat, 0);
    const totalRev  = rows.reduce((a, r) => a + r.revenue, 0);
    const totalAUM  = rows.reduce((a, r) => a + (r.type === "fixed" ? 0 : r.closingAUM), 0);
    const totalVal  = rows.reduce((a, r) => a + r.value, 0);
    const blended   = totalPAT > 0 ? totalVal / totalPAT : 0;
    const tp        = totalVal / company.shares;
    const upside    = (tp / company.cmp - 1) * 100;
    return { rows, totalPAT, totalRev, totalAUM, totalVal, blended, tp, upside };
  }, [segs, company.shares, company.cmp]);

  const TABS = [
    { id:"overview",     label:"Overview"          },
    { id:"sotp",         label:"Inputs & SOTP"     },
    { id:"funnel",       label:"Revenue Funnel"    },
    { id:"sensitivity",  label:"Sensitivity"       },
    { id:"methodology",  label:"Methodology"       },
  ];

  return <div className="min-h-screen bg-gray-50">
    {/* HEADER */}
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{company.name}</h1>
          <p className="text-blue-300 text-sm mt-1 font-medium">{company.sub}</p>
        </div>
        <div className="text-right">
          <div className="text-blue-300 text-xs font-medium uppercase tracking-wider">CMP / Base TP</div>
          <div className="text-2xl font-extrabold">₹{company.cmp.toLocaleString("en-IN")} <span className={calc.upside >= 0 ? "text-green-400" : "text-red-400"}>→ ₹{calc.tp.toFixed(0)}</span></div>
          <div className="text-blue-300 text-xs mt-0.5">{calc.upside >= 0 ? "▲" : "▼"} {Math.abs(calc.upside).toFixed(1)}% to base · Blended {calc.blended.toFixed(1)}x</div>
        </div>
      </div>
    </div>

    {/* TABS */}
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 flex gap-0.5 overflow-x-auto">
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${tab===t.id?"border-blue-600 text-blue-700 bg-blue-50/60":"border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{t.label}</button>)}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-6">
      {tab === "overview"    && <OverviewTab calc={calc} company={company} snapshot={snapshot} />}
      {tab === "sotp"        && <SOTPTab calc={calc} segs={segs} updSeg={updSeg} reset={reset} save={save} savedOk={savedOk} company={company} />}
      {tab === "funnel"      && <FunnelTab calc={calc} />}
      {tab === "sensitivity" && <SensitivityTab segs={segs} company={company} />}
      {tab === "methodology" && <MethodologyTab company={company} snapshot={snapshot} />}
    </div>
  </div>;
}

// ═══ OVERVIEW ═══
function OverviewTab({ calc, company, snapshot }) {
  const aumMix = calc.rows.filter(r => r.type !== "fixed").map((r, i) => ({ name:r.name, value:r.closingAUM, fill:r.color || SEG_COLORS[i % SEG_COLORS.length] }));
  const patMix = calc.rows.map((r, i) => ({ name:r.name, value:Math.max(r.pat, 0), fill:r.color || SEG_COLORS[i % SEG_COLORS.length] }));

  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Blended Multiple" value={`${calc.blended.toFixed(1)}x`} sub="PAT-weighted" color={C.accent} />
      <KPI label="Base Target Price" value={`₹${calc.tp.toFixed(0)}`} sub={`${calc.upside >= 0 ? "+" : ""}${calc.upside.toFixed(1)}% vs CMP`} trend={calc.upside >= 0 ? "up" : "down"} color={C.green} />
      <KPI label="FY26E PAT" value={`₹${fmt(calc.totalPAT, 0)} Cr`} sub={`${calc.rows.length} segments`} color={C.purple} />
      <KPI label="Closing AUM" value={`₹${(calc.totalAUM/1000).toFixed(1)}K Cr`} sub="Total client + lending assets" color={C.teal} />
    </div>

    <Sec title="Platform Snapshot" sub={snapshot.subtitle}>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {snapshot.tiles.map((t, i) => <div key={i}>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t.title}</p>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t.body }} />
          </div>)}
        </div>
      </Card>
    </Sec>

    <Sec title="AUM & PAT Mix" sub="Visual breakdown by segment">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CT>AUM Mix (₹ Cr)</CT>
          <CW h={280}>
            <PieChart>
              <Pie data={aumMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={(e) => `${e.name}: ${(e.percent*100).toFixed(0)}%`} labelLine={false}>
                {aumMix.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              {tip}
            </PieChart>
          </CW>
        </Card>
        <Card>
          <CT>PAT Mix (₹ Cr)</CT>
          <CW h={280}>
            <PieChart>
              <Pie data={patMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={(e) => `${e.name}: ${(e.percent*100).toFixed(0)}%`} labelLine={false}>
                {patMix.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              {tip}
            </PieChart>
          </CW>
        </Card>
      </div>
    </Sec>

    <Sec title="Segment Valuation Stack (₹ Cr)" sub="PAT × Target Multiple per segment">
      <Card>
        <CW h={300}>
          <BarChart data={calc.rows.map((r, i) => ({ name:r.name, value:Math.round(r.value), fill:r.color || SEG_COLORS[i % SEG_COLORS.length] }))} layout="vertical" margin={{left:140, right:30}}>
            {grid}
            <XAxis type="number" tick={{fontSize:10}} />
            <YAxis dataKey="name" type="category" tick={{fontSize:10}} width={140} />
            {tip}
            <Bar dataKey="value" name="Segment Value (₹ Cr)" radius={[0,4,4,0]}>
              {calc.rows.map((r, i) => <Cell key={i} fill={r.color || SEG_COLORS[i % SEG_COLORS.length]} />)}
              <LabelList dataKey="value" position="right" formatter={v => `₹${fmt(v,0)}`} style={{fontSize:10, fontWeight:600, fill:"#374151"}} />
            </Bar>
          </BarChart>
        </CW>
      </Card>
    </Sec>
  </div>;
}

// ═══ SOTP TAB — Inputs sidebar (left) + SOTP Summary (right) ═══
function SOTPTab({ calc, segs, updSeg, reset, save, savedOk, company }) {
  const inp = "border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 w-20 text-right tabular-nums";
  const inpBlue   = `${inp} bg-blue-50 border-blue-200 text-blue-800 focus:ring-blue-400`;
  const inpAmber  = `${inp} bg-amber-50 border-amber-200 text-amber-800 focus:ring-amber-400`;
  const inpGreen  = `${inp} bg-emerald-50 border-emerald-200 text-emerald-800 focus:ring-emerald-400`;
  const inpPurple = `${inp} bg-purple-50 border-purple-200 text-purple-800 focus:ring-purple-400`;

  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Base TP" value={`₹${calc.tp.toFixed(0)}`} sub={`${calc.upside >= 0 ? "+" : ""}${calc.upside.toFixed(1)}% upside`} trend={calc.upside >= 0 ? "up" : "down"} color={C.accent} />
      <KPI label="Total PAT" value={`₹${fmt(calc.totalPAT, 0)} Cr`} sub="Sum across segments" color={C.green} />
      <KPI label="Blended Multiple" value={`${calc.blended.toFixed(1)}x`} sub="PAT-weighted" color={C.purple} />
      <KPI label="Total Enterprise Value" value={`₹${(calc.totalVal/1000).toFixed(1)}K Cr`} sub={`÷ ${company.shares.toFixed(1)} Cr shares`} color={C.teal} />
    </div>

    <div className="flex justify-end gap-2">
      <button onClick={reset} className="px-3 py-1.5 rounded text-xs font-semibold bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">Reset to defaults</button>
      <button onClick={save} className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${savedOk ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>{savedOk ? "✓ Saved!" : "Save Inputs"}</button>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* LEFT: Inputs Sidebar (1/3) */}
      <div className="xl:col-span-1">
        <Card className="sticky top-20">
          <CT>Inputs · Segment Drivers</CT>
          <p className="text-xs text-gray-500 mb-3">Edit AUM, NNM, blended yields (bps), cost-to-income (%) and exit multiple per segment. PAT is calculated automatically.</p>
          <div className="space-y-4">
            {segs.map((s, i) => <div key={s.id} className="border-l-4 pl-3 py-1" style={{borderColor: s.color || SEG_COLORS[i % SEG_COLORS.length]}}>
              <p className="text-xs font-bold text-gray-800">{s.name}</p>
              <p className="text-[10px] text-gray-500 mb-2">{s.note}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {s.type !== "fixed" && <>
                  <label className="flex flex-col gap-0.5"><span className="text-gray-500">AUM (₹ Cr)</span>
                    <input type="number" step="1000" value={s.aum} onChange={e => updSeg(i, "aum", e.target.value)} className={inpBlue} />
                  </label>
                  <label className="flex flex-col gap-0.5"><span className="text-gray-500">NNM (₹ Cr)</span>
                    <input type="number" step="500" value={s.nnm} onChange={e => updSeg(i, "nnm", e.target.value)} className={inpGreen} />
                  </label>
                  <label className="flex flex-col gap-0.5"><span className="text-gray-500">{s.type === "nii" ? "Spread (bps)" : "Yield (bps)"}</span>
                    <input type="number" step="0.5" value={s.yld} onChange={e => updSeg(i, "yld", e.target.value)} className={inpAmber} />
                  </label>
                </>}
                {s.type === "fixed" && <label className="flex flex-col gap-0.5 col-span-2"><span className="text-gray-500">Revenue (₹ Cr)</span>
                  <input type="number" step="50" value={s.rev} onChange={e => updSeg(i, "rev", e.target.value)} className={inpBlue} />
                </label>}
                <label className="flex flex-col gap-0.5"><span className="text-gray-500">Cost / Income (%)</span>
                  <input type="number" step="1" min="0" max="100" value={s.ci} onChange={e => updSeg(i, "ci", e.target.value)} className={inpAmber} />
                </label>
                <label className="flex flex-col gap-0.5"><span className="text-gray-500">Multiple (x)</span>
                  <input type="number" step="0.5" min="0" value={s.mult} onChange={e => updSeg(i, "mult", e.target.value)} className={inpPurple} />
                </label>
              </div>
            </div>)}
          </div>
        </Card>
      </div>

      {/* RIGHT: SOTP Summary Table (2/3) */}
      <div className="xl:col-span-2">
        <Card>
          <CT>Segmented SOTP Summary</CT>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800 text-gray-700">
                  <th className="text-left py-2 px-2 font-bold">Segment</th>
                  <th className="text-right py-2 px-2 font-bold">Type</th>
                  <th className="text-right py-2 px-2 font-bold">Avg AUM</th>
                  <th className="text-right py-2 px-2 font-bold">Revenue</th>
                  <th className="text-right py-2 px-2 font-bold text-amber-700">CI %</th>
                  <th className="text-right py-2 px-2 font-bold text-emerald-700">PAT</th>
                  <th className="text-right py-2 px-2 font-bold text-purple-700">Mult</th>
                  <th className="text-right py-2 px-2 font-bold text-blue-700">EV</th>
                  <th className="text-right py-2 px-2 font-bold">₹/sh</th>
                </tr>
              </thead>
              <tbody>
                {calc.rows.map((r, i) => <tr key={r.id} className="border-b border-gray-100 bg-blue-50/40">
                  <td className="py-2 px-2 font-semibold" style={{color: r.color || SEG_COLORS[i % SEG_COLORS.length]}}>{r.name}</td>
                  <td className="text-right py-2 px-2 text-xs text-gray-500 uppercase">{r.type}</td>
                  <td className="text-right py-2 px-2 tabular-nums">{r.type === "fixed" ? "—" : fmt(r.avgAUM, 0)}</td>
                  <td className="text-right py-2 px-2 tabular-nums">{fmt(r.revenue, 0)}</td>
                  <td className="text-right py-2 px-2 text-amber-700 tabular-nums">{r.ci.toFixed(0)}%</td>
                  <td className="text-right py-2 px-2 text-emerald-700 font-semibold tabular-nums">{fmt(r.pat, 0)}</td>
                  <td className="text-right py-2 px-2 text-purple-700 tabular-nums">{r.mult.toFixed(1)}x</td>
                  <td className="text-right py-2 px-2 text-blue-700 font-semibold tabular-nums">{fmt(r.value, 0)}</td>
                  <td className="text-right py-2 px-2 tabular-nums">₹{(r.value / company.shares).toFixed(0)}</td>
                </tr>)}
                <tr className="border-t-2 border-gray-800 bg-gray-50 font-bold">
                  <td className="py-3 px-2" colSpan={3}>Total / Blended</td>
                  <td className="text-right py-3 px-2 tabular-nums">{fmt(calc.totalRev, 0)}</td>
                  <td className="text-right py-3 px-2"></td>
                  <td className="text-right py-3 px-2 text-emerald-700 tabular-nums">{fmt(calc.totalPAT, 0)}</td>
                  <td className="text-right py-3 px-2 text-purple-700 tabular-nums">{calc.blended.toFixed(1)}x</td>
                  <td className="text-right py-3 px-2 text-blue-700 tabular-nums">{fmt(calc.totalVal, 0)}</td>
                  <td className="text-right py-3 px-2 tabular-nums">₹{calc.tp.toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4">
          <Card>
            <CT>Segment EV Stack (₹/share contribution)</CT>
            <CW h={280}>
              <BarChart data={calc.rows.map((r, i) => ({ name:r.name, sh:+(r.value/company.shares).toFixed(0), fill:r.color || SEG_COLORS[i % SEG_COLORS.length] }))} margin={{top:20, bottom:60}}>
                {grid}
                <XAxis dataKey="name" tick={{fontSize:10}} angle={-25} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{fontSize:10}} />
                {tip}
                <Bar dataKey="sh" name="₹/share" radius={[4,4,0,0]}>
                  {calc.rows.map((r, i) => <Cell key={i} fill={r.color || SEG_COLORS[i % SEG_COLORS.length]} />)}
                  <LabelList dataKey="sh" position="top" formatter={v => `₹${v}`} style={{fontSize:10, fontWeight:700, fill:"#374151"}} />
                </Bar>
              </BarChart>
            </CW>
          </Card>
        </div>
      </div>
    </div>
  </div>;
}

// ═══ FUNNEL TAB — AUM → Revenue → Opex → PAT → EV waterfall per segment ═══
function FunnelTab({ calc }) {
  const data = calc.rows.map((r, i) => ({
    name: r.name,
    Revenue: +r.revenue.toFixed(0),
    Opex: +r.opex.toFixed(0),
    PAT: +r.pat.toFixed(0),
    EV: +r.value.toFixed(0),
    fill: r.color || SEG_COLORS[i % SEG_COLORS.length],
  }));

  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Total Revenue" value={`₹${fmt(calc.totalRev, 0)} Cr`} sub="Sum across segments" color={C.accent} />
      <KPI label="Total PAT" value={`₹${fmt(calc.totalPAT, 0)} Cr`} sub="After-tax (25.17% rate)" color={C.green} />
      <KPI label="Implied PAT Margin" value={`${(calc.totalPAT / calc.totalRev * 100).toFixed(1)}%`} sub="Total PAT ÷ Total Revenue" color={C.purple} />
      <KPI label="EV / PAT" value={`${calc.blended.toFixed(1)}x`} sub="Blended exit multiple" color={C.amber} />
    </div>

    <Sec title="Revenue → PAT → EV per Segment" sub="The dynamic funnel: how AUM × Yield flows to PAT and target value">
      <Card>
        <CW h={360}>
          <BarChart data={data} margin={{top:30, bottom:70}}>
            {grid}
            <XAxis dataKey="name" tick={{fontSize:10}} angle={-22} textAnchor="end" height={70} interval={0} />
            <YAxis tick={{fontSize:10}} />
            {tip}{leg}
            <Bar dataKey="Revenue" fill={C.accent} radius={[3,3,0,0]} />
            <Bar dataKey="PAT" fill={C.green} radius={[3,3,0,0]} />
            <Bar dataKey="EV" fill={C.purple} radius={[3,3,0,0]} />
          </BarChart>
        </CW>
      </Card>
    </Sec>

    <Sec title="Per-Segment Funnel Details" sub="Step-by-step revenue derivation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calc.rows.map((r, i) => <Card key={r.id}>
          <CT><span style={{color: r.color || SEG_COLORS[i % SEG_COLORS.length]}}>{r.name}</span></CT>
          <table className="w-full text-xs">
            <tbody>
              {r.type !== "fixed" && <>
                <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Opening AUM</td><td className="text-right tabular-nums">₹{fmt(r.aum, 0)} Cr</td></tr>
                <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">+ Net New Money</td><td className="text-right tabular-nums text-emerald-600">+ ₹{fmt(r.nnm, 0)} Cr</td></tr>
                <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Closing AUM</td><td className="text-right tabular-nums font-semibold">₹{fmt(r.closingAUM, 0)} Cr</td></tr>
                <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Avg AUM</td><td className="text-right tabular-nums">₹{fmt(r.avgAUM, 0)} Cr</td></tr>
                <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">× {r.type === "nii" ? "Spread" : "Yield"}</td><td className="text-right tabular-nums">{r.yld} bps</td></tr>
              </>}
              {r.type === "fixed" && <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Revenue (input)</td><td className="text-right tabular-nums">₹{fmt(r.rev, 0)} Cr</td></tr>}
              <tr className="border-b border-gray-200 bg-blue-50/40"><td className="py-1.5 font-semibold">= Revenue</td><td className="text-right tabular-nums font-bold text-blue-700">₹{fmt(r.revenue, 0)} Cr</td></tr>
              <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">− Opex (CI {r.ci}%)</td><td className="text-right tabular-nums text-red-500">− ₹{fmt(r.opex, 0)} Cr</td></tr>
              <tr className="border-b border-gray-100"><td className="py-1.5 font-semibold">= PBT</td><td className="text-right tabular-nums">₹{fmt(r.pbt, 0)} Cr</td></tr>
              <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">− Tax @ 25.17%</td><td className="text-right tabular-nums text-red-500">− ₹{fmt(r.pbt * TAX, 0)} Cr</td></tr>
              <tr className="border-b border-gray-200 bg-emerald-50/40"><td className="py-1.5 font-semibold">= PAT</td><td className="text-right tabular-nums font-bold text-emerald-700">₹{fmt(r.pat, 0)} Cr</td></tr>
              <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">× Multiple</td><td className="text-right tabular-nums">{r.mult.toFixed(1)}x</td></tr>
              <tr className="bg-purple-50/40"><td className="py-1.5 font-semibold">= Enterprise Value</td><td className="text-right tabular-nums font-bold text-purple-700">₹{fmt(r.value, 0)} Cr</td></tr>
            </tbody>
          </table>
        </Card>)}
      </div>
    </Sec>
  </div>;
}

// ═══ SENSITIVITY TAB — 5×5 grid: AUM growth × Exit multiple delta → ₹/share ═══
function SensitivityTab({ segs, company }) {
  const aumDeltas = [-10, -5, 0, 5, 10];      // % change in AUM growth (applied to NNM, or scales avg AUM)
  const multDeltas = [-10, -5, 0, 5, 10];     // x change in exit multiple (applied per segment)

  const grid5 = multDeltas.map(md => aumDeltas.map(ad => {
    const totalVal = segs.reduce((acc, s) => {
      const aumScale = 1 + ad / 100;
      const ov = s.type === "fixed"
        ? { rev: s.rev * aumScale, mult: Math.max(s.mult + md, 0) }
        : { aum: s.aum * aumScale, nnm: s.nnm * aumScale, mult: Math.max(s.mult + md, 0) };
      return acc + calcSegment(s, ov).value;
    }, 0);
    return totalVal / company.shares;
  }));

  // Color scale
  const flat = grid5.flat();
  const min = Math.min(...flat), max = Math.max(...flat);
  const colorFor = v => {
    const t = (v - min) / (max - min || 1);
    // red (low) → amber (mid) → green (high), interpolate via HSL
    const hue = 0 + t * 130;  // 0=red, 60=yellow, 130=green
    return `hsl(${hue}, 70%, 92%)`;
  };
  const textColorFor = v => v >= company.cmp ? "text-emerald-800" : "text-red-700";

  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Min TP" value={`₹${Math.round(min)}`} sub="Bear corner (low AUM, low mult)" color={C.red} />
      <KPI label="Max TP" value={`₹${Math.round(max)}`} sub="Bull corner (high AUM, high mult)" color={C.green} />
      <KPI label="CMP" value={`₹${company.cmp.toLocaleString("en-IN")}`} sub="For comparison" color={C.slate} />
      <KPI label="Range" value={`±${Math.round((max-min)/2)}`} sub="₹ from midpoint" color={C.purple} />
    </div>

    <Sec title="Share Price Sensitivity (₹/share)" sub="X = AUM growth delta · Y = Exit multiple delta (x). Cells above CMP are green, below are red.">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-semibold text-gray-500 text-right">Mult Δ ↓ &nbsp; AUM Δ →</th>
                {aumDeltas.map(ad => <th key={ad} className="p-2 text-xs font-bold text-gray-700 text-center bg-blue-50 border border-blue-100">{ad > 0 ? `+${ad}` : ad}%</th>)}
              </tr>
            </thead>
            <tbody>
              {multDeltas.map((md, mi) => <tr key={md}>
                <th className="p-2 text-xs font-bold text-gray-700 text-right bg-purple-50 border border-purple-100">{md > 0 ? `+${md}` : md}x</th>
                {grid5[mi].map((v, ai) => <td key={ai} className={`p-3 text-center font-semibold tabular-nums border border-gray-200 ${textColorFor(v)}`} style={{background: colorFor(v)}}>
                  ₹{Math.round(v).toLocaleString("en-IN")}
                </td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </Sec>

    <Sec title="Reading the Matrix" sub="Each cell shows the implied target price under that scenario combination">
      <Card>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
          <li><b>Center cell (0%, 0x)</b> equals the base-case TP from the SOTP tab.</li>
          <li><b>X-axis</b> scales each segment's opening AUM and NNM by the listed % (proxy for AUM growth surprise).</li>
          <li><b>Y-axis</b> shifts each segment's exit multiple by the listed delta uniformly.</li>
          <li>Use the matrix to test how robust the rating is to multiple compression and AUM disappointment.</li>
        </ul>
      </Card>
    </Sec>
  </div>;
}

// ═══ METHODOLOGY ═══
function MethodologyTab({ company, snapshot }) {
  return <div className="space-y-6">
    <Sec title="Valuation Framework">
      <Card>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li><b>PAT-weighted SOTP:</b> Each segment is valued independently as PAT × target multiple; consolidated EV = Σ segment values; per-share TP = EV ÷ shares outstanding ({company.shares.toFixed(2)} Cr).</li>
          <li><b>Fee-driven segments</b> (Wealth, Asset Management): Revenue = Avg AUM × yield (bps). Avg AUM = (Opening + Closing) ÷ 2; Closing = Opening + NNM.</li>
          <li><b>NII / Lending segments</b>: Revenue = Avg Loan Book × spread (bps). Loan growth treated identically to AUM growth.</li>
          <li><b>Fixed-revenue segments</b> (Capital Markets, IB): Revenue is direct input; not derived from AUM.</li>
          <li><b>PAT</b> = Revenue × (1 − CI%) × (1 − 25.17% tax rate).</li>
          <li><b>Multiples</b> reflect segment quality: asset-services / pure WM at 35–42x; AMC at 28–35x; lending NII at 12–15x; capital markets at 15–20x.</li>
        </ul>
      </Card>
    </Sec>
    <Sec title="Snapshot Notes">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {snapshot.tiles.map((t, i) => <div key={i}>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t.title}</p>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: t.body }} />
          </div>)}
        </div>
      </Card>
    </Sec>
  </div>;
}
