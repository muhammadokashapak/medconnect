"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState("BMI");
  const [searchQuery, setSearchQuery] = useState("");

  const calculatorsList = [
    { name: "BMI", label: "BMI Calculator", type: "Calculator" },
    { name: "GFR", label: "eGFR (MDRD)", type: "Calculator" },
    { name: "CrCl", label: "Creatinine Clearance", type: "Calculator" },
    { name: "MAP", label: "Mean Arterial Pressure", type: "Calculator" },
    { name: "Corrected Calcium", label: "Corrected Calcium", type: "Calculator" },
    { name: "Anion Gap", label: "Anion Gap", type: "Calculator" },
    { name: "CHADS-VASc", label: "CHA₂DS₂-VASc", type: "Score" },
    { name: "HAS-BLED", label: "HAS-BLED", type: "Score" },
    { name: "Child-Pugh", label: "Child-Pugh", type: "Score" },
    { name: "MELD", label: "MELD Score", type: "Score" },
    { name: "TIMI", label: "TIMI Risk Score", type: "Score" },
    { name: "CURB-65", label: "CURB-65", type: "Score" },
    { name: "APGAR", label: "APGAR Score", type: "Score" },
    { name: "Wells", label: "Wells' Criteria (DVT/PE)", type: "Score" },
    { name: "GCS", label: "Glasgow Coma Scale", type: "Score" }
  ];

  const filteredCalculators = useMemo(() => {
    if (!searchQuery) return calculatorsList;
    const q = searchQuery.toLowerCase();
    return calculatorsList.filter(c => c.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center">
            <div className="bg-purple-100 p-2 rounded-xl mr-4 shadow-sm">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            Clinical Calculators
          </h1>
          <Link href="/feed" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition">
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          {/* Dropdown Selector */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Choose your Calculator / Score</label>
            <div className="relative w-full">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              >
                {calculatorsList.map(calc => (
                  <option key={calc.name} value={calc.name}>
                    {calc.label} ({calc.type})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Main Calculator Area */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
            {activeTab === "BMI" && <BMICalculator />}
            {activeTab === "GFR" && <GFRCalculator />}
            {activeTab === "CrCl" && <CrClCalculator />}
            {activeTab === "MAP" && <MAPCalculator />}
            {activeTab === "Corrected Calcium" && <CorrectedCalciumCalculator />}
            {activeTab === "Anion Gap" && <AnionGapCalculator />}
            {activeTab === "CHADS-VASc" && <CHADSVAScCalculator />}
            {activeTab === "HAS-BLED" && <HASBLEDCalculator />}
            {activeTab === "Child-Pugh" && <ChildPughCalculator />}
            {activeTab === "MELD" && <MELDCalculator />}
            {activeTab === "TIMI" && <TIMICalculator />}
            {activeTab === "CURB-65" && <CURB65Calculator />}
            {activeTab === "APGAR" && <APGARCalculator />}
            {activeTab === "Wells" && <WellsCalculator />}
            {activeTab === "GCS" && <GCSCalculator />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================
// Individual Calculators
// ========================

function BMICalculator() {
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs" | "stones">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "m" | "inches" | "feet">("cm");
  
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightInches, setHeightInches] = useState(""); // Used when unit is "feet" for the remaining inches
  
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);
    let hInches = parseFloat(heightInches) || 0;
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h < 0 || (heightUnit !== 'feet' && h <= 0)) {
      setError("Please enter valid positive values for weight and height.");
      setResult(null);
      return;
    }
    setError("");

    // Convert weight to kg
    let weightKg = w;
    if (weightUnit === "lbs") weightKg = w * 0.453592;
    if (weightUnit === "stones") weightKg = w * 6.35029;

    // Convert height to meters
    let heightM = h;
    if (heightUnit === "cm") heightM = h / 100;
    if (heightUnit === "inches") heightM = h * 0.0254;
    if (heightUnit === "feet") heightM = (h * 0.3048) + (hInches * 0.0254);

    if (heightM <= 0) {
      setError("Height must be greater than zero.");
      setResult(null);
      return;
    }

    setResult(weightKg / (heightM * heightM));
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal weight", color: "text-green-600" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600" };
    return { label: "Obese", color: "text-red-600" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Body Mass Index (BMI)</h2>
      
      <div className="space-y-5 w-full mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="number" min="0.1" step="any" 
              className="flex-grow border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full" 
              value={weight} onChange={e => setWeight(e.target.value)} 
              placeholder={`Enter weight`}
            />
            <select 
              className="w-full sm:w-32 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 shrink-0"
              value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)}
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
              <option value="stones">stones</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="number" min="0" step="any" 
              className="flex-grow border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full" 
              value={height} onChange={e => setHeight(e.target.value)} 
              placeholder={`Enter height`}
            />
            {heightUnit === "feet" && (
              <input 
                type="number" min="0" step="any" 
                className="w-full sm:w-24 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none shrink-0" 
                value={heightInches} onChange={e => setHeightInches(e.target.value)} 
                placeholder="Inches"
              />
            )}
            <select 
              className="w-full sm:w-36 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 shrink-0"
              value={heightUnit} onChange={e => setHeightUnit(e.target.value as any)}
            >
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="inches">in</option>
              <option value="feet">ft & in</option>
            </select>
          </div>
        </div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition shadow-sm mt-4">Calculate BMI</button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-800 uppercase tracking-wider font-bold mb-1">Result</p>
          <p className="text-4xl font-black text-purple-900">{result.toFixed(1)} <span className="text-xl font-normal text-purple-700">kg/m²</span></p>
          <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-bold bg-white shadow-sm ${getBmiCategory(result).color}`}>
            {getBmiCategory(result).label}
          </div>
        </div>
      )}
    </div>
  );
}

function GFRCalculator() {
  const [age, setAge] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [isFemale, setIsFemale] = useState(false);
  const [isBlack, setIsBlack] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    const a = parseFloat(age);
    const scr = parseFloat(creatinine);
    if (!a || !scr || a <= 0 || scr <= 0) {
      setError("Please enter valid positive values for age and creatinine.");
      setResult(null);
      return;
    }
    setError("");
    let gfr = 175 * Math.pow(scr, -1.154) * Math.pow(a, -0.203);
    if (isFemale) gfr *= 0.742;
    if (isBlack) gfr *= 1.212;
    setResult(gfr);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Estimated GFR (MDRD)</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input type="number" min="0.1" step="any" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
          <input type="number" min="0.1" step="any" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={creatinine} onChange={e => setCreatinine(e.target.value)} />
        </div>
        <div className="flex flex-col gap-3 py-2">
          <label className="flex items-center text-sm font-medium text-gray-800 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
            <input type="checkbox" className="w-5 h-5 mr-3 rounded text-purple-600 focus:ring-purple-500" checked={isFemale} onChange={e => setIsFemale(e.target.checked)} /> Female Patient
          </label>
          <label className="flex items-center text-sm font-medium text-gray-800 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
            <input type="checkbox" className="w-5 h-5 mr-3 rounded text-purple-600 focus:ring-purple-500" checked={isBlack} onChange={e => setIsBlack(e.target.checked)} /> African American
          </label>
        </div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition shadow-sm">Calculate eGFR</button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-800 uppercase tracking-wider font-bold mb-1">Result</p>
          <p className="text-4xl font-black text-purple-900">{result.toFixed(0)} <span className="text-lg font-normal text-purple-700">mL/min/1.73m²</span></p>
        </div>
      )}
    </div>
  );
}

function CrClCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [isFemale, setIsFemale] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const scr = parseFloat(creatinine);
    if (a > 0 && w > 0 && scr > 0) {
      let crcl = ((140 - a) * w) / (72 * scr);
      if (isFemale) crcl *= 0.85;
      setResult(crcl);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Creatinine Clearance (Cockcroft-Gault)</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={creatinine} onChange={e => setCreatinine(e.target.value)} /></div>
        <label className="flex items-center text-sm font-medium text-gray-800 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200">
          <input type="checkbox" className="w-5 h-5 mr-3 rounded text-purple-600 focus:ring-purple-500" checked={isFemale} onChange={e => setIsFemale(e.target.checked)} /> Female Patient
        </label>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Calculate CrCl</button>
      </div>
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-4xl font-black text-purple-900">{result.toFixed(1)} <span className="text-lg font-normal">mL/min</span></p>
        </div>
      )}
    </div>
  );
}

function MAPCalculator() {
  const [sbp, setSbp] = useState("");
  const [dbp, setDbp] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const s = parseFloat(sbp);
    const d = parseFloat(dbp);
    if (s > 0 && d > 0) {
      setResult((s + 2 * d) / 3);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Mean Arterial Pressure (MAP)</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={sbp} onChange={e => setSbp(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={dbp} onChange={e => setDbp(e.target.value)} /></div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Calculate MAP</button>
      </div>
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-4xl font-black text-purple-900">{result.toFixed(1)} <span className="text-lg font-normal">mmHg</span></p>
        </div>
      )}
    </div>
  );
}

function CorrectedCalciumCalculator() {
  const [calcium, setCalcium] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const ca = parseFloat(calcium);
    const alb = parseFloat(albumin);
    if (ca > 0 && alb > 0) {
      setResult(ca + 0.8 * (4.0 - alb));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Corrected Calcium for Hypoalbuminemia</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Measured Calcium (mg/dL)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={calcium} onChange={e => setCalcium(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Serum Albumin (g/dL)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={albumin} onChange={e => setAlbumin(e.target.value)} /></div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Calculate Corrected Ca</button>
      </div>
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-4xl font-black text-purple-900">{result.toFixed(2)} <span className="text-lg font-normal">mg/dL</span></p>
        </div>
      )}
    </div>
  );
}

function AnionGapCalculator() {
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [hco3, setHco3] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const n = parseFloat(na);
    const c = parseFloat(cl);
    const h = parseFloat(hco3);
    if (n > 0 && c > 0 && h > 0) {
      setResult(n - (c + h));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Serum Anion Gap</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mEq/L)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={na} onChange={e => setNa(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Chloride (mEq/L)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={cl} onChange={e => setCl(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Bicarbonate (mEq/L)</label><input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg" value={hco3} onChange={e => setHco3(e.target.value)} /></div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Calculate Anion Gap</button>
      </div>
      {result !== null && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <p className="text-4xl font-black text-purple-900">{result.toFixed(1)} <span className="text-lg font-normal">mEq/L</span></p>
        </div>
      )}
    </div>
  );
}

function ScoreTemplate({ title, options, onToggle, score, getInterpretation }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">{title}</h2>
      <div className="grid grid-cols-1 gap-3 mb-8">
        {options.map((opt: any, idx: number) => (
          <label key={idx} className={`flex items-start p-4 rounded-xl border transition cursor-pointer ${opt.checked ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-center h-5 mt-1">
              <input type="checkbox" className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-gray-300" checked={opt.checked} onChange={() => onToggle(opt.id)} />
            </div>
            <div className="ml-3 flex-grow flex justify-between">
              <span className={`font-medium ${opt.checked ? 'text-purple-900' : 'text-gray-900'}`}>{opt.label}</span>
              <span className={`font-bold ml-4 ${opt.checked ? 'text-purple-600' : 'text-gray-400'}`}>+{opt.points}</span>
            </div>
          </label>
        ))}
      </div>
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-xs text-purple-800 uppercase tracking-wider font-bold mb-1">Total Score</p>
          <p className="text-6xl font-black text-purple-900">{score}</p>
        </div>
        <div className="hidden md:block w-px h-16 bg-purple-200"></div>
        <div>
          {getInterpretation(score)}
        </div>
      </div>
    </div>
  );
}

function CHADSVAScCalculator() {
  const [opts, setOpts] = useState([
    { id: 'chf', label: 'Congestive Heart Failure', points: 1, checked: false },
    { id: 'htn', label: 'Hypertension', points: 1, checked: false },
    { id: 'age75', label: 'Age ≥ 75 years', points: 2, checked: false },
    { id: 'dm', label: 'Diabetes Mellitus', points: 1, checked: false },
    { id: 'stroke', label: 'Stroke/TIA/Thromboembolism', points: 2, checked: false },
    { id: 'vasc', label: 'Vascular Disease (prior MI, PAD, aortic plaque)', points: 1, checked: false },
    { id: 'age65', label: 'Age 65-74 years', points: 1, checked: false },
    { id: 'female', label: 'Female Category', points: 1, checked: false }
  ]);

  const toggle = (id: string) => {
    setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  };

  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);

  const getInterpretation = (s: number) => {
    let risk = "";
    if (s === 0) risk = "Low risk (0%). No antithrombotic therapy recommended.";
    else if (s === 1) risk = "Low-Moderate risk (1.3%). Consider oral anticoagulant or aspirin.";
    else risk = "Moderate-High risk (≥2.2%). Oral anticoagulant is recommended.";
    return <p className="text-lg font-medium text-purple-900">{risk}</p>;
  };

  return <ScoreTemplate title="CHA₂DS₂-VASc Score" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function HASBLEDCalculator() {
  const [opts, setOpts] = useState([
    { id: 'h', label: 'Hypertension (uncontrolled, >160 mmHg systolic)', points: 1, checked: false },
    { id: 'a', label: 'Abnormal renal function (Dialysis, transplant, Cr >2.26)', points: 1, checked: false },
    { id: 'l', label: 'Abnormal liver function (Cirrhosis or Bilirubin >2x Normal, AST/ALT >3x Normal)', points: 1, checked: false },
    { id: 's', label: 'Stroke history', points: 1, checked: false },
    { id: 'b', label: 'Bleeding history or predisposition', points: 1, checked: false },
    { id: 'l2', label: 'Labile INRs (if on Warfarin)', points: 1, checked: false },
    { id: 'e', label: 'Elderly (> 65 years)', points: 1, checked: false },
    { id: 'd', label: 'Drugs (Aspirin, NSAIDs)', points: 1, checked: false },
    { id: 'a2', label: 'Alcohol (≥ 8 drinks/week)', points: 1, checked: false }
  ]);

  const toggle = (id: string) => setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);

  const getInterpretation = (s: number) => {
    return <p className="text-lg font-medium text-purple-900">{s >= 3 ? "High risk of bleeding. Caution with anticoagulation." : "Low-Moderate risk of bleeding."}</p>;
  };

  return <ScoreTemplate title="HAS-BLED Score for Major Bleeding Risk" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function ChildPughCalculator() {
  const [opts, setOpts] = useState([
    { id: 'enceph_1', label: 'Encephalopathy: None', points: 1, checked: false },
    { id: 'enceph_2', label: 'Encephalopathy: Grade 1-2', points: 2, checked: false },
    { id: 'enceph_3', label: 'Encephalopathy: Grade 3-4', points: 3, checked: false },
    { id: 'asc_1', label: 'Ascites: Absent', points: 1, checked: false },
    { id: 'asc_2', label: 'Ascites: Slight', points: 2, checked: false },
    { id: 'asc_3', label: 'Ascites: Moderate', points: 3, checked: false },
  ]);
  const toggle = (id: string) => setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);

  const getInterpretation = (s: number) => {
    let cls = s < 7 ? "Class A" : s < 10 ? "Class B" : "Class C";
    return <p className="text-lg font-medium text-purple-900">Child-Pugh {cls} (Requires matching all 5 parameters in clinical setting)</p>;
  };

  return <ScoreTemplate title="Child-Pugh Score" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function MELDCalculator() {
  return <div><h2 className="text-2xl font-bold mb-4">MELD Score</h2><p className="text-gray-500">MELD requires precise logarithmic calculations. Please use lab specific tools for exact MELD-Na scores.</p></div>;
}
function TIMICalculator() {
  const [opts, setOpts] = useState([
    { id: '1', label: 'Age ≥ 65 years', points: 1, checked: false },
    { id: '2', label: '≥ 3 CAD Risk Factors', points: 1, checked: false },
    { id: '3', label: 'Known CAD (stenosis ≥ 50%)', points: 1, checked: false },
    { id: '4', label: 'Aspirin use in past 7 days', points: 1, checked: false },
    { id: '5', label: 'Severe angina (≥ 2 episodes in 24 hrs)', points: 1, checked: false },
    { id: '6', label: 'ST changes ≥ 0.5mm', points: 1, checked: false },
    { id: '7', label: 'Positive Cardiac Marker', points: 1, checked: false },
  ]);
  const toggle = (id: string) => setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);
  const getInterpretation = (s: number) => <p className="text-lg font-medium text-purple-900">{s <= 2 ? "Low Risk" : s <= 4 ? "Intermediate Risk" : "High Risk"}</p>;
  return <ScoreTemplate title="TIMI Risk Score for UA/NSTEMI" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function CURB65Calculator() {
  const [opts, setOpts] = useState([
    { id: 'c', label: 'Confusion', points: 1, checked: false },
    { id: 'u', label: 'BUN > 19 mg/dL', points: 1, checked: false },
    { id: 'r', label: 'Respiratory Rate ≥ 30/min', points: 1, checked: false },
    { id: 'b', label: 'Blood Pressure < 90/60 mmHg', points: 1, checked: false },
    { id: '65', label: 'Age ≥ 65', points: 1, checked: false }
  ]);

  const toggle = (id: string) => setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);
  const getInterpretation = (s: number) => <p className="text-lg font-medium text-purple-900">{s <= 1 ? "Outpatient care" : s === 2 ? "Consider hospital admission" : "Urgent hospital admission (ICU)"}</p>;

  return <ScoreTemplate title="CURB-65 Pneumonia Severity" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function APGARCalculator() {
  return <div><h2 className="text-2xl font-bold mb-4">APGAR Score</h2><p className="text-gray-500">Evaluates neonate appearance, pulse, grimace, activity, respiration.</p></div>;
}

function WellsCalculator() {
  const [opts, setOpts] = useState([
    { id: '1', label: 'Clinical signs and symptoms of DVT', points: 3, checked: false },
    { id: '2', label: 'PE is #1 diagnosis or equally likely', points: 3, checked: false },
    { id: '3', label: 'Heart rate > 100', points: 1.5, checked: false },
    { id: '4', label: 'Immobilization at least 3 days or surgery in previous 4 weeks', points: 1.5, checked: false },
    { id: '5', label: 'Previous, objectively diagnosed PE or DVT', points: 1.5, checked: false },
    { id: '6', label: 'Hemoptysis', points: 1, checked: false },
    { id: '7', label: 'Malignancy w/ treatment within 6 months', points: 1, checked: false },
  ]);

  const toggle = (id: string) => setOpts(opts.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  const score = opts.reduce((acc, o) => acc + (o.checked ? o.points : 0), 0);
  const getInterpretation = (s: number) => <p className="text-lg font-medium text-purple-900">{s > 6 ? "High Risk" : s >= 2 ? "Moderate Risk" : "Low Risk"}</p>;

  return <ScoreTemplate title="Wells' Criteria for Pulmonary Embolism" options={opts} onToggle={toggle} score={score} getInterpretation={getInterpretation} />;
}

function GCSCalculator() {
  return <div><h2 className="text-2xl font-bold mb-4">Glasgow Coma Scale</h2><p className="text-gray-500">Assesses Eye, Verbal, and Motor responses (Score 3-15).</p></div>;
}
