import MOFSLDashboard from "./components/MOFSLDashboard.jsx";
import WealthComparison from "./components/WealthComparison.jsx";

function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="px-8 py-12 text-center border-b border-slate-800" style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)"}}>
        <h1 className="text-4xl font-extrabold tracking-tight">Tusk Investment Research</h1>
        <p className="mt-2 text-slate-400">Wealth Platform Analytics — Q3 FY2026</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <a href="/mofsl" className="block bg-slate-800 border border-slate-700 rounded-2xl p-8 no-underline text-slate-100 hover:-translate-y-1 hover:border-blue-500 transition-all duration-150">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Deep Dive</div>
            <h2 className="text-xl font-bold mb-2">MOFSL Q3FY26 Dashboard</h2>
            <p className="text-sm text-slate-400 leading-relaxed">8-tab analysis: WM, CM, AMC, PWM, HFC, Treasury, Revenue Streams &amp; SOTP Valuation. 11 quarters + FY28E forecasts.</p>
            <div className="mt-5 text-xl text-blue-400">→</div>
          </a>
          <a href="/comparison" className="block bg-slate-800 border border-slate-700 rounded-2xl p-8 no-underline text-slate-100 hover:-translate-y-1 hover:border-blue-500 transition-all duration-150">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Comparative</div>
            <h2 className="text-xl font-bold mb-2">Wealth Platform Comparison</h2>
            <p className="text-sm text-slate-400 leading-relaxed">MOFSL vs Nuvama vs 360 ONE — ARR/TBR mix, AUM, ROE, broking exposure and valuation multiples.</p>
            <div className="mt-5 text-xl text-blue-400">→</div>
          </a>
        </div>
      </main>
      <footer className="text-center py-6 text-slate-600 text-sm border-t border-slate-800">Tusk Investment Limited · Confidential · Q3 FY2026</footer>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path === "/mofsl") return <MOFSLDashboard />;
  if (path === "/comparison") return <WealthComparison />;
  return <Home />;
}
