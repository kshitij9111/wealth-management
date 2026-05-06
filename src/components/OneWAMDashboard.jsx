import { WealthSOTPDashboard, C } from "./dashboardKit.jsx";

// ═══ 360 ONE WAM — Q3 FY2025-26 segmented SOTP ═══
// Sources: 360 ONE Q3 FY26 Data Book; Tusk Investment Research model.

const company = {
  name:    "360 ONE WAM",
  sub:     "Q3 FY2025-26 — Dynamic Segmented SOTP",
  cmp:     1180,         // ₹/share
  shares:  39.7,         // Cr fully diluted
};

const snapshot = {
  subtitle: "India's largest UHNI-focused wealth manager",
  tiles: [
    { title: "Positioning", body: "Dominant UHNI-focused platform with a vertically integrated alternates AMC and captive Capital Markets arm (B&amp;K). ARR mix is best-in-class within Indian WM peer set." },
    { title: "Revenue Mix", body: "Core WM ARR fee pool dominates; Alternates AMC contributes high-yield public + private fee streams. B&amp;K provides incremental but cyclical capital-markets revenue." },
    { title: "Valuation Anchor", body: "Recurring fee mix supports asset-manager multiples on Core WM + AMC; incremental NII from a small client lending book; cyclical capital-markets discount on B&amp;K." },
  ],
};

const segments = [
  {
    id:    "wm",
    name:  "Wealth Management (Core UHNI)",
    type:  "fee",
    color: C.accent,
    note:  "Recurring ARR fee pool from UHNI client AUM (advisory + distribution + trail)",
    aum:   195000,   // ₹ Cr ARR-bearing AUM Q3FY26
    nnm:   28000,    // ₹ Cr annualised NNM
    yld:   72,       // bps blended ARR yield
    ci:    44,
    mult:  42,
  },
  {
    id:    "amc",
    name:  "Asset Mgmt / Public Markets",
    type:  "fee",
    color: C.green,
    note:  "Alternates AMC (private + public market funds) — high-yield asset-light fee pool",
    aum:   88000,    // ₹ Cr AMC AUM (public + alternates)
    nnm:   12000,
    yld:   95,       // bps blended fee yield
    ci:    36,
    mult:  35,
  },
  {
    id:    "lending",
    name:  "Alternate Lending (NII)",
    type:  "nii",
    color: C.orange,
    note:  "(U)HNI client loans against securities — small NII contribution",
    aum:   3200,     // ₹ Cr loan book
    nnm:   600,
    yld:   500,      // bps net spread (~5% NIM)
    ci:    35,
    mult:  14,
  },
  {
    id:    "cm",
    name:  "Capital Markets (B&K)",
    type:  "fixed",
    color: C.purple,
    note:  "Batlivala &amp; Karani — institutional broking + investment banking",
    rev:   320,      // ₹ Cr FY26E run-rate revenue
    ci:    72,
    mult:  18,
  },
];

export default function OneWAMDashboard() {
  return <WealthSOTPDashboard
    company={company}
    snapshot={snapshot}
    segments={segments}
    lsKey="onewam-sotp-inputs-v1"
  />;
}
