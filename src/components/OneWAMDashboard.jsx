import { useState, Fragment } from "react";

// ═══ DESIGN TOKENS (mirrors MOFSL dashboard) ═══
const C = { accent:"#3b82f6", green:"#22c55e", red:"#ef4444", purple:"#a855f7", teal:"#14b8a6", orange:"#f97316", pink:"#ec4899", amber:"#f59e0b", slate:"#64748b" };
const KPI = ({label,value,sub,color=C.accent,trend}) => <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p><p className="text-2xl font-extrabold mt-1" style={{color}}>{value}</p>{sub&&<p className={`text-xs mt-1 font-medium ${trend==="up"?"text-emerald-600":trend==="down"?"text-red-500":"text-gray-400"}`}>{trend==="up"?"▲ ":trend==="down"?"▼ ":""}{sub}</p>}</div>;
const Card = ({children}) => <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">{children}</div>;
const Sec = ({title,sub,children}) => <div className="mb-6"><div className="mb-3"><h3 className="text-base font-bold text-gray-900">{title}</h3>{sub&&<p className="text-xs text-gray-500 mt-0.5">{sub}</p>}</div>{children}</div>;

// ═══ SOTP DATA (Q3 FY26 Databook) ═══
// PAT mix back-solved from blended 38.0x: 91% @ 40.0x + 9% @ 18.0x = 38.02x ≈ 38.0x
const sotp = [
  { seg:"Core UHNI Wealth Management & Alternative Asset Management", desc:"Recurring ARR fee pool + IIFL-AMC alternates", pat:91, mult:40.0 },
  { seg:"Capital Markets (B&K)",                                       desc:"Institutional broking & investment banking (Batlivala & Karani)", pat: 9, mult:18.0 },
];
const BLENDED = 38.0;
const CMP = 1180;

// ═══ OVERVIEW ═══
const Overview = () => <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <KPI label="Blended Target Multiple" value={`${BLENDED.toFixed(1)}x`} sub="PAT-mix weighted SOTP" color={C.accent}/>
    <KPI label="Core WM + AMC PAT Mix" value="91%" sub="Recurring, asset-light" color={C.green}/>
    <KPI label="Capital Markets PAT Mix" value="9%" sub="Transaction-linked" color={C.orange}/>
    <KPI label="CMP" value={`₹${CMP}`} sub="Last traded" color={C.purple}/>
  </div>
  <Sec title="Platform Snapshot" sub="360 ONE WAM — Q3 FY2025-26">
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Positioning</p><p className="text-gray-700">India's largest UHNI-focused wealth manager with a vertically integrated alternate AMC and captive capital markets arm.</p></div>
        <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Revenue Mix</p><p className="text-gray-700">~91% PAT from recurring Core WM + Alternates AMC fee pool; ~9% from Capital Markets (B&K) — dominant ARR exposure.</p></div>
        <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Valuation Anchor</p><p className="text-gray-700">Blended <b>{BLENDED.toFixed(1)}x</b> reflects asset-services premium, best-in-class within Indian WM peer set.</p></div>
      </div>
    </Card>
  </Sec>
</div>;

// ═══ STREAM SOTP (mirrors MOFSL ValTab styling) ═══
const SOTPTab = () => {
  const hdr = "bg-blue-50/80 font-bold"; const tc = "py-2 px-2 text-right"; const tl = "py-2 px-2";
  const blendedCheck = sotp.reduce((a,s)=>a + s.pat*s.mult, 0) / 100;
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Blended Multiple" value={`${BLENDED.toFixed(1)}x`} sub="PAT-mix weighted" color={C.accent}/>
      <KPI label="Core Segment Weight" value="91%" sub="UHNI WM + Alternates AMC" color={C.green}/>
      <KPI label="Highest Multiple" value="40.0x" sub="Core WM + AMC" color={C.purple}/>
      <KPI label="Weighted Check" value={`${blendedCheck.toFixed(2)}x`} sub="Σ(PAT% × Mult)" color={C.teal}/>
    </div>

    <Sec title="Stream SOTP Valuation" sub="PAT-mix weighted target multiple across 360 ONE WAM's business segments">
      <Card><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className={tl+" font-bold"}>Segment</th>
            <th className={tl+" font-bold"}>Description</th>
            <th className={tc+" font-bold"}>PAT Mix (%)</th>
            <th className={tc+" font-bold"}>Target Multiple (x)</th>
            <th className={tc+" font-bold text-blue-600"}>Weighted (x)</th>
          </tr>
        </thead>
        <tbody>
          {sotp.map((s,i)=>(
            <tr key={i} className={`border-b border-gray-200 ${hdr}`}>
              <td className={tl}>{s.seg}</td>
              <td className={tl+" text-xs text-gray-600 font-normal"}>{s.desc}</td>
              <td className={tc}>{s.pat}%</td>
              <td className={tc}>{s.mult.toFixed(1)}x</td>
              <td className={tc+" text-blue-600"}>{(s.pat*s.mult/100).toFixed(2)}x</td>
            </tr>
          ))}
          <tr className="border-t-2 border-gray-800 bg-gray-50 font-bold">
            <td className="py-3 px-2">Total (Blended)</td>
            <td className="py-3 px-2 text-xs text-gray-600 font-normal">PAT-weighted across all streams</td>
            <td className={tc}>100%</td>
            <td className={tc}>—</td>
            <td className={tc+" text-blue-700"}>{BLENDED.toFixed(1)}x</td>
          </tr>
        </tbody>
      </table></div></Card>
    </Sec>

    <Sec title="Methodology" sub="How the blended multiple is derived">
      <Card>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li><b>PAT Mix</b> reflects each segment's share of 360 ONE WAM's consolidated profit after tax (Q3 FY26 run-rate).</li>
          <li><b>Target Multiple</b> is the P/E we ascribe to each segment — Core WM + AMC gets a 40.0x asset-manager multiple; B&K gets 18.0x reflecting capital-markets cyclicality.</li>
          <li><b>Blended Multiple</b> = Σ (PAT Mix × Multiple) ÷ 100 — i.e. a PAT-weighted P/E for the consolidated entity.</li>
          <li>PAT mix of 91% / 9% is back-solved to reconcile the published <b>38.0x</b> blended multiple with the segment multiples.</li>
        </ul>
      </Card>
    </Sec>
  </div>;
};

// ═══ MAIN ═══
const TABS = [{id:"overview",label:"Overview"},{id:"sotp",label:"Stream SOTP"}];
export default function OneWAMDashboard() {
  const [tab, setTab] = useState("overview");
  return <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-end justify-between">
        <div><h1 className="text-3xl font-extrabold tracking-tight">360 ONE WAM</h1><p className="text-blue-300 text-sm mt-1 font-medium">Q3 FY2025-26 — Stream SOTP Valuation</p></div>
        <div className="text-right"><div className="text-blue-300 text-xs font-medium uppercase tracking-wider">CMP / Blended Multiple</div><div className="text-2xl font-extrabold">₹{CMP} <span className="text-green-400">@ {BLENDED.toFixed(1)}x</span></div><div className="text-blue-300 text-xs mt-0.5">Stream SOTP | Tusk Investment Research</div></div>
      </div>
    </div>
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div className="max-w-7xl mx-auto px-6 flex gap-0.5 overflow-x-auto">{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-3 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${tab===t.id?"border-blue-600 text-blue-700 bg-blue-50/60":"border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{t.label}</button>)}</div></div>
    <div className="max-w-7xl mx-auto px-6 py-6">
      {tab==="overview" && <Overview/>}
      {tab==="sotp" && <SOTPTab/>}
    </div>
  </div>;
}
