import { useState } from "react";
import MOFSLDashboard from "./components/MOFSLDashboard.jsx";
import NuvamaDashboard from "./components/NuvamaDashboard.jsx";
import OneWAMDashboard from "./components/OneWAMDashboard.jsx";
import WealthComparison from "./components/WealthComparison.jsx";

const VIEWS = [
  { id: "mofsl", label: "Motilal Oswal" },
  { id: "nuvama", label: "Nuvama Wealth" },
  { id: "onewam", label: "360 ONE WAM" },
  { id: "comparison", label: "Platform Comparison" },
];

export default function App() {
  const [view, setView] = useState("mofsl");

  return (
    <div>
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center gap-6">
        <span className="text-sm font-bold text-blue-300 uppercase tracking-wider">Tusk Investment Research</span>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${
                view === v.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      {view === "mofsl" && <MOFSLDashboard />}
      {view === "nuvama" && <NuvamaDashboard />}
      {view === "onewam" && <OneWAMDashboard />}
      {view === "comparison" && <WealthComparison />}
    </div>
  );
}
