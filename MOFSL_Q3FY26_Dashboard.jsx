import { useState, Fragment } from "react";
import { BarChart, Bar, LineChart, Line, ComposedChart, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const C = { accent:"#3b82f6", green:"#22c55e", red:"#ef4444", purple:"#a855f7", teal:"#14b8a6", orange:"#f97316", pink:"#ec4899", amber:"#f59e0b", slate:"#64748b", sky:"#0ea5e9", indigo:"#6366f1" };
const SEG = [C.accent, C.green, C.purple, C.orange, C.pink, C.teal, C.amber];
const fmt = (v,d=1) => { if(v==null) return "—"; if(Math.abs(v)>=100000) return `${(v/1000).toFixed(0)}K`; return typeof v==="number" ? v.toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d}) : v; };
const pct = (v,d=1) => v==null ? "—" : `${(v*100).toFixed(d)}%`;
const yoy = (c,p) => p ? `${((c-p)/Math.abs(p)*100).toFixed(1)}%` : "—";

const Tip = ({active,payload,label}) => { if(!active||!payload) return null; return <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-gray-700"><p className="font-bold mb-1 text-gray-300">{label}</p>{payload.map((p,i)=><p key={i} className="flex justify-between gap-6"><span style={{color:p.color}}>{p.name}</span><span className="font-semibold text-white">{fmt(p.value)}</span></p>)}</div>; };
const KPI = ({label,value,sub,color=C.accent,trend}) => <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p><p className="text-2xl font-extrabold mt-1" style={{color}}>{value}</p>{sub&&<p className={`text-xs mt-1 font-medium ${trend==="up"?"text-emerald-600":trend==="down"?"text-red-500":"text-gray-400"}`}>{trend==="up"?"▲ ":trend==="down"?"▼ ":""}{sub}</p>}</div>;
const Card = ({children}) => <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">{children}</div>;
const CT = ({children}) => <h4 className="text-sm font-bold text-gray-700 mb-3">{children}</h4>;
const Sec = ({title,sub,children}) => <div className="mb-6"><div className="mb-3"><h3 className="text-base font-bold text-gray-900">{title}</h3>{sub&&<p className="text-xs text-gray-500 mt-0.5">{sub}</p>}</div>{children}</div>;
const CW = ({h=280,children}) => <ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>;
const xFY = {dataKey:"fy",tick:{fontSize:11}};
const yL = {tick:{fontSize:10}};
const yR = {orientation:"right",tick:{fontSize:10}};
const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />;
const leg = <Legend wrapperStyle={{fontSize:10}} />;
const tip = <Tooltip content={<Tip />} />;

// ━━━ RAW QUARTERLY DATA (source for annual aggregation) ━━━━━━━━━━━━━━━━━━━━
const Q_ = ["Q1FY24","Q2FY24","Q3FY24","Q4FY24","Q1FY25","Q2FY25","Q3FY25","Q4FY25","Q1FY26","Q2FY26","Q3FY26"];
const FY_ = ["FY21","FY22","FY23","FY24","FY25"];
const mk = (keys,vals,lbl,lk) => lbl.map((l,i)=>{ let o={[lk]:l}; keys.forEach(k=>o[k]=vals[k][i]); return o; });

const cQ = mk(["grossRev","netRev","opPAT","treasPAT","totalPAT"],{grossRev:[1283.6,1446.4,1475.4,1856.5,1815.6,2101.3,1945.8,1880.5,2016.4,2265.8,2401.8],netRev:[857.4,934.3,943.1,1208.7,1140.8,1370.0,1344.9,1321.9,1428.0,1550.5,1631.3],opPAT:[306.8,352.8,380.1,502.2,435.6,541.0,525.0,527.2,533.9,593.9,617.5],treasPAT:[364.8,202.6,394.0,122.8,585.3,700.6,-69.3,-751.4,896.3,399.2,211.8],totalPAT:[671.6,555.4,774.1,624.9,1020.9,1241.6,455.6,-224.2,1430.2,993.1,829.3]},Q_,"q");
const cA = mk(["grossRev","netRev","opPAT","totalPAT","nw","roe"],{grossRev:[3006.1,3948.0,4365.4,6061.9,7743.1],netRev:[1940.0,2623.3,2947.5,3943.5,5177.7],opPAT:[670.9,1092.9,1115.2,1541.8,2028.8],totalPAT:[1552.3,1350.8,885.2,2626.0,2494.0],nw:[4461,5674,6252,8732,11079],roe:[41.1,26.7,14.8,35.1,25.2]},FY_,"fy");

const wQ = mk(["grossRev","netRev","nii","brokerage","distribution","otherOp","pbt","pat","clientAssets","distAUM","costIncome","netFlows","arr","tbr"],{grossRev:[672.2,825.0,822.5,1071.1,1054.6,1189.3,961.0,957.7,975.2,969.0,1026.4],netRev:[374.6,418.4,438.9,558.9,533.1,637.2,570.4,599.2,567.1,559.6,572.3],nii:[127.9,143.8,153.6,185.4,185.0,222.9,213.8,212.4,206.7,252.4,257.9],brokerage:[163.9,215.2,205.0,265.8,262.1,285.7,225.0,161.1,193.3,183.8,212.0],distribution:[31.5,41.3,55.2,77.8,53.6,97.4,97.6,191.7,135.1,95.0,63.0],otherOp:[51.3,17.9,24.9,30.0,32.3,31.7,34.0,34.0,31.9,28.5,39.1],pbt:[139.3,175.8,219.7,277.4,235.0,303.0,255.1,254.1,230.9,228.9,244.1],pat:[105.1,131.5,164.4,211.0,177.3,224.5,190.0,190.7,173.0,169.7,180.7],clientAssets:[129078,156949,184216,201743,264971,294365,308329,264888,312506,310230,318545],distAUM:[18407,20559,23192,23715,26029,29431,31918,31546,38129,40544,42775],costIncome:[0.63,0.58,0.50,0.50,0.56,0.52,0.55,0.58,0.59,0.59,0.57],netFlows:[2012,903,772,1492,2644,1844,2656,3135,3968,3842,2238],arr:[147.7,174.0,183.8,219.9,211.5,254.9,249.4,241.2,241.4,298.6,293.5],tbr:[225.9,244.2,254.9,339.1,320.6,381.8,320.9,358.0,325.7,261.1,278.5]},Q_,"q");

const pQ = mk(["grossRev","netRev","distribution","nii","brokerage","delphi","pbt","pat","totalAUM","families","rms","costIncome","netFlows","arrFlows","custody","arr","tbr"],{grossRev:[186.0,188.7,243.3,284.0,239.9,306.4,374.9,309.5,358.9,360.9,308.5],netRev:[144.4,160.0,172.6,228.1,184.3,242.1,278.3,215.7,282.4,291.5,242.3],distribution:[56.2,46.6,58.3,92.2,51.8,83.4,145.8,98.5,165.8,157.1,95.1],nii:[36.8,43.6,48.4,57.1,63.5,75.9,69.9,65.9,61.9,75.8,84.8],brokerage:[50.1,67.7,63.0,73.4,67.4,79.3,59.3,49.9,52.6,56.1,59.6],delphi:[1.1,1.8,0.8,3.3,1.6,1.5,3.3,1.1,2.0,2.0,2.9],pbt:[72.7,71.9,82.2,109.2,79.5,120.2,128.6,101.1,118.5,147.7,115.2],pat:[54.3,53.8,61.3,80.0,59.5,89.8,96.6,74.7,88.6,109.7,81.9],totalAUM:[83924,93265,111563,123969,139320,157091,149271,144245,174138,186886,195541],families:[4075,4274,4542,4804,5104,5433,5838,6221,6548,7076,8214],rms:[217,247,284,313,330,330,342,351,351,386,411],costIncome:[0.50,0.55,0.53,0.53,0.57,0.51,0.54,0.53,0.58,0.49,0.52],netFlows:[3040,1386,3827,1093,3288,2484,5241,3329,2839,7359,4314],arrFlows:[2039,724,2868,381,2801,1959,1925,2187,1439,4808,2754],custody:[22300,26600,36700,42500,46741,52497,46445,46439,65682,52030,70843],arr:[64.9,75.2,79.7,119.5,103.0,115.8,115.0,108.4,110.7,161.6,147.6],tbr:[79.2,84.5,90.9,106.0,81.1,124.3,163.2,106.7,171.5,129.5,94.9]},Q_,"q");

const cmQD = mk(["grossRev","netRev","netBroking","feesIncome","nii","otherOp","empExp","adminExp","pbt","pat"],{grossRev:[141.0,116.8,91.9,103.2,142.4,182.6,158.5,143.3,220.2,218.9,178.7],netRev:[136.4,112.8,88.6,97.3,134.4,173.7,150.8,138.6,216.7,208.8,164.5],netBroking:[73.0,76.4,49.9,64.9,76.0,83.2,74.7,72.9,113.4,74.3,81.3],feesIncome:[51.4,22.4,23.6,15.8,41.4,72.6,60.0,48.2,78.4,120.0,65.5],nii:[10.9,11.4,15.3,15.4,15.8,16.6,15.4,18.9,24.4,14.4,17.8],otherOp:[1.1,2.7,-0.2,1.1,1.2,1.5,0.7,-1.4,0.6,0.2,0.0],empExp:[47.1,37.9,23.3,21.7,44.0,57.5,53.9,31.4,65.4,71.8,54.0],adminExp:[9.0,9.7,11.2,11.9,13.1,18.9,16.7,20.5,16.1,16.8,20.0],pbt:[80.3,65.3,54.0,63.7,77.2,97.4,80.3,86.7,135.2,120.2,90.5],pat:[60.0,49.9,40.5,47.1,57.4,72.6,60.7,67.1,101.1,89.9,69.9]},Q_,"q");
const cmAD = mk(["netRev","pat"],{netRev:[197.0,266.9,231.3,435.2,597.5],pat:[62.2,107.3,82.4,196.5,257.9]},FY_,"fy");

const aQ = mk(["grossRev","netRev","amcRev","pbt","pat","totalAUM","sipAUM","sipFlows","activeFolios","netFlows","mtm","lendingBook","costIncome","indivMF"],{grossRev:[201.5,218.3,240.5,341.2,283.8,333.8,363.3,366.6,373.0,448.9,529.0],netRev:[148.4,162.6,177.2,253.4,205.7,248.9,273.2,281.6,284.5,357.7,423.0],amcRev:[112.6,121.5,138.4,177.8,163.8,200.5,221.6,212.4,234.0,268.9,288.8],pbt:[89.9,102.4,111.0,167.5,135.7,165.7,183.1,187.4,186.9,234.9,297.9],pat:[66.4,77.1,83.1,130.2,101.9,123.7,137.6,152.7,141.4,180.3,227.4],totalAUM:[61262,64918,74242,81858,98613,121183,141505,133775,161610,176561,188687],sipAUM:[8236,8947,10499,11940,14606,17641,20795,20481,26051,28432,31814],sipFlows:[535,650,769,967,1198,1878,2922,3258,3513,4172,4515],activeFolios:[1449182,1626093,1931424,2320889,2856938,4816036,6780088,7891122,10323824,11441517,12119704],netFlows:[-1359,260,2006,4050,6301,12836,19093,10549,9030,20011,11610],mtm:[6723,3396,7317,3566,10453,9734,1229,-18278,18805,-5060,516],lendingBook:[0,0,0,0,196,425,460,475,621,801,865],costIncome:[0.39,0.37,0.38,0.34,0.34,0.33,0.33,0.34,0.34,0.34,0.30],indivMF:[27284,29035,34846,40131,50105,66398,83547,81546,100967,107492,116278]},Q_,"q");

const hQ = mk(["intIncome","intExpense","nii","otherOp","totalIncome","ppop","pbt","pat","disbursement","loanBook","nw","yieldPct","cofPct","spreadPct","nimPct","gnplPct","crarPct","branches","roe","costIncome","de"],{intIncome:[137.9,137.4,138.3,144.7,146.5,147.7,153.9,160.1,172.1,176.4,178.4],intExpense:[62.3,60.1,59.6,68.4,64.9,67.3,66.4,69.0,77.7,80.7,82.2],nii:[75.8,78.0,80.1,78.3,82.3,81.5,88.3,91.4,94.3,95.7,96.2],otherOp:[5.6,5.3,6.7,9.0,8.4,5.9,8.2,18.6,5.9,14.7,20.3],totalIncome:[81.3,83.4,86.8,87.2,90.7,87.4,96.5,110.0,100.2,110.4,116.5],ppop:[47.7,46.4,48.9,40.2,42.2,36.2,40.9,48.8,41.7,48.9,51.8],pbt:[38.2,43.5,47.7,41.9,37.5,34.9,47.9,46.2,30.7,42.8,54.9],pat:[29.5,33.6,37.2,32.2,29.3,26.8,37.2,36.9,23.9,34.0,41.7],disbursement:[93,197,236,480,252,368,394,781,395,544,364],loanBook:[3749,3730,3754,4048,4098,4209,4321,4857,5006,5161,5254],nw:[1179,1214,1253,1287,1321,1353,1393,1429,1460,1499,1543],yieldPct:[14,14,14,14,14,14,14,13,13,13,13],cofPct:[8,8,8,8,8,8,8,8,8,8,8],spreadPct:[6,6,6,6,5,5,5,5,5,5,5],nimPct:[8,8,8,7,7,7,8,7,7,7,7],gnplPct:[2,2,2,1,1,1,1,1,1,1,1],crarPct:[47,47,42,45,45,46,44,41,41,43,41],branches:[111,111,111,111,111,112,113,112,113,116,126],roe:[10,11,12,10,9,8,11,10,7,9,11],costIncome:[41,44,44,54,53,58,58,56,58,56,56],de:[2.30,2.20,2.24,2.33,2.27,2.25,2.13,2.59,2.50,2.54,2.66]},Q_,"q");

const tQ = mk(["totalIncome","pat","oci","tci","totalInv","xirr","mfAlternates","peRe","equityShares","otherInv"],{totalIncome:[335.6,295.2,413.8,406.4,602.0,851.3,167.0,-560.1,847.7,-94.7,92.7],pat:[220.2,178.2,279.8,221.0,446.4,578.9,39.5,-592.0,628.0,-191.3,-44.9],oci:[144.6,24.4,114.0,-98.2,138.9,121.6,-108.8,-159.4,268.1,-77.1,155.0],tci:[364.8,202.6,393.8,122.8,585.2,700.6,-69.4,-751.4,896.1,-268.5,110.1],totalInv:[5215,5558,6393,6500,7084,8171,8566,8426,9778,10018,10304],xirr:[17,17,18,17,20,21,20,18,20,19,18],mfAlternates:[2711,2968,3474,3835,4646,5338,5785,4982,5719,5445,5526],peRe:[1213,1333,1423,1404,1208,1432,1463,1572,1580,1714,1750],equityShares:[845,848,985,868,965,1113,974,937,1318,1798,2285],otherInv:[436,400,501,388,259,280,336,927,1162,1061,742]},Q_,"q");
const tA = mk(["totalIncome","pat","tci"],{totalIncome:[910.3,480.2,138.6,1451.0,1060.1],pat:[654.7,218.1,-182.4,899.3,473.0],tci:[944.3,257.9,-230.1,1084.2,465.2]},FY_,"fy");

const nwAlloc = [{period:"FY21",lending:2444.8,hfc:887.9,treasury:969.8,fixed:159.3},{period:"FY22",lending:3292.4,hfc:980.7,treasury:1112.3,fixed:287.9},{period:"FY23",lending:3793.6,hfc:1118.7,treasury:858.4,fixed:480.9},{period:"FY24",lending:4455.7,hfc:1254.4,treasury:2075.6,fixed:946.3},{period:"FY25",lending:5713.9,hfc:1385.1,treasury:2447.4,fixed:1532.9},{period:"9MFY26",lending:6987.0,hfc:1488.9,treasury:3314.1,fixed:1841.8}];
const segPAT = [{fy:"FY21",wm:259.4,cm:62.2,amc:218.7,pwm:103.6,hfc:40.2,opPAT:683.9,nw:4461.8},{fy:"FY22",wm:406.7,cm:107.3,amc:266.9,pwm:182.5,hfc:94.9,opPAT:1058.3,nw:5673.3},{fy:"FY23",wm:464.2,cm:82.4,amc:265.4,pwm:186.4,hfc:132.6,opPAT:1131.1,nw:6251.6},{fy:"FY24",wm:613.2,cm:196.5,amc:356.7,pwm:250.0,hfc:132.6,opPAT:1549.0,nw:8732.0},{fy:"FY25",wm:782.5,cm:257.9,amc:515.9,pwm:320.5,hfc:130.3,opPAT:2007.0,nw:11079.3}];
const fcst = [{fy:"FY25A",opPAT:2029,totalPAT:2494,nw:11079,wm:782.5,cm:257.9,amc:515.9,pwm:320.5,hfc:130.3},{fy:"FY26E",opPAT:2293,totalPAT:2576,nw:13398,wm:743.4,cm:322.4,amc:678.6,pwm:400.6,hfc:148.2},{fy:"FY27E",opPAT:2873,totalPAT:3230,nw:16304,wm:892.1,cm:386.9,amc:916.2,pwm:500.8,hfc:177.3},{fy:"FY28E",opPAT:3585,totalPAT:3993,nw:19898,wm:1070.5,cm:444.9,amc:1236.8,pwm:626.0,hfc:206.7}];

// ━━━ ANNUAL AGGREGATION HELPERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FY24 = Q1-Q4 (idx 0-3), FY25 = Q1-Q4 (idx 4-7), FY26E = 9M (idx 8-10) × 4/3
const F3 = ["FY24","FY25","FY26E"];
const QR = [[0,3],[4,7],[8,10]]; // quarter ranges
const ML = [1,1,4/3]; // annualization multiplier
const sq = (a,k,s,e) => a.slice(s,e+1).reduce((t,r)=>t+(r[k]||0),0);
const mkA = (q, flows, stocks=[], avgs=[]) => F3.map((fy,i) => {
  const [s,e]=QR[i], m=ML[i], n=e-s+1;
  let o={fy};
  flows.forEach(k=>o[k]=+(sq(q,k,s,e)*m).toFixed(1));
  stocks.forEach(k=>o[k]=q[e][k]);
  avgs.forEach(k=>o[k]=+(sq(q,k,s,e)/n).toFixed(2));
  return o;
});

// Consolidated annual (extend cA with FY26E)
const cA6 = [...cA, {fy:"FY26E", grossRev:+(sq(cQ,"grossRev",8,10)*4/3).toFixed(1), netRev:+(sq(cQ,"netRev",8,10)*4/3).toFixed(1), opPAT:+(sq(cQ,"opPAT",8,10)*4/3).toFixed(1), totalPAT:+(sq(cQ,"totalPAT",8,10)*4/3).toFixed(1), nw:13632, roe:25.5}];

// Segment PAT with FY26E
const segPAT6 = [...segPAT, {fy:"FY26E", wm:+(sq(wQ,"pat",8,10)*4/3).toFixed(1), cm:+(sq(cmQD,"pat",8,10)*4/3).toFixed(1), amc:+(sq(aQ,"pat",8,10)*4/3).toFixed(1), pwm:+(sq(pQ,"pat",8,10)*4/3).toFixed(1), hfc:+(sq(hQ,"pat",8,10)*4/3).toFixed(1), opPAT:+(sq(cQ,"opPAT",8,10)*4/3).toFixed(1), nw:13632}];

// WM annual
const wA = mkA(wQ, ["grossRev","netRev","nii","brokerage","distribution","otherOp","pbt","pat","netFlows","arr","tbr"], ["clientAssets","distAUM"], ["costIncome"]);

// PWM annual
const pA = mkA(pQ, ["grossRev","netRev","nii","brokerage","distribution","delphi","pbt","pat","netFlows","arrFlows","arr","tbr"], ["totalAUM","families","rms","custody"], ["costIncome"]);

// Combined WM+PWM annual
const wpA = F3.map((fy,i) => {
  const w=wA[i], p=pA[i];
  return { fy, netRev:+(w.netRev+p.netRev).toFixed(1), nii:+(w.nii+p.nii).toFixed(1), brok:+(w.brokerage+p.brokerage).toFixed(1), dist:+(w.distribution+p.distribution).toFixed(1), other:+(w.otherOp+p.delphi).toFixed(1), pbt:+(w.pbt+p.pbt).toFixed(1), pat:+(w.pat+p.pat).toFixed(1), aum:w.clientAssets+p.totalAUM, flows:+(w.netFlows+p.netFlows).toFixed(0), arr:+(w.arr+p.arr).toFixed(1), tbr:+(w.tbr+p.tbr).toFixed(1), wmNII:w.nii, pwmNII:p.nii, wmBrok:w.brokerage, pwmBrok:p.brokerage, wmDist:w.distribution, pwmDist:p.distribution, wmPAT:w.pat, pwmPAT:p.pat };
});

// CM annual
const cmA = mkA(cmQD, ["grossRev","netRev","netBroking","feesIncome","nii","otherOp","empExp","adminExp","pbt","pat"], [], []);

// AMC annual
const amcA = mkA(aQ, ["grossRev","netRev","amcRev","pbt","pat","sipFlows","netFlows","mtm"], ["totalAUM","sipAUM","activeFolios","lendingBook"], ["costIncome"]);

// HFC annual
const hfcA = mkA(hQ, ["intIncome","intExpense","nii","otherOp","totalIncome","ppop","pbt","pat","disbursement"], ["loanBook","nw","branches"], ["yieldPct","cofPct","spreadPct","nimPct","gnplPct","crarPct","roe","costIncome","de"]);

// Treasury annual
const trA = mkA(tQ, ["totalIncome","pat","oci","tci"], ["totalInv","mfAlternates","peRe","equityShares","otherInv"], ["xirr"]);
// Extend with historical tA
const tA6 = [...tA, {fy:"FY26E", totalIncome:trA[2].totalIncome, pat:trA[2].pat, tci:trA[2].tci}];

// Revenue Streams annual
const rs = Q_.map((q,i) => ({ q,
  wmNII:wQ[i].nii, pwmNII:pQ[i].nii, cmNII:cmQD[i].nii, hfcNII:hQ[i].nii,
  totalNII: wQ[i].nii+pQ[i].nii+cmQD[i].nii+hQ[i].nii + (aQ[i].netRev - aQ[i].amcRev),
  wmBrok:wQ[i].brokerage, pwmBrok:pQ[i].brokerage, cmBrok:cmQD[i].netBroking,
  brok: wQ[i].brokerage+pQ[i].brokerage+cmQD[i].netBroking,
  wmDist:wQ[i].distribution, pwmDist:pQ[i].distribution,
  dist: wQ[i].distribution+pQ[i].distribution,
  amcFee: aQ[i].amcRev,
  cmAdv:cmQD[i].feesIncome, pwmDelphi:pQ[i].delphi,
  adv: cmQD[i].feesIncome+pQ[i].delphi,
  totalFee: wQ[i].brokerage+pQ[i].brokerage+cmQD[i].netBroking+wQ[i].distribution+pQ[i].distribution+aQ[i].amcRev+cmQD[i].feesIncome+pQ[i].delphi,
  treasInc: tQ[i].totalIncome,
  wmOther:wQ[i].otherOp, cmOther:cmQD[i].otherOp, hfcOther:hQ[i].otherOp, amcOther:aQ[i].netRev-aQ[i].amcRev,
  segOther: wQ[i].otherOp+cmQD[i].otherOp,
  totalOther: tQ[i].totalIncome+hQ[i].otherOp+wQ[i].otherOp+cmQD[i].otherOp,
}));

// Revenue Streams aggregated to annual
const rsKeys = ["totalNII","brok","dist","amcFee","adv","totalFee","treasInc","segOther","totalOther","wmNII","pwmNII","cmNII","hfcNII","wmBrok","pwmBrok","cmBrok","wmDist","pwmDist","cmAdv","pwmDelphi","wmOther","cmOther","hfcOther","amcOther"];
const rsA = F3.map((fy,i) => {
  const [s,e]=QR[i], m=ML[i]; let o={fy};
  rsKeys.forEach(k => o[k]=+(sq(rs,k,s,e)*m).toFixed(1));
  return o;
});

// Stream valuation helpers
const SHARES = 60.2;
const CMP = 697;
const sr = (k,s,e) => rs.slice(s,e+1).reduce((a,r)=>a+(r[k]||0),0);

const streamDetail = [
  { stream:"Net Interest Income", bear:3.5, base:5.0, bull:6.5, subs:[
    {seg:"WM", k:"wmNII"}, {seg:"PWM", k:"pwmNII"}, {seg:"Capital Mkt", k:"cmNII"}, {seg:"HFC", k:"hfcNII"}, {seg:"AMC Alt/Lending", k:"amcOther"}
  ]},
  { stream:"Brokerage & Trading", bear:2.5, base:3.5, bull:4.5, subs:[
    {seg:"WM", k:"wmBrok"}, {seg:"PWM", k:"pwmBrok"}, {seg:"Capital Mkt", k:"cmBrok"}
  ]},
  { stream:"Distribution / Trail", bear:8, base:11, bull:14, subs:[
    {seg:"WM", k:"wmDist"}, {seg:"PWM", k:"pwmDist"}
  ]},
  { stream:"AMC Management Fees", bear:14, base:19, bull:22, subs:[
    {seg:"MOAMC", k:"amcFee"}
  ]},
  { stream:"Advisory / IB Fees", bear:3, base:4.5, bull:6, subs:[
    {seg:"CM IB/ECM", k:"cmAdv"}, {seg:"PWM Delphi", k:"pwmDelphi"}
  ]},
  { stream:"Treasury / Prop Book", bear:0.5, base:0.75, bull:1.0, isCap:true, capDep:trA[2].totalInv, subs:[]},
  { stream:"Other Operating", bear:2, base:3, bull:4, subs:[
    {seg:"WM Other", k:"wmOther"}, {seg:"CM Other", k:"cmOther"}, {seg:"HFC Fees", k:"hfcOther"}
  ]},
];
streamDetail.forEach(s => {
  if(s.isCap) { s.totalAnn = s.capDep; s.fy24=0; s.fy25=0; s.m9=0; }
  else {
    s.fy24 = s.subs.reduce((a,sub)=>a+sr(sub.k,0,3),0);
    s.fy25 = s.subs.reduce((a,sub)=>a+sr(sub.k,4,7),0);
    s.m9 = s.subs.reduce((a,sub)=>a+sr(sub.k,8,10),0);
    s.totalAnn = s.m9*4/3;
  }
  s.subs.forEach(sub => {
    sub.fy24 = sr(sub.k,0,3); sub.fy25 = sr(sub.k,4,7); sub.m9 = sr(sub.k,8,10); sub.ann = sub.m9*4/3;
    sub.pct = s.totalAnn > 0 ? sub.ann/s.totalAnn : 0;
  });
  s.bearVal = s.totalAnn*s.bear/SHARES; s.baseVal = s.totalAnn*s.base/SHARES; s.bullVal = s.totalAnn*s.bull/SHARES;
});
const sVal = streamDetail;

// ━━━ TAB COMPONENTS (all annual) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ═══ OVERVIEW ═══
const Overview = () => { const fy26=cA6[5], fy25=cA6[4]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="FY26E Gross Rev" value={`₹${fmt(fy26.grossRev,0)} Cr`} sub={`${yoy(fy26.grossRev,fy25.grossRev)} YoY`} trend="up" color={C.accent}/>
    <KPI label="FY26E Net Rev" value={`₹${fmt(fy26.netRev,0)} Cr`} sub={`${yoy(fy26.netRev,fy25.netRev)} YoY`} trend="up" color={C.teal}/>
    <KPI label="FY26E Op PAT" value={`₹${fmt(fy26.opPAT,0)} Cr`} sub={`${yoy(fy26.opPAT,fy25.opPAT)} YoY`} trend="up" color={C.green}/>
    <KPI label="FY26E Total PAT" value={`₹${fmt(fy26.totalPAT,0)} Cr`} sub="incl. Treasury" color={C.purple}/>
    <KPI label="FY25 Net Worth" value={`₹${fmt(fy25.nw,0)} Cr`} sub={`RoE ${fy25.roe}%`} color={C.orange}/>
    <KPI label="FY26E NW" value={`₹${fmt(fy26.nw,0)} Cr`} sub={`${yoy(fy26.nw,fy25.nw)} vs FY25`} trend="up" color={C.pink}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Revenue Trajectory (₹ Cr)</CT><CW h={260}><ComposedChart data={cA6}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="grossRev" name="Gross Revenue" fill={C.accent} opacity={0.3} radius={[3,3,0,0]}/><Bar dataKey="netRev" name="Net Revenue" fill={C.accent} radius={[3,3,0,0]}/><Line dataKey="opPAT" name="Op PAT" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
    <Card><CT>Operating PAT vs Treasury PAT (₹ Cr)</CT><CW h={260}><ComposedChart data={[...cA.map(r=>({fy:r.fy, opPAT:r.opPAT, treasPAT:r.totalPAT-r.opPAT, totalPAT:r.totalPAT})), {fy:"FY26E", opPAT:cA6[5].opPAT, treasPAT:+(sq(cQ,"treasPAT",8,10)*4/3).toFixed(1), totalPAT:cA6[5].totalPAT}]}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="opPAT" name="Operating PAT" fill={C.green} radius={[3,3,0,0]}/><Bar dataKey="treasPAT" name="Treasury PAT" fill={C.purple} radius={[3,3,0,0]}/><Line dataKey="totalPAT" name="Total PAT" stroke={C.red} strokeWidth={2} dot={{r:3}}/></ComposedChart></CW></Card>
  </div>
  <Card><CT>Annual Performance (₹ Cr) & RoE %</CT><CW h={280}><ComposedChart data={cA6}>{grid}<XAxis {...xFY}/><YAxis yAxisId="l" {...yL}/><YAxis yAxisId="r" {...yR} unit="%"/>{tip}{leg}<Bar yAxisId="l" dataKey="grossRev" name="Gross Rev" fill={C.accent} opacity={0.2} radius={[3,3,0,0]}/><Bar yAxisId="l" dataKey="opPAT" name="Op PAT" fill={C.green} radius={[3,3,0,0]}/><Bar yAxisId="l" dataKey="totalPAT" name="Total PAT" fill={C.purple} radius={[3,3,0,0]}/><Line yAxisId="r" dataKey="roe" name="RoE %" stroke={C.red} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
  <Sec title="Segment PAT Composition" sub="Annual PAT by business (₹ Cr)"><Card><CW h={280}><BarChart data={segPAT6}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wm" name="WM" fill={SEG[0]} stackId="a"/><Bar dataKey="cm" name="Capital Mkt" fill={SEG[1]} stackId="a"/><Bar dataKey="amc" name="AMC" fill={SEG[2]} stackId="a"/><Bar dataKey="pwm" name="PWM" fill={SEG[3]} stackId="a"/><Bar dataKey="hfc" name="HFC" fill={SEG[4]} stackId="a"/></BarChart></CW></Card></Sec>
</div>; };

// ═══ COMBINED WM + PWM ═══
const WPTab = () => { const L=wpA[2],P=wpA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="FY26E Net Rev" value={`₹${fmt(L.netRev,0)} Cr`} sub={`${yoy(L.netRev,P.netRev)} YoY`} trend={L.netRev>P.netRev?"up":"down"} color={C.accent}/>
    <KPI label="FY26E PAT" value={`₹${fmt(L.pat,0)} Cr`} sub={`WM ₹${fmt(L.wmPAT,0)} + PWM ₹${fmt(L.pwmPAT,0)}`} color={C.green}/>
    <KPI label="AUM (End)" value={`₹${fmt(L.aum/1000,0)}K Cr`} sub={`${yoy(L.aum,P.aum)} YoY`} trend="up" color={C.purple}/>
    <KPI label="FY26E Net Flows" value={`₹${fmt(L.flows,0)} Cr`} sub="WM+PWM combined" color={C.teal}/>
    <KPI label="FY26E ARR" value={`₹${fmt(L.arr,0)} Cr`} sub={`${(L.arr/(L.arr+L.tbr)*100).toFixed(0)}% of net rev`} color={C.orange}/>
    <KPI label="FY26E TBR" value={`₹${fmt(L.tbr,0)} Cr`} sub={`${(L.tbr/(L.arr+L.tbr)*100).toFixed(0)}% of net rev`} color={C.pink}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Net Revenue by Stream (₹ Cr)</CT><CW><BarChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="nii" name="NII (Interest)" fill={C.accent} stackId="a"/><Bar dataKey="brok" name="Brokerage" fill={C.green} stackId="a"/><Bar dataKey="dist" name="Distribution" fill={C.purple} stackId="a"/><Bar dataKey="other" name="Other / PMS" fill={C.slate} stackId="a"/></BarChart></CW></Card>
    <Card><CT>NII Split: WM vs PWM (₹ Cr)</CT><CW><BarChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wmNII" name="WM NII" fill={C.accent} stackId="a"/><Bar dataKey="pwmNII" name="PWM NII" fill={C.teal} stackId="a"/></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Brokerage Split: WM vs PWM (₹ Cr)</CT><CW><BarChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wmBrok" name="WM Brokerage" fill={C.green} stackId="a"/><Bar dataKey="pwmBrok" name="PWM Brokerage" fill={C.orange} stackId="a"/></BarChart></CW></Card>
    <Card><CT>Distribution Split: WM vs PWM (₹ Cr)</CT><CW><BarChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wmDist" name="WM Distribution" fill={C.purple} stackId="a"/><Bar dataKey="pwmDist" name="PWM Distribution" fill={C.pink} stackId="a"/></BarChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>PAT Build (₹ Cr)</CT><CW h={260}><ComposedChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netRev" name="Net Revenue" fill={C.accent} opacity={0.2} radius={[3,3,0,0]}/><Bar dataKey="pbt" name="PBT" fill={C.orange} opacity={0.5} radius={[3,3,0,0]}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
    <Card><CT>ARR vs Transactional Revenue (₹ Cr)</CT><CW h={260}><BarChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="arr" name="ARR (Annuity)" fill={C.teal} stackId="a"/><Bar dataKey="tbr" name="TBR (Transactional)" fill={C.orange} stackId="a"/></BarChart></CW></Card>
  </div>
  <Card><CT>AUM & Net Flows (₹ Cr)</CT><CW h={240}><ComposedChart data={wpA}>{grid}<XAxis {...xFY}/><YAxis yAxisId="l" {...yL}/><YAxis yAxisId="r" {...yR}/>{tip}{leg}<Bar yAxisId="l" dataKey="aum" name="Total AUM" fill={C.accent} opacity={0.3} radius={[3,3,0,0]}/><Bar yAxisId="r" dataKey="flows" name="Net Flows" fill={C.green} radius={[3,3,0,0]}/></ComposedChart></CW></Card>
</div>; };

// ═══ CM TAB ═══
const CMTab = () => { const L=cmA[2],P=cmA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    <KPI label="FY26E Net Rev" value={`₹${fmt(L.netRev,0)} Cr`} sub={`${yoy(L.netRev,P.netRev)} YoY`} trend={L.netRev>P.netRev?"up":"down"} color={C.accent}/>
    <KPI label="FY26E PAT" value={`₹${fmt(L.pat,0)} Cr`} sub={`${yoy(L.pat,P.pat)} YoY`} trend={L.pat>P.pat?"up":"down"} color={C.green}/>
    <KPI label="FY26E Fees / IB" value={`₹${fmt(L.feesIncome,0)} Cr`} color={C.purple}/>
    <KPI label="FY26E Net Broking" value={`₹${fmt(L.netBroking,0)} Cr`} color={C.teal}/>
    <KPI label="FY26E NII" value={`₹${fmt(L.nii,0)} Cr`} color={C.orange}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Net Revenue by Stream (₹ Cr)</CT><CW><BarChart data={cmA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netBroking" name="Net Broking" fill={C.accent} stackId="a"/><Bar dataKey="feesIncome" name="Fees / IB" fill={C.purple} stackId="a"/><Bar dataKey="nii" name="NII" fill={C.teal} stackId="a"/><Bar dataKey="otherOp" name="Other" fill={C.slate} stackId="a"/></BarChart></CW></Card>
    <Card><CT>PAT Build (₹ Cr)</CT><CW><ComposedChart data={cmA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netRev" name="Net Revenue" fill={C.accent} opacity={0.2} radius={[3,3,0,0]}/><Bar dataKey="pbt" name="PBT" fill={C.orange} opacity={0.5} radius={[3,3,0,0]}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
  </div>
  <Card><CT>CM Annual — Historical (₹ Cr)</CT><CW h={240}><ComposedChart data={[...cmAD, {fy:"FY26E", netRev:cmA[2].netRev, pat:cmA[2].pat}]}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netRev" name="Net Revenue" fill={C.accent} opacity={0.3} radius={[3,3,0,0]}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
</div>; };

// ═══ AMC TAB ═══
const AMCTab = () => { const L=amcA[2],P=amcA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="FY26E Net Rev" value={`₹${fmt(L.netRev,0)} Cr`} sub={`${yoy(L.netRev,P.netRev)} YoY`} trend="up" color={C.accent}/>
    <KPI label="FY26E PAT" value={`₹${fmt(L.pat,0)} Cr`} sub={`${yoy(L.pat,P.pat)} YoY`} trend="up" color={C.green}/>
    <KPI label="AUM (End)" value={`₹${fmt(L.totalAUM/1000,0)}K Cr`} trend="up" color={C.purple}/>
    <KPI label="FY26E SIP Flows" value={`₹${fmt(L.sipFlows,0)} Cr`} trend="up" color={C.teal}/>
    <KPI label="Active Folios" value={`${(L.activeFolios/1e6).toFixed(1)}mn`} trend="up" color={C.orange}/>
    <KPI label="Avg Cost/Income" value={pct(L.costIncome,0)} sub="Best-in-class" color={C.pink}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Revenue: Gross → Net → AMC Fees (₹ Cr)</CT><CW><BarChart data={amcA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="grossRev" name="Gross Revenue" fill={C.accent} opacity={0.25} radius={[3,3,0,0]}/><Bar dataKey="netRev" name="Net Revenue" fill={C.accent} radius={[3,3,0,0]}/><Bar dataKey="amcRev" name="AMC Mgmt Fees" fill={C.teal} radius={[3,3,0,0]}/></BarChart></CW></Card>
    <Card><CT>PAT Build (₹ Cr)</CT><CW><ComposedChart data={amcA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netRev" name="Net Revenue" fill={C.accent} opacity={0.2} radius={[3,3,0,0]}/><Bar dataKey="pbt" name="PBT" fill={C.orange} opacity={0.5} radius={[3,3,0,0]}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>AUM & SIP Flows (₹ Cr)</CT><CW h={240}><ComposedChart data={amcA}>{grid}<XAxis {...xFY}/><YAxis yAxisId="l" {...yL}/><YAxis yAxisId="r" {...yR}/>{tip}{leg}<Bar yAxisId="l" dataKey="totalAUM" name="Total AUM" fill={C.accent} opacity={0.3} radius={[3,3,0,0]}/><Line yAxisId="r" dataKey="sipFlows" name="SIP Flows" stroke={C.green} strokeWidth={2} dot={{r:3}}/></ComposedChart></CW></Card>
    <Card><CT>Net Flows vs MTM (₹ Cr)</CT><CW h={240}><BarChart data={amcA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="netFlows" name="Net Flows" fill={C.green} radius={[3,3,0,0]}/><Bar dataKey="mtm" name="MTM" fill={C.purple} opacity={0.5} radius={[3,3,0,0]}/></BarChart></CW></Card>
  </div>
</div>; };

// ═══ HFC TAB ═══
const HFCTab = () => { const L=hfcA[2],P=hfcA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <KPI label="FY26E NII" value={`₹${fmt(L.nii,0)} Cr`} sub={`${yoy(L.nii,P.nii)} YoY`} trend="up" color={C.accent}/>
    <KPI label="FY26E PAT" value={`₹${fmt(L.pat,0)} Cr`} sub={`${yoy(L.pat,P.pat)} YoY`} trend="up" color={C.green}/>
    <KPI label="Loan Book (End)" value={`₹${fmt(L.loanBook,0)} Cr`} trend="up" color={C.purple}/>
    <KPI label="Avg NIM" value={`${L.nimPct}%`} color={C.teal}/>
    <KPI label="Avg GNPA" value={`${L.gnplPct}%`} color={C.green}/>
    <KPI label="Avg D/E" value={L.de} sub={`CRAR ${L.crarPct}%`} color={C.orange}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Revenue Build: Int Income → NII (₹ Cr)</CT><CW><ComposedChart data={hfcA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="intIncome" name="Interest Income" fill={C.accent} opacity={0.3} radius={[3,3,0,0]}/><Bar dataKey="intExpense" name="Interest Expense" fill={C.red} opacity={0.3} radius={[3,3,0,0]}/><Line dataKey="nii" name="NII" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
    <Card><CT>PAT Build (₹ Cr)</CT><CW><ComposedChart data={hfcA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="totalIncome" name="Total Income" fill={C.accent} opacity={0.15} radius={[3,3,0,0]}/><Bar dataKey="ppop" name="PPoP" fill={C.orange} opacity={0.4} radius={[3,3,0,0]}/><Line dataKey="pbt" name="PBT" stroke={C.purple} strokeWidth={2} dot={{r:3}}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></CW></Card>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Avg Yield / CoF / Spread / NIM (%)</CT><CW h={240}><LineChart data={hfcA}>{grid}<XAxis {...xFY}/><YAxis {...yL} unit="%"/>{tip}{leg}<Line dataKey="yieldPct" name="Yield" stroke={C.accent} strokeWidth={2} dot={{r:3}}/><Line dataKey="cofPct" name="CoF" stroke={C.red} strokeWidth={2} dot={{r:3}}/><Line dataKey="spreadPct" name="Spread" stroke={C.green} strokeWidth={2} dot={{r:3}}/><Line dataKey="nimPct" name="NIM" stroke={C.purple} strokeWidth={2.5} dot={{r:4}}/></LineChart></CW></Card>
    <Card><CT>Loan Book & Disbursements (₹ Cr)</CT><CW h={240}><ComposedChart data={hfcA}>{grid}<XAxis {...xFY}/><YAxis yAxisId="l" {...yL}/><YAxis yAxisId="r" {...yR}/>{tip}{leg}<Bar yAxisId="l" dataKey="loanBook" name="Loan Book" fill={C.accent} radius={[3,3,0,0]}/><Bar yAxisId="r" dataKey="disbursement" name="Disbursement" fill={C.green} opacity={0.6} radius={[3,3,0,0]}/></ComposedChart></CW></Card>
  </div>
</div>; };

// ═══ TREASURY TAB ═══
const TreasuryTab = () => { const L=trA[2],P=trA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    <KPI label="FY26E Total Income" value={`₹${fmt(L.totalIncome,0)} Cr`} color={C.accent}/>
    <KPI label="FY26E PAT" value={`₹${fmt(L.pat,0)} Cr`} color={L.pat>=0?C.green:C.red}/>
    <KPI label="FY26E TCI" value={`₹${fmt(L.tci,0)} Cr`} sub="PAT + OCI" color={C.purple}/>
    <KPI label="Investments (End)" value={`₹${fmt(L.totalInv,0)} Cr`} sub={`${yoy(L.totalInv,P.totalInv)} YoY`} trend="up" color={C.teal}/>
    <KPI label="Avg XIRR" value={`${L.xirr}%`} color={C.orange}/>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card><CT>Annual Income, PAT & TCI (₹ Cr)</CT><CW><ComposedChart data={tA6}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="totalIncome" name="Total Income" fill={C.accent} radius={[3,3,0,0]}/><Line dataKey="pat" name="PAT" stroke={C.green} strokeWidth={2} dot={{r:3}}/><Line dataKey="tci" name="TCI" stroke={C.red} strokeWidth={2.5} dot={{r:4}}/></ComposedChart></CW></Card>
    <Card><CT>Portfolio Composition — End Period (₹ Cr)</CT><CW><BarChart data={trA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="mfAlternates" name="MF + Alt" fill={C.accent} stackId="a"/><Bar dataKey="peRe" name="PE/RE" fill={C.purple} stackId="a"/><Bar dataKey="equityShares" name="Equity" fill={C.green} stackId="a"/><Bar dataKey="otherInv" name="Other" fill={C.slate} stackId="a"/></BarChart></CW></Card>
  </div>
</div>; };

// ═══ REVENUE STREAMS TAB ═══
const StreamsTab = () => { const L=rsA[2],P=rsA[1]; return <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
    <KPI label="FY26E NII" value={`₹${fmt(L.totalNII,0)} Cr`} sub={`${yoy(L.totalNII,P.totalNII)} YoY`} trend={L.totalNII>P.totalNII?"up":"down"} color={C.accent}/>
    <KPI label="FY26E Brokerage" value={`₹${fmt(L.brok,0)} Cr`} sub={`${yoy(L.brok,P.brok)} YoY`} trend={L.brok>P.brok?"up":"down"} color={C.green}/>
    <KPI label="FY26E Distribution" value={`₹${fmt(L.dist,0)} Cr`} sub={`${yoy(L.dist,P.dist)} YoY`} trend={L.dist>P.dist?"up":"down"} color={C.purple}/>
    <KPI label="FY26E AMC Fees" value={`₹${fmt(L.amcFee,0)} Cr`} sub={`${yoy(L.amcFee,P.amcFee)} YoY`} trend="up" color={C.teal}/>
    <KPI label="FY26E Advisory/IB" value={`₹${fmt(L.adv,0)} Cr`} sub={`${yoy(L.adv,P.adv)} YoY`} trend={L.adv>P.adv?"up":"down"} color={C.orange}/>
    <KPI label="FY26E Treasury" value={`₹${fmt(L.treasInc,0)} Cr`} sub="Prop book" color={C.pink}/>
    <KPI label="FY26E Other" value={`₹${fmt(L.segOther+L.hfcOther,0)} Cr`} color={C.slate}/>
  </div>

  <Sec title="Company-Wide Revenue by Stream (excl. Treasury)" sub="Annual operating revenue decomposition (₹ Cr)">
    <Card><CW h={320}><BarChart data={rsA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="totalNII" name="NII" fill={C.accent} stackId="a"/><Bar dataKey="brok" name="Brokerage" fill={C.green} stackId="a"/><Bar dataKey="dist" name="Distribution" fill={C.purple} stackId="a"/><Bar dataKey="amcFee" name="AMC Fees" fill={C.teal} stackId="a"/><Bar dataKey="adv" name="Advisory/IB" fill={C.orange} stackId="a"/></BarChart></CW></Card>
  </Sec>

  <Sec title="Interest Income Breakdown" sub="NII by segment (₹ Cr)">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card><CT>NII by Source (₹ Cr)</CT><CW><BarChart data={rsA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wmNII" name="WM" fill={C.accent} stackId="a"/><Bar dataKey="pwmNII" name="PWM" fill={C.teal} stackId="a"/><Bar dataKey="cmNII" name="Capital Mkt" fill={C.green} stackId="a"/><Bar dataKey="hfcNII" name="HFC" fill={C.orange} stackId="a"/><Bar dataKey="amcOther" name="AMC Alt/Lending" fill={C.pink} stackId="a"/></BarChart></CW></Card>
      <Card><CT>NII Trend: Total & Segment Mix</CT><CW><ComposedChart data={rsA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Area dataKey="totalNII" name="Total NII" fill={C.accent} stroke={C.accent} fillOpacity={0.15} strokeWidth={2}/><Line dataKey="hfcNII" name="HFC NII" stroke={C.orange} strokeWidth={2} dot={{r:3}}/><Line dataKey="wmNII" name="WM NII" stroke={C.accent} strokeWidth={2} dot={{r:3}} strokeDasharray="5 5"/><Line dataKey="amcOther" name="AMC Alt/Lending" stroke={C.pink} strokeWidth={2} dot={{r:3}}/></ComposedChart></CW></Card>
    </div>
  </Sec>

  <Sec title="Fee & Commission Breakdown" sub="Brokerage + Distribution + AMC Fees + Advisory (₹ Cr)">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card><CT>Fee Revenue by Type (₹ Cr)</CT><CW><BarChart data={rsA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="brok" name="Brokerage" fill={C.green} stackId="a"/><Bar dataKey="dist" name="Distribution" fill={C.purple} stackId="a"/><Bar dataKey="amcFee" name="AMC Mgmt Fees" fill={C.teal} stackId="a"/><Bar dataKey="adv" name="Advisory / IB" fill={C.orange} stackId="a"/></BarChart></CW></Card>
      <Card><CT>Fee Mix: Recurring vs Transactional</CT><CW><BarChart data={rsA.map(r=>({...r, recurring:r.dist+r.amcFee, transactional:r.brok+r.adv}))}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="recurring" name="Recurring (Dist+AMC)" fill={C.purple} stackId="a"/><Bar dataKey="transactional" name="Transactional (Brok+Adv)" fill={C.green} stackId="a"/></BarChart></CW></Card>
    </div>
  </Sec>

  <Sec title="Other Income" sub="Treasury prop book + segment other operating (₹ Cr)">
    <Card><CW h={240}><ComposedChart data={rsA}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="treasInc" name="Treasury Income" fill={C.pink} radius={[3,3,0,0]}/><Bar dataKey="segOther" name="Segment Other" fill={C.slate} radius={[3,3,0,0]}/><Bar dataKey="hfcOther" name="HFC Fee Income" fill={C.amber} radius={[3,3,0,0]}/></ComposedChart></CW></Card>
  </Sec>
</div>; };

// ═══ STREAM VALUATION TAB ═══
const ValTab = () => {
  const totB = sVal.reduce((a,s)=>a+s.bearVal,0), totBa = sVal.reduce((a,s)=>a+s.baseVal,0), totBu = sVal.reduce((a,s)=>a+s.bullVal,0);
  const hdr = "bg-blue-50/80 font-bold"; const sub = "bg-white text-gray-600"; const tc = "py-2 px-2 text-right"; const tl = "py-2 px-2";

  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Bear TP" value={`₹${totB.toFixed(0)}`} sub="Conservative" color={C.red}/>
      <KPI label="Base TP" value={`₹${totBa.toFixed(0)}`} sub="Revenue-stream SOTP" color={C.accent}/>
      <KPI label="Bull TP" value={`₹${totBu.toFixed(0)}`} sub="Optimistic" color={C.green}/>
      <KPI label="CMP" value={`₹${CMP}`} sub={`${((totBa/CMP-1)*100).toFixed(0)}% upside to base`} trend="up" color={C.purple}/>
    </div>

    <Sec title="Revenue Stream Detail" sub="FY24 → FY25 → 9MFY26 → FY26E annualized, with segment contribution (₹ Cr)">
      <Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b-2 border-gray-800"><th className={tl+" font-bold"}>Stream / Segment</th><th className={tc}>FY24</th><th className={tc}>FY25</th><th className={tc}>9MFY26</th><th className={tc+" font-bold text-blue-600"}>FY26E Ann.</th><th className={tc+" text-gray-500"}>YoY %</th><th className={tc+" text-gray-400"}>Mix %</th></tr></thead><tbody>{sVal.map((s,si)=><Fragment key={`g${si}`}>
        <tr className={`border-b border-gray-200 ${hdr}`}><td className={tl}>{s.stream}</td><td className={tc}>{s.isCap?"—":fmt(s.fy24,0)}</td><td className={tc}>{s.isCap?"—":fmt(s.fy25,0)}</td><td className={tc}>{s.isCap?"—":fmt(s.m9,0)}</td><td className={tc+" text-blue-600"}>{s.isCap?`${fmt(s.capDep,0)} (cap)`:fmt(s.totalAnn,0)}</td><td className={tc+" text-gray-500"}>{!s.isCap&&s.fy25?yoy(s.totalAnn,s.fy25):"—"}</td><td className={tc}>100%</td></tr>
        {s.subs.map((r,ri)=><tr key={`s${si}_${ri}`} className={`border-b border-gray-50 ${sub}`}><td className={tl+" pl-6 text-xs"}>{r.seg}</td><td className={tc+" text-xs"}>{fmt(r.fy24,0)}</td><td className={tc+" text-xs"}>{fmt(r.fy25,0)}</td><td className={tc+" text-xs"}>{fmt(r.m9,0)}</td><td className={tc+" text-xs text-blue-500"}>{fmt(r.ann,0)}</td><td className={tc+" text-xs text-gray-400"}>{r.fy25?yoy(r.ann,r.fy25):"—"}</td><td className={tc+" text-xs text-gray-400"}>{(r.pct*100).toFixed(0)}%</td></tr>)}
      </Fragment>)}</tbody></table></div></Card>
    </Sec>

    <Sec title="Revenue-Stream SOTP Valuation" sub="Revenue multiple x FY26E annualized revenue / 60.2 Cr shares = Rs/share. Segment rows show proportional value.">
      <Card><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b-2 border-gray-800"><th className={tl+" font-bold"}>Stream / Segment</th><th className={tc}>FY26E Rev</th><th className={tc+" text-gray-500"}>Mix</th><th className={tc+" text-red-500"}>Bear (x)</th><th className={tc+" text-blue-600"}>Base (x)</th><th className={tc+" text-green-600"}>Bull (x)</th><th className={tc+" text-red-500"}>Bear</th><th className={tc+" text-blue-600 font-semibold"}>Base</th><th className={tc+" text-green-600"}>Bull</th></tr></thead><tbody>{sVal.map((s,si)=><Fragment key={`vg${si}`}>
        <tr className={`border-b border-gray-200 ${hdr}`}><td className={tl}>{s.stream}</td><td className={tc}>{fmt(s.totalAnn,0)}</td><td className={tc}>—</td><td className={tc+" text-red-500"}>{s.bear}x</td><td className={tc+" text-blue-600"}>{s.base}x</td><td className={tc+" text-green-600"}>{s.bull}x</td><td className={tc+" text-red-500"}>₹{s.bearVal.toFixed(0)}</td><td className={tc+" text-blue-600"}>₹{s.baseVal.toFixed(0)}</td><td className={tc+" text-green-600"}>₹{s.bullVal.toFixed(0)}</td></tr>
        {s.subs.map((r,ri)=><tr key={`vs${si}_${ri}`} className={`border-b border-gray-50 ${sub}`}><td className={tl+" pl-6 text-xs"}>{r.seg}</td><td className={tc+" text-xs"}>{fmt(r.ann,0)}</td><td className={tc+" text-xs text-gray-400"}>{(r.pct*100).toFixed(0)}%</td><td colSpan={3}></td><td className={tc+" text-xs text-red-400"}>₹{(s.bearVal*r.pct).toFixed(0)}</td><td className={tc+" text-xs text-blue-400"}>₹{(s.baseVal*r.pct).toFixed(0)}</td><td className={tc+" text-xs text-green-400"}>₹{(s.bullVal*r.pct).toFixed(0)}</td></tr>)}
      </Fragment>)}<tr className="border-t-2 border-gray-800 bg-gray-50 font-bold"><td className="py-3 px-2" colSpan={6}>Total Target Price (₹/share)</td><td className={tc+" text-red-500"}>₹{totB.toFixed(0)}</td><td className={tc+" text-blue-600"}>₹{totBa.toFixed(0)}</td><td className={tc+" text-green-600"}>₹{totBu.toFixed(0)}</td></tr></tbody></table></div></Card>
    </Sec>

    <Sec title="Revenue Quality Analysis" sub="Recurring vs Transactional revenue mix for valuation premium">
      <Card><CW h={280}><BarChart data={rsA.map(r=>({...r, recurring:r.dist+r.amcFee, transactional:r.brok+r.adv, nii:r.totalNII}))}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="recurring" name="Recurring (Dist+AMC)" fill={C.purple} stackId="a"/><Bar dataKey="transactional" name="Transactional (Brok+Adv)" fill={C.green} stackId="a"/><Bar dataKey="nii" name="NII (Spread)" fill={C.accent} stackId="a"/></BarChart></CW></Card>
    </Sec>

    <Sec title="Forecast Segment PAT (Tusk Model)" sub="FY25A → FY28E (₹ Cr)"><Card><CW h={260}><BarChart data={fcst}>{grid}<XAxis {...xFY}/><YAxis {...yL}/>{tip}{leg}<Bar dataKey="wm" name="WM" fill={SEG[0]} stackId="a"/><Bar dataKey="cm" name="CM" fill={SEG[1]} stackId="a"/><Bar dataKey="amc" name="AMC" fill={SEG[2]} stackId="a"/><Bar dataKey="pwm" name="PWM" fill={SEG[3]} stackId="a"/><Bar dataKey="hfc" name="HFC" fill={SEG[4]} stackId="a"/></BarChart></CW></Card></Sec>
  </div>;
};

// ═══ MAIN ═══
const TABS = [{id:"overview",label:"Overview"},{id:"wp",label:"WM + PWM"},{id:"cm",label:"Capital Mkt"},{id:"amc",label:"AMC"},{id:"hfc",label:"HFC"},{id:"treasury",label:"Treasury"},{id:"streams",label:"Rev Streams"},{id:"val",label:"Stream SOTP"}];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  return <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-end justify-between">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Motilal Oswal Financial Services</h1><p className="text-blue-300 text-sm mt-1 font-medium">FY26E Annual Analysis — Revenue Stream Valuation (9MFY26 Annualized)</p></div>
        <div className="text-right"><div className="text-blue-300 text-xs font-medium uppercase tracking-wider">CMP / Base TP</div><div className="text-2xl font-extrabold">₹{CMP} <span className="text-green-400">→ ₹{sVal.reduce((a,s)=>a+s.baseVal,0).toFixed(0)}</span></div><div className="text-blue-300 text-xs mt-0.5">Revenue-stream SOTP | Tusk Investment Research</div></div>
      </div>
    </div>
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div className="max-w-7xl mx-auto px-6 flex gap-0.5 overflow-x-auto">{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-3 text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${tab===t.id?"border-blue-600 text-blue-700 bg-blue-50/60":"border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{t.label}</button>)}</div></div>
    <div className="max-w-7xl mx-auto px-6 py-6">
      {tab==="overview"&&<Overview/>}{tab==="wp"&&<WPTab/>}{tab==="cm"&&<CMTab/>}{tab==="amc"&&<AMCTab/>}{tab==="hfc"&&<HFCTab/>}{tab==="treasury"&&<TreasuryTab/>}{tab==="streams"&&<StreamsTab/>}{tab==="val"&&<ValTab/>}
    </div>
  </div>;
}