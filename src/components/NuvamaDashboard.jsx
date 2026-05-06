import { WealthSOTPDashboard, C } from "./dashboardKit.jsx";

// ═══ NUVAMA — Q3 FY2025-26 segmented SOTP ═══
// Sources: Nuvama Data Book Q3 FY26; Tusk Investment Research model.
// Segment grouping consolidates the 8-segment databook into the 4 valuation pillars
// requested by the spec while preserving Asset Services as a distinct fee stream
// inside "Asset Management / Public Markets" (see CI / yield assumptions).

const company = {
  name:    "Nuvama Wealth",
  sub:     "Q3 FY2025-26 — Dynamic Segmented SOTP",
  cmp:     5850,         // ₹/share
  shares:  3.57,         // Cr fully diluted (~35.7M)
};

const snapshot = {
  subtitle: "Mid-to-UHNI platform with custody / clearing flagship",
  tiles: [
    { title: "Positioning", body: "Mid-to-UHNI wealth platform with integrated <b>asset services</b>, capital markets and alternates AMC. Asset Services (HFT/PMS/AIF custody &amp; clearing) is the structural ARR anchor." },
    { title: "Revenue Mix", body: "~50% recurring fee streams (Wealth + Asset Mgmt incl. custody); ~24% Capital Markets; ~12% client lending NII; ~14% transactional / other." },
    { title: "Valuation Anchor", body: "Asset-services flagship + WM flow rates a premium <b>recurring</b> blended multiple; cyclical CM and lending temper headline." },
  ],
};

const segments = [
  {
    id:    "wm",
    name:  "Wealth Management (Core)",
    type:  "fee",
    color: C.accent,
    note:  "Combined Wealth Distribution + Private Distribution AUM; HNI MPIS + UHNI advisory",
    aum:   315000,   // ₹ Cr — WD + PD AUM Q3FY26
    nnm:   45000,    // ₹ Cr — implied annualised NNM
    yld:   42,       // bps blended trail+upfront yield on WM AUM (incl. distribution + advisory)
    ci:    55,       // %
    mult:  28,
  },
  {
    id:    "amc",
    name:  "Asset Mgmt / Public Markets",
    type:  "fee",
    color: C.green,
    note:  "Asset Services (custody/clearing for HFT/PMS/AIF) + Alternates AMC — recurring fee pool",
    aum:   195000,   // ₹ Cr — Asset Services + Alternates AMC AUM
    nnm:   30000,
    yld:   18,       // bps blended (Asset Services thin yield + Alternates higher yield)
    ci:    42,
    mult:  25,
  },
  {
    id:    "lending",
    name:  "Alternate Lending (NII)",
    type:  "nii",
    color: C.orange,
    note:  "(U)HNI loans against securities; valued on net interest income approach",
    aum:   6800,     // ₹ Cr loan book
    nnm:   1200,     // ₹ Cr book growth
    yld:   480,      // bps net spread (~4.8% NIM on AUM)
    ci:    32,
    mult:  11,
  },
  {
    id:    "cm",
    name:  "Capital Markets / IB",
    type:  "fixed",
    color: C.purple,
    note:  "Institutional equities, investment banking, (U)HNI broking — transaction-linked",
    rev:   1450,     // ₹ Cr FY26E run-rate revenue
    ci:    68,
    mult:  14,
  },
];

export default function NuvamaDashboard() {
  return <WealthSOTPDashboard
    company={company}
    snapshot={snapshot}
    segments={segments}
    lsKey="nuvama-sotp-inputs-v1"
  />;
}
