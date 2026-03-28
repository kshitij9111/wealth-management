import { useState, Fragment } from "react";
import { BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";

const MC="#3b82f6",NC="#a855f7",TC="#22c55e",M2="#93c5fd",N2="#d8b4fe",T2="#86efac";
const AR="#8b5cf6",TB="#f59e0b",OC="#94a3b8";
const fmt=(v,d=1)=>{if(v==null)return"—";if(Math.abs(v)>=100000)return`${(v/1000).toFixed(0)}K`;return typeof v==="number"?v.toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d}):v};
const pct=v=>v==null?"—":`${v.toFixed(1)}%`;
const yoy=(c,p)=>p>0?`${((c/p-1)*100).toFixed(1)}%`:"—";
const calcYoY=(c,p)=>(p&&p!==0)?+((c-p)/Math.abs(p)*100).toFixed(1):null;
const calcCAGR=(end,start,yrs)=>(start>0&&end>0)?+((Math.pow(end/start,1/yrs)-1)*100).toFixed(1):null;
const gwth=v=>v==null?"—":`${v>0?"▲ ":"▼ "}${Math.abs(v).toFixed(1)}%`;
const bl=(k,p="inside",min=50)=><LabelList dataKey={k} position={p} fill="#fff" fontSize={9} fontWeight={600} formatter={v=>Math.abs(v||0)>=min?fmt(v,0):""}/>;
const Tip=({active,payload,label})=>{if(!active||!payload)return null;return<div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-gray-700"><p className="font-bold mb-1 text-gray-300">{label}</p>{payload.map((p,i)=><p key={i} className="flex justify-between gap-6"><span style={{color:p.color}}>{p.name}</span><span className="font-semibold text-white">{fmt(p.value)}</span></p>)}</div>};
const KPI=({label,value,sub,color=MC,trend})=><div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p><p className="text-2xl font-extrabold mt-1" style={{color}}>{value}</p>{sub&&<p className={`text-xs mt-1 font-medium ${trend==="up"?"text-emerald-600":trend==="down"?"text-red-500":"text-gray-400"}`}>{trend==="up"?"▲ ":trend==="down"?"▼ ":""}{sub}</p>}</div>;
const Card=({children,className=""})=><div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>;
const CT=({children})=><h4 className="text-sm font-bold text-gray-700 mb-3">{children}</h4>;
const Sec=({title,sub,children})=><div className="mb-6"><div className="mb-3"><h3 className="text-base font-bold text-gray-900">{title}</h3>{sub&&<p className="text-xs text-gray-500 mt-0.5">{sub}</p>}</div>{children}</div>;
const CW=({h=280,children})=><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>;
const xFY={dataKey:"fy",tick:{fontSize:11}};const yL={tick:{fontSize:10}};
const G=<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>;const L=<Legend wrapperStyle={{fontSize:10}}/>;const T=<Tooltip content={<Tip/>}/>;

// ━━━ DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const con = [
  {fy:"FY24",mRev:3944,nRev:2063,tRev:1965,tARR:1327,tTBR:519,tOI:119,mOP:1542,nOP:594,tOP:667,mNW:8732,nNW:2895,tNW:3450,mROE:35.1,nROE:24,tROE:24,mCI:48,nCI:62,tCI:49},
  {fy:"FY25",mRev:5178,nRev:2901,tRev:2652,tARR:1701,tTBR:744,tOI:207,mOP:2029,nOP:978,tOP:921,mNW:11079,nNW:3490,tNW:7065,mROE:25.2,nROE:32,tROE:21,mCI:48,nCI:55,tCI:46},
  {fy:"FY26E",mRev:6147,nRev:3063,tRev:3153,tARR:2245,tTBR:729,tOI:179,mOP:2327,nOP:1032,tOP:1081,mNW:13632,nNW:3837,tNW:9349,mROE:25.5,nROE:28,tROE:14,mCI:48,nCI:55,tCI:49},
];

// Wealth with ARR/TBR
const wth = [
  {fy:"FY24",mRev:2496,nRev:1188,tRev:1469,mARR:1065,mTBR:1425,nARR:779,nTBR:345,nOth:64,tARR:844,tTBR:519,tOth:107,mAUM:325712,nAUM:247835,tAUM:394661,mPAT:863,nPBT:416,tPBT:750,mCI:55,nCI:65,tCI:49},
  {fy:"FY25",mRev:3260,nRev:1428,tRev:2023,mARR:1399,mTBR:1857,nARR:940,nTBR:408,nOth:80,tARR:1101,tTBR:744,tOth:177,mAUM:409133,nAUM:293298,tAUM:497104,mPAT:1103,nPBT:475,tPBT:896,mCI:54,nCI:67,tCI:47},
  {fy:"FY26E",mRev:3354,nRev:1660,tRev:2346,mARR:1671,mTBR:1682,nARR:1186,nTBR:398,nOth:76,tARR:1482,tTBR:729,tOth:135,mAUM:514086,nAUM:329047,tAUM:612449,mPAT:1072,nPBT:570,tPBT:999,mCI:55,nCI:65,tCI:52},
];
const arrPct=wth.map(w=>({fy:w.fy,mPct:+(w.mARR/w.mRev*100).toFixed(1),nPct:+(w.nARR/w.nRev*100).toFixed(1),tPct:+(w.tARR/w.tRev*100).toFixed(1)}));

// ★ WEALTH REVENUE COMPONENT SPLIT ★
// MOFSL WM+PWM: NII, Distribution, Brokerage, Other (from quarterly databook, annualized for FY26E)
// Nuvama Wealth+Private: Managed Products (MPIS+Pvt MgdProd), NII, Broking+Transactional, Other
// 360ONE: Only splits ARR vs TBR (no further component breakdown in databook)
const wComp = [
  {fy:"FY24",mNII:797,mDist:459,mBrok:1104,mOth:136, nMgd:521,nNII:225,nBrok:345,nOth:97, tARR:844,tBrok:519,tOth:107},
  {fy:"FY25",mNII:1109,mDist:820,mBrok:1190,mOth:141, nMgd:625,nNII:274,nBrok:408,nOth:121, tARR:1101,tBrok:744,tOth:177},
  {fy:"FY26E",mNII:1253,mDist:948,mBrok:1010,mOth:143, nMgd:850,nNII:293,nBrok:398,nOth:119, tARR:1482,tBrok:729,tOth:135},
];
// Broking % of total wealth revenue
const brokPct = wComp.map((w,i)=>({fy:w.fy,mPct:+(w.mBrok/wth[i].mRev*100).toFixed(1),nPct:+(w.nBrok/wth[i].nRev*100).toFixed(1),tPct:+(w.tBrok/wth[i].tRev*100).toFixed(1)}));

// AM segment
const am = [
  {fy:"FY24",mRev:742,nRev:63,tRev:496,mARR:550,mOth:192,nARR:45,nOth:18,tARR:483,tOth:13,mAUM:81858,nAUM:6967,tAUM:72248,mPAT:357,nPBT:-16,tPBT:246},
  {fy:"FY25",mRev:1009,nRev:59,tRev:629,mARR:798,mOth:211,nARR:59,nOth:0,tARR:600,tOth:29,mAUM:133775,nAUM:11307,tAUM:84395,mPAT:516,nPBT:-19,tPBT:332},
  {fy:"FY26E",mRev:1420,nRev:63,tRev:806,mARR:1056,mOth:364,nARR:55,nOth:8,tARR:763,tOth:43,mAUM:188687,nAUM:12605,tAUM:98949,mPAT:732,nPBT:-25,tPBT:442},
];

// Capital Markets
const cm = [
  {fy:"FY24",mRev:435,nAS:329,nCM:476,nTotal:805,mPAT:198,nPBT:376},
  {fy:"FY25",mRev:598,nAS:655,nCM:759,nTotal:1414,mPAT:258,nPBT:855},
  {fy:"FY26E",mRev:787,nAS:701,nCM:637,nTotal:1338,mPAT:348,nPBT:833},
];

// ARR AUM, Lending, Retention — retention computed on ex-lending AUM
const arrAUM = [
  {fy:"FY24",mAvg:37726,mLend:5612,mExL:32114,mRev:1065,mRet:3.32,tAvg:108609,tLend:5899,tExL:102710,tRev:844,tRet:0.82,nPvt:29224,nLoan:4925,nExL:24299,nPvtRev:297,nPvtRet:1.22},
  {fy:"FY25",mAvg:51952,mLend:7287,mExL:44665,mRev:1399,mRet:3.13,tAvg:150110,tLend:7602,tExL:142508,tRev:1101,tRet:0.77,nPvt:40261,nLoan:4719,nExL:35542,nPvtRev:340,nPvtRet:0.96},
  {fy:"FY26E",mAvg:67448,mLend:8461,mExL:58987,mRev:1671,mRet:2.83,tAvg:192358,tLend:9564,tExL:182794,tRev:1482,tRet:0.81,nPvt:49570,nLoan:6979,nExL:42591,nPvtRev:421,nPvtRet:0.99},
];

// Yields & Flows (FY25)
const yields=[{co:"MOFSL",wY:0.89,amY:0.94},{co:"Nuvama",wY:0.53,amY:0.65},{co:"360 ONE",wY:0.45,amY:0.80}];
const flows=[{co:"MOFSL",wF:12279,amF:48779},{co:"Nuvama",wF:15689,amF:4450},{co:"360 ONE",wF:22334,amF:3640}];

// Valuation
const val={mCMP:697,nCMP:6200,tCMP:950,mSh:60.2,nSh:3.8,tSh:40.5,mMc:41959,nMc:23560,tMc:38475};

// ━━━ TABS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Overview=()=>{const C=con[2],P=con[1],F=con[0];return<div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="MOFSL FY26E Rev" value={`₹${fmt(C.mRev,0)} Cr`} sub={`${yoy(C.mRev,P.mRev)} YoY · ${gwth(calcCAGR(C.mRev,F.mRev,2))} 2Y CAGR`} trend="up" color={MC}/>
    <KPI label="Nuvama FY26E Rev" value={`₹${fmt(C.nRev,0)} Cr`} sub={`${yoy(C.nRev,P.nRev)} YoY · ${gwth(calcCAGR(C.nRev,F.nRev,2))} 2Y CAGR`} trend="up" color={NC}/>
    <KPI label="360ONE FY26E Rev" value={`₹${fmt(C.tRev,0)} Cr`} sub={`${yoy(C.tRev,P.tRev)} YoY · ${gwth(calcCAGR(C.tRev,F.tRev,2))} 2Y CAGR`} trend="up" color={TC}/>
    <KPI label="MOFSL OpPAT" value={`₹${fmt(C.mOP,0)} Cr`} sub={`${yoy(C.mOP,P.mOP)} YoY · ${gwth(calcCAGR(C.mOP,F.mOP,2))} 2Y CAGR`} trend="up" color={MC}/>
    <KPI label="Nuvama OpPAT" value={`₹${fmt(C.nOP,0)} Cr`} sub={`${yoy(C.nOP,P.nOP)} YoY · ${gwth(calcCAGR(C.nOP,F.nOP,2))} 2Y CAGR`} trend="up" color={NC}/>
    <KPI label="360ONE OpPAT" value={`₹${fmt(C.tOP,0)} Cr`} sub={`${yoy(C.tOP,P.tOP)} YoY · ${gwth(calcCAGR(C.tOP,F.tOP,2))} 2Y CAGR`} trend="up" color={TC}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Revenue (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mRev")}</Bar><Bar dataKey="nRev" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nRev")}</Bar><Bar dataKey="tRev" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tRev")}</Bar></BarChart></CW></Card>
    <Card><CT>Operating PAT (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mOP" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mOP")}</Bar><Bar dataKey="nOP" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nOP")}</Bar><Bar dataKey="tOP" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tOP")}</Bar></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>360ONE Consolidated ARR vs TBR (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="tARR" name="ARR" fill={AR} stackId="t">{bl("tARR",undefined,200)}</Bar><Bar dataKey="tTBR" name="TBR" fill={TB} stackId="t">{bl("tTBR",undefined,200)}</Bar><Bar dataKey="tOI" name="Other Inc" fill={OC} stackId="t" radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>ROE (%)</CT><CW><ComposedChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%"/>{T}{L}<Line dataKey="mROE" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nROE" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tROE" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Net Worth (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mNW" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mNW",undefined,500)}</Bar><Bar dataKey="nNW" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nNW",undefined,500)}</Bar><Bar dataKey="tNW" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tNW",undefined,500)}</Bar></BarChart></CW></Card>
    <Card><CT>Cost-to-Income (%)</CT><CW><ComposedChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%"/>{T}{L}<Line dataKey="mCI" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nCI" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tCI" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>
</div>};

// ═══ WEALTH TAB — with component split ═══
const WealthTab=()=>{const W=wth[2],aP=arrPct[2],bP=brokPct[2];return<div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="MOFSL Wealth Rev" value={`₹${fmt(W.mRev,0)} Cr`} sub={`ARR ${aP.mPct}%`} color={MC}/>
    <KPI label="Nuvama Wealth Rev" value={`₹${fmt(W.nRev,0)} Cr`} sub={`ARR ${aP.nPct}%`} color={NC}/>
    <KPI label="360ONE Wealth Rev" value={`₹${fmt(W.tRev,0)} Cr`} sub={`ARR ${aP.tPct}%`} color={TC}/>
    <KPI label="MOFSL Broking %" value={`${bP.mPct}%`} sub={`₹${fmt(wComp[2].mBrok,0)} Cr`} trend="down" color={MC}/>
    <KPI label="Nuvama Broking %" value={`${bP.nPct}%`} sub={`₹${fmt(wComp[2].nBrok,0)} Cr`} trend="down" color={NC}/>
    <KPI label="360ONE Broking %" value={`${bP.tPct}%`} sub={`₹${fmt(wComp[2].tBrok,0)} Cr`} trend="down" color={TC}/>
  </div>

  <Sec title="Wealth Revenue Component Split" sub="Brokerage isolated from recurring/spread components (₹ Cr)">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card><CT>MOFSL (WM+PWM)</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mNII" name="NII" fill="#06b6d4" stackId="a">{bl("mNII",undefined,200)}</Bar><Bar dataKey="mDist" name="Distribution" fill={AR} stackId="a">{bl("mDist",undefined,200)}</Bar><Bar dataKey="mBrok" name="Brokerage" fill={TB} stackId="a">{bl("mBrok",undefined,200)}</Bar><Bar dataKey="mOth" name="Other" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Nuvama (Wealth+Private)</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="nMgd" name="Managed Prod" fill={AR} stackId="a">{bl("nMgd",undefined,200)}</Bar><Bar dataKey="nNII" name="NII" fill="#06b6d4" stackId="a">{bl("nNII",undefined,150)}</Bar><Bar dataKey="nBrok" name="Broking+Trans" fill={TB} stackId="a">{bl("nBrok",undefined,200)}</Bar><Bar dataKey="nOth" name="Other" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>360 ONE Wealth</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="tARR" name="ARR (Plus+Dist+NII)" fill={AR} stackId="a">{bl("tARR",undefined,200)}</Bar><Bar dataKey="tBrok" name="TBR / Broking" fill={TB} stackId="a">{bl("tBrok",undefined,200)}</Bar><Bar dataKey="tOth" name="Other Income" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
    </div>
  </Sec>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Broking as % of Wealth Revenue</CT><CW><ComposedChart data={brokPct}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[15,50]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
    <Card><CT>ARR % of Wealth Revenue</CT><CW><ComposedChart data={arrPct}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[30,80]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Wealth AUM (₹ Cr)</CT><CW><BarChart data={wth}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mAUM" name="MOFSL" fill={M2} radius={[3,3,0,0]}>{bl("mAUM",undefined,50000)}</Bar><Bar dataKey="nAUM" name="Nuvama" fill={N2} radius={[3,3,0,0]}>{bl("nAUM",undefined,50000)}</Bar><Bar dataKey="tAUM" name="360 ONE" fill={T2} radius={[3,3,0,0]}>{bl("tAUM",undefined,50000)}</Bar></BarChart></CW></Card>
    <Card><CT>Wealth PAT / PBT (₹ Cr)</CT><CW><BarChart data={wth}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mPAT" name="MOFSL PAT" fill={MC} radius={[3,3,0,0]}>{bl("mPAT")}</Bar><Bar dataKey="nPBT" name="Nuvama PBT" fill={NC} radius={[3,3,0,0]}>{bl("nPBT")}</Bar><Bar dataKey="tPBT" name="360ONE PBT" fill={TC} radius={[3,3,0,0]}>{bl("tPBT")}</Bar></BarChart></CW></Card>
  </div>

  <Sec title="Yields & Flows (FY25)">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card><CT>Revenue Yield on AUM (%)</CT><CW h={220}><BarChart data={yields}>{G}<XAxis dataKey="co" tick={{fontSize:11}}/><YAxis {...yL} unit="%"/>{T}{L}<Bar dataKey="wY" name="Wealth Yield %" radius={[3,3,0,0]}><Cell fill={MC}/><Cell fill={NC}/><Cell fill={TC}/></Bar></BarChart></CW></Card>
      <Card><CT>Wealth Net Flows (₹ Cr)</CT><CW h={220}><BarChart data={flows}>{G}<XAxis dataKey="co" tick={{fontSize:11}}/><YAxis {...yL}/>{T}{L}<Bar dataKey="wF" name="Net Flows" radius={[3,3,0,0]}><Cell fill={MC}/><Cell fill={NC}/><Cell fill={TC}/></Bar></BarChart></CW></Card>
    </div>
  </Sec>

  <Card className="bg-purple-50/50 border-purple-100"><p className="text-xs text-gray-600"><strong>Component Notes:</strong> MOFSL splits into NII (margin/ESOP lending), Distribution trail, Brokerage, Other (Delphi/PMS fees). Nuvama: Managed Products = MPIS (Wealth) + Mgd Products (Private); NII = lending income; Broking = Brokerage (Wealth) + Transactional (Private). 360ONE only reports ARR vs TBR at wealth level — ARR bundles 360ONE Plus + Dist trail + Lending NII. MOFSL Broking% falling from 44%→30% FY24→FY26E is the key structural shift driving re-rating potential.</p></Card>
</div>};

// ═══ AM TAB ═══
const AMTab=()=>{const A=am[2];return<div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="MOFSL AMC AUM" value={`₹${fmt(A.mAUM/1000,0)}K Cr`} sub="Retail MF+Alt" color={MC}/>
    <KPI label="Nuvama AM AUM" value={`₹${fmt(A.nAUM,0)} Cr`} sub="PE/Public/RE" color={NC}/>
    <KPI label="360ONE AM AUM" value={`₹${fmt(A.tAUM/1000,0)}K Cr`} sub="PMS+AIF+MF" color={TC}/>
    <KPI label="MOFSL AMC ARR" value={`₹${fmt(A.mARR,0)} Cr`} sub={`${(A.mARR/A.mRev*100).toFixed(0)}% of rev`} color={MC}/>
    <KPI label="Nuvama AM ARR" value={`₹${fmt(A.nARR,0)} Cr`} sub="Mgmt fees" color={NC}/>
    <KPI label="360ONE AM ARR" value={`₹${fmt(A.tARR,0)} Cr`} sub={`${(A.tARR/A.tRev*100).toFixed(0)}% of rev`} color={TC}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>AM Revenue (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mRev")}</Bar><Bar dataKey="tRev" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tRev")}</Bar><Bar dataKey="nRev" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nRev")}</Bar></BarChart></CW></Card>
    <Card><CT>AM ARR / Mgmt Fees (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mARR" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mARR")}</Bar><Bar dataKey="tARR" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tARR")}</Bar><Bar dataKey="nARR" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nARR")}</Bar></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>AM AUM (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mAUM" name="MOFSL" fill={M2} radius={[3,3,0,0]}>{bl("mAUM",undefined,20000)}</Bar><Bar dataKey="tAUM" name="360 ONE" fill={T2} radius={[3,3,0,0]}>{bl("tAUM",undefined,20000)}</Bar><Bar dataKey="nAUM" name="Nuvama" fill={N2} radius={[3,3,0,0]}>{bl("nAUM",undefined,5000)}</Bar></BarChart></CW></Card>
    <Card><CT>AM Profitability (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mPAT" name="MOFSL PAT" fill={MC} radius={[3,3,0,0]}>{bl("mPAT")}</Bar><Bar dataKey="tPBT" name="360ONE PBT" fill={TC} radius={[3,3,0,0]}>{bl("tPBT")}</Bar><Bar dataKey="nPBT" name="Nuvama PBT" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>
  <Card className="bg-blue-50/50 border-blue-100"><p className="text-xs text-gray-600"><strong>Note:</strong> AM is essentially all ARR (management fees). MOFSL AMC "Other" includes lending book income (₹865 Cr book) growing rapidly. Nuvama AM is early-stage (₹12.6K Cr), loss-making. 360ONE AM (₹99K Cr) focuses on PMS/AIF.</p></Card>
</div>};

// ═══ CM TAB ═══
const CMTab=()=><div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <KPI label="MOFSL CM FY26E" value={`₹${fmt(cm[2].mRev,0)} Cr`} sub="IB + Broking (TBR)" color={MC}/>
    <KPI label="Nuvama AS+CM FY26E" value={`₹${fmt(cm[2].nTotal,0)} Cr`} sub="AS (semi-ARR) + CM (TBR)" color={NC}/>
    <KPI label="MOFSL CM PAT" value={`₹${fmt(cm[2].mPAT,0)} Cr`} color={MC}/>
    <KPI label="Nuvama AS+CM PBT" value={`₹${fmt(cm[2].nPBT,0)} Cr`} color={NC}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Capital Markets Revenue (₹ Cr)</CT><CW><BarChart data={cm}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL CM" fill={MC} radius={[3,3,0,0]}>{bl("mRev")}</Bar><Bar dataKey="nTotal" name="Nuvama AS+CM" fill={NC} radius={[3,3,0,0]}>{bl("nTotal")}</Bar></BarChart></CW></Card>
    <Card><CT>Nuvama AS vs CM (₹ Cr)</CT><CW><BarChart data={cm}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="nAS" name="Asset Services (semi-ARR)" fill={AR} stackId="a">{bl("nAS",undefined,200)}</Bar><Bar dataKey="nCM" name="Capital Markets (TBR)" fill={TB} stackId="a" radius={[3,3,0,0]}>{bl("nCM",undefined,200)}</Bar></BarChart></CW></Card>
  </div>
  <Card className="bg-purple-50/50 border-purple-100"><p className="text-xs text-gray-600"><strong>Note:</strong> MOFSL CM is predominantly TBR (institutional broking + IB). Nuvama AS+CM includes Asset Services (₹701 Cr, semi-recurring custody/clearing) and Capital Markets (₹637 Cr, TBR). 360 ONE has no separate CM segment.</p></Card>
</div>;

// ═══ REVENUE BRIDGE / WATERFALL TAB ═══
const WaterfallTab = () => {
  const WFC={arr:"#8b5cf6",nii:"#06b6d4",tbr:"#f59e0b",oth:"#94a3b8",tot:"#1e40af"};
  const buildWF=segs=>{let c=0;const r=segs.map(s=>{const row={...s,off:c};c+=s.val;return row;});r.push({name:"Total",val:c,off:0,color:WFC.tot});return r;};
  const mWF=buildWF([{name:"Dist Trail (ARR)",val:wComp[2].mDist,color:WFC.arr},{name:"NII / Spread",val:wComp[2].mNII,color:WFC.nii},{name:"Brokerage (TBR)",val:wComp[2].mBrok,color:WFC.tbr},{name:"Other",val:wComp[2].mOth,color:WFC.oth}]);
  const nWF=buildWF([{name:"Mgd Prod (ARR)",val:wComp[2].nMgd,color:WFC.arr},{name:"NII / Spread",val:wComp[2].nNII,color:WFC.nii},{name:"Broking+Trans (TBR)",val:wComp[2].nBrok,color:WFC.tbr},{name:"Other",val:wComp[2].nOth,color:WFC.oth}]);
  const tWF=buildWF([{name:"ARR (Plus+Dist+NII)",val:wComp[2].tARR,color:WFC.arr},{name:"TBR / Brokerage",val:wComp[2].tBrok,color:WFC.tbr},{name:"Other Income",val:wComp[2].tOth,color:WFC.oth}]);
  const WF=({data,title})=><Card><CT>{title}</CT><CW h={300}><BarChart data={data} barSize={52} margin={{bottom:50}}>{G}<XAxis dataKey="name" tick={{fontSize:9}} angle={-28} textAnchor="end" interval={0} height={65}/><YAxis {...yL}/>{T}<Bar dataKey="off" stackId="a" fill="transparent" legendType="none"/><Bar dataKey="val" stackId="a" name="₹ Cr" radius={[3,3,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.color}/>)}{bl("val",undefined,100)}</Bar></BarChart></CW></Card>;
  const niiD=wComp.map(w=>({fy:w.fy,mNII:w.mNII,nNII:w.nNII}));
  const tbrD=wComp.map(w=>({fy:w.fy,mBrok:w.mBrok,nBrok:w.nBrok,tBrok:w.tBrok}));
  const arrD=wComp.map(w=>({fy:w.fy,mDist:w.mDist,nMgd:w.nMgd,tARR:w.tARR}));
  const othD=wComp.map(w=>({fy:w.fy,mOth:w.mOth,nOth:w.nOth,tOth:w.tOth}));
  return<div className="space-y-6">
    <Sec title="Revenue Bridge — FY26E Wealth Segment" sub="Waterfall from zero to total; each bar = incremental revenue layer (₹ Cr)">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><WF data={mWF} title="MOFSL (WM + PWM)"/><WF data={nWF} title="Nuvama (Wealth + Private)"/><WF data={tWF} title="360 ONE Wealth"/></div>
      <Card className="mt-3 bg-slate-50/60 border-slate-200"><div className="flex flex-wrap gap-5 text-xs text-gray-600 py-1">{[[`ARR / Distribution trail / Managed product fees`,WFC.arr],[`NII / Spread / Interest income (lending book)`,WFC.nii],[`TBR / Brokerage — transaction-based, market-linked`,WFC.tbr],[`Other income — Delphi, PMS advisory, misc`,WFC.oth],[`Total revenue`,WFC.tot]].map(([l,c])=><span key={c}><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{background:c}}></span>{l}</span>)}</div></Card>
    </Sec>

    <Sec title="① ARR Revenue — Distribution Trail & Managed Product Fees" sub="Recurring AUM-linked income; Retention = ARR Rev ÷ ARR AUM ex-Lending">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KPI label="MOFSL Dist ARR" value={`₹${fmt(wComp[2].mDist,0)} Cr`} sub={`${(wComp[2].mDist/wth[2].mRev*100).toFixed(0)}% wealth rev`} color={MC}/>
        <KPI label="MOFSL ARR AUM" value={`₹${fmt(arrAUM[2].mExL,0)} Cr`} sub={`ex-lend; ret ${arrAUM[2].mRet}%`} color={MC}/>
        <KPI label="360ONE ARR Rev" value={`₹${fmt(wComp[2].tARR,0)} Cr`} sub={`${(wComp[2].tARR/wth[2].tRev*100).toFixed(0)}% wealth rev`} color={TC}/>
        <KPI label="360ONE ARR AUM" value={`₹${fmt(arrAUM[2].tExL/1000,1)}K Cr`} sub={`ex-lend; ret ${arrAUM[2].tRet}%`} color={TC}/>
        <KPI label="Nuvama Mgd Prod" value={`₹${fmt(wComp[2].nMgd,0)} Cr`} sub={`${(wComp[2].nMgd/wth[2].nRev*100).toFixed(0)}% wealth rev`} color={NC}/>
        <KPI label="Nuvama Pvt AUM" value={`₹${fmt(arrAUM[2].nExL,0)} Cr`} sub={`ex-lend; ret ${arrAUM[2].nPvtRet}%`} color={NC}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CT>ARR / Distribution Revenue (₹ Cr)</CT><CW h={240}><BarChart data={arrD}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mDist" name="MOFSL Dist Trail" fill={MC} radius={[3,3,0,0]}>{bl("mDist")}</Bar><Bar dataKey="nMgd" name="Nuvama Mgd Prod" fill={NC} radius={[3,3,0,0]}>{bl("nMgd")}</Bar><Bar dataKey="tARR" name="360ONE ARR" fill={TC} radius={[3,3,0,0]}>{bl("tARR")}</Bar></BarChart></CW></Card>
        <Card><CT>ARR Retention Rate — Dist Rev ÷ ARR AUM ex-Lend (%)</CT><CW h={240}><ComposedChart data={arrAUM}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[0,4]}/>{T}{L}<Line dataKey="mRet" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tRet" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPvtRet" name="Nuvama Pvt" stroke={NC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
      </div>
      <Card className="bg-purple-50/50 border-purple-100"><p className="text-xs text-gray-600"><strong>ARR context:</strong> MOFSL (₹948 Cr dist trail) on ₹58,987 Cr ARR AUM — yield declining as AUM scale outpaces trail rate compression (3.32%→2.83%). 360ONE (₹1,482 Cr ARR) on ₹1.83L Cr ARR AUM (~0.81% retention) — advisory/Plus-series, very high AUM but low take rate; ARR bundles distribution, Plus-product fees and NII (not separately reported). Nuvama Managed Products (₹850 Cr) = MPIS + Private Mgd Products on ₹42,591 Cr — ~0.99% retention improving.</p></Card>
    </Sec>

    <Sec title="② TBR / Brokerage Revenue" sub="Transaction-based, equity market-linked — lower-quality, cyclical">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KPI label="MOFSL Brokerage" value={`₹${fmt(wComp[2].mBrok,0)} Cr`} sub={`${(wComp[2].mBrok/wth[2].mRev*100).toFixed(0)}% of wealth rev`} trend="down" color={MC}/>
        <KPI label="MOFSL Brok YoY" value={yoy(wComp[2].mBrok,wComp[1].mBrok)} sub="FY25→FY26E" trend="down" color={MC}/>
        <KPI label="Nuvama Broking" value={`₹${fmt(wComp[2].nBrok,0)} Cr`} sub={`${(wComp[2].nBrok/wth[2].nRev*100).toFixed(0)}% of wealth rev`} color={NC}/>
        <KPI label="Nuvama Brok YoY" value={yoy(wComp[2].nBrok,wComp[1].nBrok)} sub="FY25→FY26E" color={NC}/>
        <KPI label="360ONE TBR" value={`₹${fmt(wComp[2].tBrok,0)} Cr`} sub={`${(wComp[2].tBrok/wth[2].tRev*100).toFixed(0)}% of wealth rev`} color={TC}/>
        <KPI label="MOFSL TBR shift" value={`${brokPct[0].mPct}% → ${brokPct[2].mPct}%`} sub="FY24→FY26E (structural ↓)" trend="down" color={MC}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CT>Brokerage / TBR Revenue (₹ Cr)</CT><CW h={240}><BarChart data={tbrD}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mBrok" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mBrok")}</Bar><Bar dataKey="nBrok" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nBrok")}</Bar><Bar dataKey="tBrok" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tBrok")}</Bar></BarChart></CW></Card>
        <Card><CT>TBR as % of Wealth Revenue (%)</CT><CW h={240}><ComposedChart data={brokPct}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[0,55]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
      </div>
      <Card className="bg-amber-50/50 border-amber-100"><p className="text-xs text-gray-600"><strong>TBR context:</strong> MOFSL: Retail brokerage declining as % (44%→30% FY24→FY26E) — structural re-rating catalyst as ARR mix grows. Large retail franchise; est. ADTO ~₹600–700 Cr/day across WM+CM, ~1.5% retail equity market share. Nuvama TBR: HNI/ultra-HNI brokerage + transactional advisory (~24% of wealth rev), stable. 360ONE TBR (~31%): primarily HNI transactional/advisory execution; company targeting further ARR shift. All three are seeing market-share pressure from Zerodha/Groww in retail broking.</p></Card>
    </Sec>

    <Sec title="③ NII / Interest Income — Lending Spread" sub="Margin lending, ESOP financing, LAS; lending book embedded within ARR AUM">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KPI label="MOFSL NII" value={`₹${fmt(wComp[2].mNII,0)} Cr`} sub={`${(wComp[2].mNII/wth[2].mRev*100).toFixed(0)}% wealth rev`} color={MC}/>
        <KPI label="MOFSL Lend Book" value={`₹${fmt(arrAUM[2].mLend,0)} Cr`} sub={`Yield ~${(wComp[2].mNII/arrAUM[2].mLend*100).toFixed(1)}% on book`} color={MC}/>
        <KPI label="Nuvama NII" value={`₹${fmt(wComp[2].nNII,0)} Cr`} sub={`${(wComp[2].nNII/wth[2].nRev*100).toFixed(0)}% wealth rev`} color={NC}/>
        <KPI label="Nuvama Lend Book" value={`₹${fmt(arrAUM[2].nLoan,0)} Cr`} sub={`~${(wComp[2].nNII/arrAUM[2].nLoan*100).toFixed(1)}% NII/book`} color={NC}/>
        <KPI label="360ONE Lend Book" value={`₹${fmt(arrAUM[2].tLend,0)} Cr`} sub="NII bundled in ARR" color={TC}/>
        <KPI label="MOFSL NII YoY" value={yoy(wComp[2].mNII,wComp[1].mNII)} sub="FY25→FY26E" trend="up" color={MC}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CT>NII / Interest Income Trend (₹ Cr)</CT><CW h={240}><BarChart data={niiD}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mNII" name="MOFSL NII" fill={MC} radius={[3,3,0,0]}>{bl("mNII")}</Bar><Bar dataKey="nNII" name="Nuvama NII" fill={NC} radius={[3,3,0,0]}>{bl("nNII")}</Bar></BarChart></CW></Card>
        <Card><CT>Lending Book (₹ Cr)</CT><CW h={240}><BarChart data={arrAUM}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mLend" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mLend")}</Bar><Bar dataKey="tLend" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tLend")}</Bar><Bar dataKey="nLoan" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nLoan")}</Bar></BarChart></CW></Card>
      </div>
      <Card className="bg-cyan-50/50 border-cyan-100"><p className="text-xs text-gray-600"><strong>NII context:</strong> MOFSL NII (₹1,253 Cr) = margin lending + ESOP financing on ₹8,461 Cr book — gross yield ~14.8% (high-yield secured against equity). Nuvama NII (₹293 Cr) on ₹6,979 Cr consol. loan book — ~4.2% reflects blended rate on structured/lower-yield lending mix. 360ONE does not separately report NII — lending income (₹9,564 Cr book) is bundled inside ARR, making it the largest lending book of the three but invisibly embedded in ARR numbers. NII is high-quality recurring income that grows with AUM.</p></Card>
    </Sec>

    <Sec title="④ Other Income" sub="Advisory platform fees, PMS management, Delphi, structured products distribution, misc">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <KPI label="MOFSL Other" value={`₹${fmt(wComp[2].mOth,0)} Cr`} sub="Delphi + PMS advisory fees" color={MC}/>
        <KPI label="Nuvama Other" value={`₹${fmt(wComp[2].nOth,0)} Cr`} sub="GIFT City + Private misc" color={NC}/>
        <KPI label="360ONE Other" value={`₹${fmt(wComp[2].tOth,0)} Cr`} sub="Structured + tech / misc fees" color={TC}/>
      </div>
      <Card><CT>Other Income Trend (₹ Cr)</CT><CW h={220}><BarChart data={othD}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mOth" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("mOth")}</Bar><Bar dataKey="nOth" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("nOth")}</Bar><Bar dataKey="tOth" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("tOth")}</Bar></BarChart></CW></Card>
      <Card className="bg-gray-50/50 border-gray-200 mt-3"><p className="text-xs text-gray-600"><strong>Other income breakdown:</strong> MOFSL (₹143 Cr): Delphi advisory platform fees (HNI digital advisory) + PMS management fees routed through WM/PWM. Nuvama (₹119 Cr): GIFT City operations + custody/processing income + miscellaneous Private segment fees. 360ONE (₹135 Cr): structured products distribution fees, technology/platform fees, and miscellaneous advisory income — growing as product platform expands.</p></Card>
    </Sec>
  </div>;
};

// ═══ SCORECARD ═══
const ScoreTab=()=>{
  const tc="py-2 px-2 text-right",tl="py-2 px-2 text-left";const hdr="bg-gray-50 font-bold text-xs uppercase text-gray-500";
  const mPE=val.mMc/con[2].mOP,nPE=val.nMc/con[2].nOP,tPE=val.tMc/con[2].tOP;
  const mPB=val.mMc/con[2].mNW,nPB=val.nMc/con[2].nNW,tPB=val.tMc/con[2].tNW;
  const mTA=wth[2].mAUM+am[2].mAUM,nTA=wth[2].nAUM+am[2].nAUM+120302,tTA=wth[2].tAUM+am[2].tAUM;
  const mAR=wth[2].mARR+am[2].mARR,nAR=wth[2].nARR+am[2].nARR,tAR=wth[2].tARR+am[2].tARR;
  const mTA1=wth[1].mAUM+am[1].mAUM,nTA1=wth[1].nAUM+am[1].nAUM+120302,tTA1=wth[1].tAUM+am[1].tAUM;
  const mAR1=wth[1].mARR+am[1].mARR,nAR1=wth[1].nARR+am[1].nARR,tAR1=wth[1].tARR+am[1].tARR;
  const gC=(v,g)=><>{v}{g!=null&&<div className={`text-[10px] font-normal mt-0.5 ${g>=0?"text-emerald-600":"text-red-500"}`}>{g>=0?"▲":"▼"} {Math.abs(g).toFixed(1)}%</div>}</>;
  const rows=[
    {cat:"Scale",items:[
      {l:"Revenue FY26E",m:gC(fmt(con[2].mRev,0),calcYoY(con[2].mRev,con[1].mRev)),n:gC(fmt(con[2].nRev,0),calcYoY(con[2].nRev,con[1].nRev)),t:gC(fmt(con[2].tRev,0),calcYoY(con[2].tRev,con[1].tRev))},
      {l:"Op PAT FY26E",m:gC(fmt(con[2].mOP,0),calcYoY(con[2].mOP,con[1].mOP)),n:gC(fmt(con[2].nOP,0),calcYoY(con[2].nOP,con[1].nOP)),t:gC(fmt(con[2].tOP,0),calcYoY(con[2].tOP,con[1].tOP))},
      {l:"Net Worth",m:gC(fmt(con[2].mNW,0),calcYoY(con[2].mNW,con[1].mNW)),n:gC(fmt(con[2].nNW,0),calcYoY(con[2].nNW,con[1].nNW)),t:gC(fmt(con[2].tNW,0),calcYoY(con[2].tNW,con[1].tNW))},
      {l:"Total AUM",m:gC(fmt(mTA,0),calcYoY(mTA,mTA1)),n:gC(fmt(nTA,0),calcYoY(nTA,nTA1)),t:gC(fmt(tTA,0),calcYoY(tTA,tTA1))},
    ]},
    {cat:"Wealth Platform",items:[
      {l:"Wealth Revenue",m:gC(fmt(wth[2].mRev,0),calcYoY(wth[2].mRev,wth[1].mRev)),n:gC(fmt(wth[2].nRev,0),calcYoY(wth[2].nRev,wth[1].nRev)),t:gC(fmt(wth[2].tRev,0),calcYoY(wth[2].tRev,wth[1].tRev))},
      {l:"Wealth AUM",m:gC(fmt(wth[2].mAUM,0),calcYoY(wth[2].mAUM,wth[1].mAUM)),n:gC(fmt(wth[2].nAUM,0),calcYoY(wth[2].nAUM,wth[1].nAUM)),t:gC(fmt(wth[2].tAUM,0),calcYoY(wth[2].tAUM,wth[1].tAUM))},
      {l:"Wealth ARR",m:gC(fmt(wth[2].mARR,0),calcYoY(wth[2].mARR,wth[1].mARR)),n:gC(fmt(wth[2].nARR,0),calcYoY(wth[2].nARR,wth[1].nARR)),t:gC(fmt(wth[2].tARR,0),calcYoY(wth[2].tARR,wth[1].tARR))},
      {l:"Wealth Broking",m:gC(fmt(wComp[2].mBrok,0),calcYoY(wComp[2].mBrok,wComp[1].mBrok)),n:gC(fmt(wComp[2].nBrok,0),calcYoY(wComp[2].nBrok,wComp[1].nBrok)),t:gC(fmt(wComp[2].tBrok,0),calcYoY(wComp[2].tBrok,wComp[1].tBrok))},
      {l:"ARR %",m:`${arrPct[2].mPct}%`,n:`${arrPct[2].nPct}%`,t:`${arrPct[2].tPct}%`},
      {l:"Broking %",m:`${brokPct[2].mPct}%`,n:`${brokPct[2].nPct}%`,t:`${brokPct[2].tPct}%`},
      {l:"Yield on AUM (FY25)",m:"0.89%",n:"0.53%",t:"0.45%"},
    ]},
    {cat:"Asset Mgmt",items:[
      {l:"AM Revenue",m:gC(fmt(am[2].mRev,0),calcYoY(am[2].mRev,am[1].mRev)),n:gC(fmt(am[2].nRev,0),calcYoY(am[2].nRev,am[1].nRev)),t:gC(fmt(am[2].tRev,0),calcYoY(am[2].tRev,am[1].tRev))},
      {l:"AM ARR",m:gC(fmt(am[2].mARR,0),calcYoY(am[2].mARR,am[1].mARR)),n:gC(fmt(am[2].nARR,0),calcYoY(am[2].nARR,am[1].nARR)),t:gC(fmt(am[2].tARR,0),calcYoY(am[2].tARR,am[1].tARR))},
      {l:"AM AUM",m:gC(fmt(am[2].mAUM,0),calcYoY(am[2].mAUM,am[1].mAUM)),n:gC(fmt(am[2].nAUM,0),calcYoY(am[2].nAUM,am[1].nAUM)),t:gC(fmt(am[2].tAUM,0),calcYoY(am[2].tAUM,am[1].tAUM))},
    ]},
    {cat:"ARR Quality",items:[
      {l:"Total ARR (W+AM)",m:gC(fmt(mAR,0),calcYoY(mAR,mAR1)),n:gC(fmt(nAR,0),calcYoY(nAR,nAR1)),t:gC(fmt(tAR,0),calcYoY(tAR,tAR1))},
      {l:"ARR AUM ex-Lending",m:fmt(arrAUM[2].mExL,0),n:`${fmt(arrAUM[2].nExL,0)} (Pvt)`,t:fmt(arrAUM[2].tExL,0)},
      {l:"ARR Retention",m:`${arrAUM[2].mRet}%`,n:`${arrAUM[2].nPvtRet}% (Pvt)`,t:`${arrAUM[2].tRet}%`},
      {l:"Mcap / Total ARR",m:`${(val.mMc/mAR).toFixed(1)}x`,n:`${(val.nMc/nAR).toFixed(1)}x`,t:`${(val.tMc/tAR).toFixed(1)}x`},
    ]},
    {cat:"Efficiency",items:[
      {l:"Cost/Income",m:`${con[2].mCI}%`,n:`${con[2].nCI}%`,t:`${con[2].tCI}%`},
      {l:"ROE (FY25)",m:`${con[1].mROE}%`,n:`${con[1].nROE}%`,t:`${con[1].tROE}%`},
      {l:"Op Margin",m:pct(con[2].mOP/con[2].mRev*100),n:pct(con[2].nOP/con[2].nRev*100),t:pct(con[2].tOP/con[2].tRev*100)},
    ]},
    {cat:"Valuation",items:[
      {l:"CMP",m:`₹${val.mCMP}`,n:`₹${val.nCMP}`,t:`₹${val.tCMP}`},
      {l:"Mcap",m:fmt(val.mMc,0),n:fmt(val.nMc,0),t:fmt(val.tMc,0)},
      {l:"P/OpPAT",m:`${mPE.toFixed(1)}x`,n:`${nPE.toFixed(1)}x`,t:`${tPE.toFixed(1)}x`},
      {l:"P/Book",m:`${mPB.toFixed(1)}x`,n:`${nPB.toFixed(1)}x`,t:`${tPB.toFixed(1)}x`},
      {l:"Mcap/Total AUM",m:`${(val.mMc/mTA*100).toFixed(1)}%`,n:`${(val.nMc/nTA*100).toFixed(1)}%`,t:`${(val.tMc/tTA*100).toFixed(1)}%`},
      {l:"Mcap/ARR",m:`${(val.mMc/mAR).toFixed(1)}x`,n:`${(val.nMc/nAR).toFixed(1)}x`,t:`${(val.tMc/tAR).toFixed(1)}x`},
    ]},
  ];
  return<div className="space-y-6">
    <div className="grid grid-cols-3 gap-3">
      <KPI label="MOFSL P/OpPAT" value={`${mPE.toFixed(1)}x`} sub={`Mcap/ARR ${(val.mMc/mAR).toFixed(1)}x`} color={MC}/>
      <KPI label="Nuvama P/OpPAT" value={`${nPE.toFixed(1)}x`} sub={`Mcap/ARR ${(val.nMc/nAR).toFixed(1)}x`} color={NC}/>
      <KPI label="360ONE P/OpPAT" value={`${tPE.toFixed(1)}x`} sub={`Mcap/ARR ${(val.tMc/tAR).toFixed(1)}x`} color={TC}/>
    </div>
    <Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b-2 border-gray-800"><th className={tl+" font-bold text-gray-900 w-[38%]"}>Metric (₹ Cr)</th><th className={tc+" font-bold"} style={{color:MC}}>MOFSL</th><th className={tc+" font-bold"} style={{color:NC}}>Nuvama</th><th className={tc+" font-bold"} style={{color:TC}}>360 ONE</th></tr></thead><tbody>
      {rows.map((cat,ci)=><Fragment key={`c${ci}`}>
        <tr className={hdr}><td className="py-3 px-2" colSpan={4}>{cat.cat}</td></tr>
        {cat.items.map((r,ri)=><tr key={`r${ci}_${ri}`} className="border-b border-gray-50 hover:bg-gray-50/50"><td className={tl+" text-gray-700"}>{r.l}</td><td className={tc+" font-semibold"} style={{color:MC}}>{r.m}</td><td className={tc+" font-semibold"} style={{color:NC}}>{r.n}</td><td className={tc+" font-semibold"} style={{color:TC}}>{r.t}</td></tr>)}
      </Fragment>)}
    </tbody></table></div></Card>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card><CT>P/OpPAT</CT><CW h={200}><BarChart data={[{m:mPE,n:nPE,t:tPE,label:"P/E"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="x"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("m",undefined,1)}</Bar><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("n",undefined,1)}</Bar><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("t",undefined,1)}</Bar></BarChart></CW></Card>
      <Card><CT>Mcap/ARR (x)</CT><CW h={200}><BarChart data={[{m:val.mMc/mAR,n:val.nMc/nAR,t:val.tMc/tAR,label:"Mcap/ARR"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="x"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("m",undefined,1)}</Bar><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("n",undefined,1)}</Bar><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("t",undefined,1)}</Bar></BarChart></CW></Card>
      <Card><CT>Mcap/AUM (%)</CT><CW h={200}><BarChart data={[{m:val.mMc/mTA*100,n:val.nMc/nTA*100,t:val.tMc/tTA*100,label:"%"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="%"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}>{bl("m",undefined,1)}</Bar><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}>{bl("n",undefined,1)}</Bar><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}>{bl("t",undefined,1)}</Bar></BarChart></CW></Card>
    </div>
    <Card className="bg-gray-50/50 border-gray-200"><p className="text-xs text-gray-500"><strong>Definitions:</strong> MOFSL Rev = Net Revenue (post direct costs); Nuvama = Adjusted Mgmt Rev; 360ONE = Total Rev incl other income. MOFSL OpPAT excl treasury. Nuvama OpPAT excl associates/exceptional. 360ONE OpPAT = OpPBT × 0.75. Broking% = Brokerage+Transactional ÷ Wealth Rev. ARR Retention = ARR Rev ÷ Avg ARR AUM. CMPs approximate.</p></Card>
  </div>
};

// ═══ MAIN ═══
const TABS=[{id:"overview",label:"Overview"},{id:"wealth",label:"Wealth"},{id:"am",label:"Asset Mgmt"},{id:"cm",label:"Capital Mkt"},{id:"arrtbr",label:"ARR / TBR"},{id:"revbridge",label:"Rev Bridge"},{id:"score",label:"Scorecard"}];
export default function Dashboard(){
  const[tab,setTab]=useState("wealth");
  return<div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-emerald-900 text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-end justify-between">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Wealth Platform Cross-Comparison</h1><p className="text-purple-200 text-sm mt-1 font-medium">MOFSL vs Nuvama vs 360 ONE — FY26E (9MFY26 Ann.) — Revenue Split / ARR / TBR / Retention</p></div>
        <div className="text-right"><div className="flex gap-4 text-sm font-bold"><span style={{color:"#93c5fd"}}>MOFSL ₹697</span><span style={{color:"#d8b4fe"}}>Nuvama ₹6,200</span><span style={{color:"#86efac"}}>360ONE ₹950</span></div><div className="text-purple-300 text-xs mt-1">Tusk Investment Research</div></div>
      </div>
    </div>
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div className="max-w-7xl mx-auto px-6 flex gap-0.5 overflow-x-auto">{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-3 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${tab===t.id?"border-purple-600 text-purple-700 bg-purple-50/60":"border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{t.label}</button>)}</div></div>
    <div className="max-w-7xl mx-auto px-6 py-6">
      {tab==="overview"&&<Overview/>}{tab==="wealth"&&<WealthTab/>}{tab==="am"&&<AMTab/>}{tab==="cm"&&<CMTab/>}{tab==="arrtbr"&&<ARRTab/>}{tab==="revbridge"&&<WaterfallTab/>}{tab==="score"&&<ScoreTab/>}
    </div>
  </div>;
}