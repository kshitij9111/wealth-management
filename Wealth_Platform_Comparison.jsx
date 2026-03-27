import { useState, Fragment } from "react";
import { BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MC="#3b82f6",NC="#a855f7",TC="#22c55e",M2="#93c5fd",N2="#d8b4fe",T2="#86efac";
const AR="#8b5cf6",TB="#f59e0b",OC="#94a3b8";
const fmt=(v,d=1)=>{if(v==null)return"—";if(Math.abs(v)>=100000)return`${(v/1000).toFixed(0)}K`;return typeof v==="number"?v.toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d}):v};
const pct=v=>v==null?"—":`${v.toFixed(1)}%`;
const yoy=(c,p)=>p>0?`${((c/p-1)*100).toFixed(1)}%`:"—";
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

// ARR AUM, Lending, Retention
const arrAUM = [
  {fy:"FY24",mAvg:37726,mLend:5612,mExL:32114,mRev:1065,mRet:2.82,tAvg:108609,tLend:5899,tExL:102710,tRev:844,tRet:0.78,nPvt:29224,nLoan:4925,nPvtRev:297,nPvtRet:1.02},
  {fy:"FY25",mAvg:51952,mLend:7287,mExL:44665,mRev:1399,mRet:2.69,tAvg:150110,tLend:7602,tExL:142508,tRev:1101,tRet:0.73,nPvt:40261,nLoan:4719,nPvtRev:340,nPvtRet:0.84},
  {fy:"FY26E",mAvg:67448,mLend:8461,mExL:58987,mRev:1671,mRet:2.48,tAvg:192358,tLend:9564,tExL:182794,tRev:1482,tRet:0.77,nPvt:49570,nLoan:6979,nPvtRev:421,nPvtRet:0.85},
];

// Yields & Flows (FY25)
const yields=[{co:"MOFSL",wY:0.89,amY:0.94},{co:"Nuvama",wY:0.53,amY:0.65},{co:"360 ONE",wY:0.45,amY:0.80}];
const flows=[{co:"MOFSL",wF:12279,amF:48779},{co:"Nuvama",wF:15689,amF:4450},{co:"360 ONE",wF:22334,amF:3640}];

// Valuation
const val={mCMP:697,nCMP:6200,tCMP:950,mSh:60.2,nSh:3.8,tSh:40.5,mMc:41959,nMc:23560,tMc:38475};

// ━━━ TABS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Overview=()=>{const C=con[2],P=con[1];return<div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="MOFSL FY26E Rev" value={`₹${fmt(C.mRev,0)} Cr`} sub={`${yoy(C.mRev,P.mRev)} YoY`} trend="up" color={MC}/>
    <KPI label="Nuvama FY26E Rev" value={`₹${fmt(C.nRev,0)} Cr`} sub={`${yoy(C.nRev,P.nRev)} YoY`} trend="up" color={NC}/>
    <KPI label="360ONE FY26E Rev" value={`₹${fmt(C.tRev,0)} Cr`} sub={`${yoy(C.tRev,P.tRev)} YoY`} trend="up" color={TC}/>
    <KPI label="MOFSL OpPAT" value={`₹${fmt(C.mOP,0)} Cr`} sub={`${yoy(C.mOP,P.mOP)} YoY`} trend="up" color={MC}/>
    <KPI label="Nuvama OpPAT" value={`₹${fmt(C.nOP,0)} Cr`} sub={`${yoy(C.nOP,P.nOP)} YoY`} trend="up" color={NC}/>
    <KPI label="360ONE OpPAT" value={`₹${fmt(C.tOP,0)} Cr`} sub={`${yoy(C.tOP,P.tOP)} YoY`} trend="up" color={TC}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Revenue (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="nRev" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="tRev" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>Operating PAT (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mOP" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="nOP" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="tOP" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>360ONE Consolidated ARR vs TBR (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="tARR" name="ARR" fill={AR} stackId="t"/><Bar dataKey="tTBR" name="TBR" fill={TB} stackId="t"/><Bar dataKey="tOI" name="Other Inc" fill={OC} stackId="t" radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>ROE (%)</CT><CW><ComposedChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%"/>{T}{L}<Line dataKey="mROE" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nROE" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tROE" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Net Worth (₹ Cr)</CT><CW><BarChart data={con}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mNW" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="nNW" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="tNW" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
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
      <Card><CT>MOFSL (WM+PWM)</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mNII" name="NII" fill="#06b6d4" stackId="a"/><Bar dataKey="mDist" name="Distribution" fill={AR} stackId="a"/><Bar dataKey="mBrok" name="Brokerage" fill={TB} stackId="a"/><Bar dataKey="mOth" name="Other" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Nuvama (Wealth+Private)</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="nMgd" name="Managed Prod" fill={AR} stackId="a"/><Bar dataKey="nNII" name="NII" fill="#06b6d4" stackId="a"/><Bar dataKey="nBrok" name="Broking+Trans" fill={TB} stackId="a"/><Bar dataKey="nOth" name="Other" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>360 ONE Wealth</CT><CW h={260}><BarChart data={wComp}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="tARR" name="ARR (Plus+Dist+NII)" fill={AR} stackId="a"/><Bar dataKey="tBrok" name="TBR / Broking" fill={TB} stackId="a"/><Bar dataKey="tOth" name="Other Income" fill={OC} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
    </div>
  </Sec>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Broking as % of Wealth Revenue</CT><CW><ComposedChart data={brokPct}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[15,50]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
    <Card><CT>ARR % of Wealth Revenue</CT><CW><ComposedChart data={arrPct}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[30,80]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Wealth AUM (₹ Cr)</CT><CW><BarChart data={wth}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mAUM" name="MOFSL" fill={M2} radius={[3,3,0,0]}/><Bar dataKey="nAUM" name="Nuvama" fill={N2} radius={[3,3,0,0]}/><Bar dataKey="tAUM" name="360 ONE" fill={T2} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>Wealth PAT / PBT (₹ Cr)</CT><CW><BarChart data={wth}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mPAT" name="MOFSL PAT" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="nPBT" name="Nuvama PBT" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="tPBT" name="360ONE PBT" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>

  <Sec title="Yields & Flows (FY25)">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card><CT>Revenue Yield on AUM (%)</CT><CW h={220}><BarChart data={yields}>{G}<XAxis dataKey="co" tick={{fontSize:11}}/><YAxis {...yL} unit="%"/>{T}{L}<Bar dataKey="wY" name="Wealth Yield %" fill={AR} radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Wealth Net Flows (₹ Cr)</CT><CW h={220}><BarChart data={flows}>{G}<XAxis dataKey="co" tick={{fontSize:11}}/><YAxis {...yL}/>{T}{L}<Bar dataKey="wF" name="Net Flows" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
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
    <Card><CT>AM Revenue (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="tRev" name="360 ONE" fill={TC} radius={[3,3,0,0]}/><Bar dataKey="nRev" name="Nuvama" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>AM ARR / Mgmt Fees (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mARR" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="tARR" name="360 ONE" fill={TC} radius={[3,3,0,0]}/><Bar dataKey="nARR" name="Nuvama" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>AM AUM (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mAUM" name="MOFSL" fill={M2} radius={[3,3,0,0]}/><Bar dataKey="tAUM" name="360 ONE" fill={T2} radius={[3,3,0,0]}/><Bar dataKey="nAUM" name="Nuvama" fill={N2} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>AM Profitability (₹ Cr)</CT><CW><BarChart data={am}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mPAT" name="MOFSL PAT" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="tPBT" name="360ONE PBT" fill={TC} radius={[3,3,0,0]}/><Bar dataKey="nPBT" name="Nuvama PBT" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
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
    <Card><CT>Capital Markets Revenue (₹ Cr)</CT><CW><BarChart data={cm}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mRev" name="MOFSL CM" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="nTotal" name="Nuvama AS+CM" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>Nuvama AS vs CM (₹ Cr)</CT><CW><BarChart data={cm}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="nAS" name="Asset Services (semi-ARR)" fill={AR} stackId="a"/><Bar dataKey="nCM" name="Capital Markets (TBR)" fill={TB} stackId="a" radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>
  <Card className="bg-purple-50/50 border-purple-100"><p className="text-xs text-gray-600"><strong>Note:</strong> MOFSL CM is predominantly TBR (institutional broking + IB). Nuvama AS+CM includes Asset Services (₹701 Cr, semi-recurring custody/clearing) and Capital Markets (₹637 Cr, TBR). 360 ONE has no separate CM segment.</p></Card>
</div>;

// ═══ ARR / TBR & RETENTION TAB ═══
const ARRTab=()=>{
  const tc="py-2 px-2 text-right",tl="py-2 px-2 text-left";
  const combARR=wth.map((w,i)=>{const a=am[i];const mA=w.mARR+a.mARR,nA=w.nARR+a.nARR,tA=w.tARR+a.tARR;return{fy:w.fy,mPct:+(mA/(w.mRev+a.mRev)*100).toFixed(1),nPct:+(nA/(w.nRev+a.nRev)*100).toFixed(1),tPct:+(tA/(w.tRev+a.tRev)*100).toFixed(1)}});
  return<div className="space-y-6">
  <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="MOFSL Wealth ARR%" value={`${arrPct[2].mPct}%`} sub={`₹${fmt(wth[2].mARR,0)} Cr`} color={MC}/>
    <KPI label="Nuvama Wealth ARR%" value={`${arrPct[2].nPct}%`} sub={`₹${fmt(wth[2].nARR,0)} Cr`} color={NC}/>
    <KPI label="360ONE Wealth ARR%" value={`${arrPct[2].tPct}%`} sub={`₹${fmt(wth[2].tARR,0)} Cr`} color={TC}/>
    <KPI label="MOFSL ARR Ret." value={`${arrAUM[2].mRet}%`} sub={`on ₹${fmt(arrAUM[2].mAvg,0)} Cr`} color={MC}/>
    <KPI label="360ONE ARR Ret." value={`${arrAUM[2].tRet}%`} sub={`on ₹${fmt(arrAUM[2].tAvg/1000,0)}K Cr`} color={TC}/>
    <KPI label="Nuvama Pvt Ret." value={`${arrAUM[2].nPvtRet}%`} sub={`on ₹${fmt(arrAUM[2].nPvt,0)} Cr`} color={NC}/>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Wealth+AM ARR % Trend</CT><CW><ComposedChart data={combARR}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[30,80]}/>{T}{L}<Line dataKey="mPct" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPct" name="Nuvama" stroke={NC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tPct" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
    <Card><CT>ARR Retention / Take Rate (%)</CT><CW><ComposedChart data={arrAUM}>{G}<XAxis {...xFY}/><YAxis {...yL} unit="%" domain={[0,3.5]}/>{T}{L}<Line dataKey="mRet" name="MOFSL" stroke={MC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="tRet" name="360 ONE" stroke={TC} strokeWidth={2.5} dot={{r:4}}/><Line dataKey="nPvtRet" name="Nuvama Pvt" stroke={NC} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  </div>

  <Sec title="ARR AUM, Lending Book & Retention" sub="Avg ARR AUM from databooks; Retention = ARR Revenue ÷ Avg ARR AUM">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card><CT>Avg ARR AUM (₹ Cr)</CT><CW><BarChart data={arrAUM}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mAvg" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="tAvg" name="360 ONE" fill={TC} radius={[3,3,0,0]}/><Bar dataKey="nPvt" name="Nuvama Pvt" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Lending Book within ARR AUM (₹ Cr)</CT><CW><BarChart data={arrAUM}>{G}<XAxis {...xFY}/><YAxis {...yL}/>{T}{L}<Bar dataKey="mLend" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="tLend" name="360 ONE" fill={TC} radius={[3,3,0,0]}/><Bar dataKey="nLoan" name="Nuvama (consol)" fill={NC} radius={[3,3,0,0]}/></BarChart></CW></Card>
    </div>
    <Card><div className="overflow-x-auto"><table className="w-full text-xs">
      <thead><tr className="border-b-2 border-gray-800">
        <th className={tl+" font-bold w-[20%]"}>Metric</th>
        <th className={tc} style={{color:MC}} colSpan={3}>MOFSL (WM+PWM)</th>
        <th className={tc} style={{color:TC}} colSpan={3}>360 ONE Wealth</th>
        <th className={tc} style={{color:NC}} colSpan={3}>Nuvama (Pvt only)</th>
      </tr>
      <tr className="border-b border-gray-200 text-gray-500"><th className={tl}></th>{["FY24","FY25","FY26E","FY24","FY25","FY26E","FY24","FY25","FY26E"].map((f,i)=><th key={i} className={tc}>{f}</th>)}</tr></thead>
      <tbody>
        <tr className="border-b border-gray-50 bg-gray-50/30"><td className={tl+" font-semibold"}>Avg ARR AUM</td>{arrAUM.map((r,i)=><td key={`m${i}`} className={tc+" font-semibold"} style={{color:MC}}>{fmt(r.mAvg,0)}</td>)}{arrAUM.map((r,i)=><td key={`t${i}`} className={tc+" font-semibold"} style={{color:TC}}>{fmt(r.tAvg,0)}</td>)}{arrAUM.map((r,i)=><td key={`n${i}`} className={tc+" font-semibold"} style={{color:NC}}>{fmt(r.nPvt,0)}</td>)}</tr>
        <tr className="border-b border-gray-50"><td className={tl}>Lending Book</td>{arrAUM.map((r,i)=><td key={`m${i}`} className={tc}>{fmt(r.mLend,0)}</td>)}{arrAUM.map((r,i)=><td key={`t${i}`} className={tc}>{fmt(r.tLend,0)}</td>)}{arrAUM.map((r,i)=><td key={`n${i}`} className={tc}>{fmt(r.nLoan,0)}</td>)}</tr>
        <tr className="border-b border-gray-50"><td className={tl}>ARR AUM ex-Lending</td>{arrAUM.map((r,i)=><td key={`m${i}`} className={tc+" font-semibold"}>{fmt(r.mExL,0)}</td>)}{arrAUM.map((r,i)=><td key={`t${i}`} className={tc+" font-semibold"}>{fmt(r.tExL,0)}</td>)}{arrAUM.map((r,i)=><td key={`n${i}`} className={tc+" text-gray-400"}>—</td>)}</tr>
        <tr className="border-b border-gray-50 bg-purple-50/30"><td className={tl+" font-semibold"}>ARR Revenue</td>{arrAUM.map((r,i)=><td key={`m${i}`} className={tc+" font-bold"} style={{color:AR}}>{fmt(r.mRev,0)}</td>)}{arrAUM.map((r,i)=><td key={`t${i}`} className={tc+" font-bold"} style={{color:AR}}>{fmt(r.tRev,0)}</td>)}{arrAUM.map((r,i)=><td key={`n${i}`} className={tc+" font-bold"} style={{color:AR}}>{fmt(r.nPvtRev,0)}</td>)}</tr>
        <tr className="border-b border-gray-50 bg-amber-50/30"><td className={tl+" font-semibold"}>Retention (%)</td>{arrAUM.map((r,i)=><td key={`m${i}`} className={tc+" font-bold"} style={{color:MC}}>{r.mRet}%</td>)}{arrAUM.map((r,i)=><td key={`t${i}`} className={tc+" font-bold"} style={{color:TC}}>{r.tRet}%</td>)}{arrAUM.map((r,i)=><td key={`n${i}`} className={tc+" font-bold"} style={{color:NC}}>{r.nPvtRet}%</td>)}</tr>
      </tbody>
    </table></div></Card>
  </Sec>

  <Card className="bg-amber-50/50 border-amber-100"><p className="text-xs text-gray-600"><strong>Notes:</strong> MOFSL retention ~2.5-2.8% reflects higher-yielding dist trail + lending NII on smaller ARR AUM base (₹67K Cr). 360ONE at ~0.75% on ₹1.9L Cr — reflects lower-yield advisory/dist model on much larger managed assets. Nuvama only reports ARR AUM for Private segment. Lending book is embedded in ARR AUM for all — "ex-Lending" shows pure fee-earning managed/distribution AUM.</p></Card>
</div>};

// ═══ SCORECARD ═══
const ScoreTab=()=>{
  const tc="py-2 px-2 text-right",tl="py-2 px-2 text-left";const hdr="bg-gray-50 font-bold text-xs uppercase text-gray-500";
  const mPE=val.mMc/con[2].mOP,nPE=val.nMc/con[2].nOP,tPE=val.tMc/con[2].tOP;
  const mPB=val.mMc/con[2].mNW,nPB=val.nMc/con[2].nNW,tPB=val.tMc/con[2].tNW;
  const mTA=wth[2].mAUM+am[2].mAUM,nTA=wth[2].nAUM+am[2].nAUM+120302,tTA=wth[2].tAUM+am[2].tAUM;
  const mAR=wth[2].mARR+am[2].mARR,nAR=wth[2].nARR+am[2].nARR,tAR=wth[2].tARR+am[2].tARR;
  const rows=[
    {cat:"Scale",items:[
      {l:"Revenue FY26E",m:fmt(con[2].mRev,0),n:fmt(con[2].nRev,0),t:fmt(con[2].tRev,0)},
      {l:"Op PAT FY26E",m:fmt(con[2].mOP,0),n:fmt(con[2].nOP,0),t:fmt(con[2].tOP,0)},
      {l:"Net Worth",m:fmt(con[2].mNW,0),n:fmt(con[2].nNW,0),t:fmt(con[2].tNW,0)},
      {l:"Total AUM",m:fmt(mTA,0),n:fmt(nTA,0),t:fmt(tTA,0)},
    ]},
    {cat:"Wealth Platform",items:[
      {l:"Wealth Revenue",m:fmt(wth[2].mRev,0),n:fmt(wth[2].nRev,0),t:fmt(wth[2].tRev,0)},
      {l:"Wealth AUM",m:fmt(wth[2].mAUM,0),n:fmt(wth[2].nAUM,0),t:fmt(wth[2].tAUM,0)},
      {l:"Wealth ARR",m:fmt(wth[2].mARR,0),n:fmt(wth[2].nARR,0),t:fmt(wth[2].tARR,0)},
      {l:"Wealth Broking",m:fmt(wComp[2].mBrok,0),n:fmt(wComp[2].nBrok,0),t:fmt(wComp[2].tBrok,0)},
      {l:"ARR %",m:`${arrPct[2].mPct}%`,n:`${arrPct[2].nPct}%`,t:`${arrPct[2].tPct}%`},
      {l:"Broking %",m:`${brokPct[2].mPct}%`,n:`${brokPct[2].nPct}%`,t:`${brokPct[2].tPct}%`},
      {l:"Yield on AUM (FY25)",m:"0.89%",n:"0.53%",t:"0.45%"},
    ]},
    {cat:"Asset Mgmt",items:[
      {l:"AM Revenue",m:fmt(am[2].mRev,0),n:fmt(am[2].nRev,0),t:fmt(am[2].tRev,0)},
      {l:"AM ARR",m:fmt(am[2].mARR,0),n:fmt(am[2].nARR,0),t:fmt(am[2].tARR,0)},
      {l:"AM AUM",m:fmt(am[2].mAUM,0),n:fmt(am[2].nAUM,0),t:fmt(am[2].tAUM,0)},
    ]},
    {cat:"ARR Quality",items:[
      {l:"Total ARR (W+AM)",m:fmt(mAR,0),n:fmt(nAR,0),t:fmt(tAR,0)},
      {l:"Avg ARR AUM",m:fmt(arrAUM[2].mAvg,0),n:`${fmt(arrAUM[2].nPvt,0)} (Pvt)`,t:fmt(arrAUM[2].tAvg,0)},
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
      <Card><CT>P/OpPAT</CT><CW h={200}><BarChart data={[{m:mPE,n:nPE,t:tPE,label:"P/E"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="x"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Mcap/ARR (x)</CT><CW h={200}><BarChart data={[{m:val.mMc/mAR,n:val.nMc/nAR,t:val.tMc/tAR,label:"Mcap/ARR"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="x"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
      <Card><CT>Mcap/AUM (%)</CT><CW h={200}><BarChart data={[{m:val.mMc/mTA*100,n:val.nMc/nTA*100,t:val.tMc/tTA*100,label:"%"}]}>{G}<XAxis dataKey="label" tick={{fontSize:11}}/><YAxis {...yL} unit="%"/>{T}{L}<Bar dataKey="m" name="MOFSL" fill={MC} radius={[3,3,0,0]}/><Bar dataKey="n" name="Nuvama" fill={NC} radius={[3,3,0,0]}/><Bar dataKey="t" name="360 ONE" fill={TC} radius={[3,3,0,0]}/></BarChart></CW></Card>
    </div>
    <Card className="bg-gray-50/50 border-gray-200"><p className="text-xs text-gray-500"><strong>Definitions:</strong> MOFSL Rev = Net Revenue (post direct costs); Nuvama = Adjusted Mgmt Rev; 360ONE = Total Rev incl other income. MOFSL OpPAT excl treasury. Nuvama OpPAT excl associates/exceptional. 360ONE OpPAT = OpPBT × 0.75. Broking% = Brokerage+Transactional ÷ Wealth Rev. ARR Retention = ARR Rev ÷ Avg ARR AUM. CMPs approximate.</p></Card>
  </div>
};

// ═══ MAIN ═══
const TABS=[{id:"overview",label:"Overview"},{id:"wealth",label:"Wealth"},{id:"am",label:"Asset Mgmt"},{id:"cm",label:"Capital Mkt"},{id:"arrtbr",label:"ARR / TBR"},{id:"score",label:"Scorecard"}];
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
      {tab==="overview"&&<Overview/>}{tab==="wealth"&&<WealthTab/>}{tab==="am"&&<AMTab/>}{tab==="cm"&&<CMTab/>}{tab==="arrtbr"&&<ARRTab/>}{tab==="score"&&<ScoreTab/>}
    </div>
  </div>;
}