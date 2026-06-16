"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState("BMI");

  const calculators = [
    "BMI", "GFR", "CHADS-VASc", "CURB-65", "APGAR", "Wells", "GCS"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            Clinical Calculators
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                <h2 className="font-bold text-purple-900">Select Calculator</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {calculators.map(calc => (
                  <li key={calc}>
                    <button 
                      onClick={() => setActiveTab(calc)}
                      className={`w-full text-left px-4 py-3 font-medium transition ${activeTab === calc ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {calc} {['BMI','GFR'].includes(calc) ? 'Calculator' : 'Score'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Calculator Area */}
          <div className="flex-grow bg-white p-8 rounded-xl shadow border border-gray-100 min-h-[500px]">
            {activeTab === "BMI" && <BMICalculator />}
            {activeTab === "GFR" && <GFRCalculator />}
            {activeTab === "CHADS-VASc" && <CHADSVAScCalculator />}
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
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (!w || !h || w <= 0 || h <= 0) {
      setError("Please enter valid positive values for weight and height.");
      setResult(null);
      return;
    }
    setError("");
    setResult(w / (h * h));
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal weight", color: "text-green-600" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600" };
    return { label: "Obese", color: "text-red-600" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Body Mass Index (BMI) Calculator</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input type="number" min="0.1" step="any" className="w-full border p-2 rounded" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input type="number" min="0.1" step="any" className="w-full border p-2 rounded" value={height} onChange={e => setHeight(e.target.value)} />
        </div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700">Calculate BMI</button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {result !== null && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Result</p>
          <p className="text-3xl font-bold text-purple-900">{result.toFixed(1)} kg/m²</p>
          <p className={`mt-2 font-bold ${getBmiCategory(result).color}`}>
            Category: {getBmiCategory(result).label}
          </p>
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
    // MDRD Formula (simplified for demonstration)
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Estimated GFR (MDRD) Calculator</h2>
      <div className="space-y-4 max-w-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input type="number" min="0.1" step="any" className="w-full border p-2 rounded" value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
          <input type="number" min="0.1" step="any" className="w-full border p-2 rounded" value={creatinine} onChange={e => setCreatinine(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" className="mr-2 rounded text-purple-600 focus:ring-purple-500" checked={isFemale} onChange={e => setIsFemale(e.target.checked)} /> Female
          </label>
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" className="mr-2 rounded text-purple-600 focus:ring-purple-500" checked={isBlack} onChange={e => setIsBlack(e.target.checked)} /> Black
          </label>
        </div>
        <button onClick={calculate} className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700">Calculate eGFR</button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {result !== null && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Result</p>
          <p className="text-3xl font-bold text-purple-900">{result.toFixed(0)} mL/min/1.73m²</p>
        </div>
      )}
    </div>
  );
}

function CHADSVAScCalculator() {
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<any>({
    chf: false, htn: false, age75: false, dm: false, stroke: false, vascular: false, age65: false, female: false
  });

  const toggle = (key: string) => {
    const newOpt = { ...options, [key]: !options[key] };
    setOptions(newOpt);
    let s = 0;
    if (newOpt.chf) s += 1;
    if (newOpt.htn) s += 1;
    if (newOpt.age75) s += 2;
    if (newOpt.dm) s += 1;
    if (newOpt.stroke) s += 2;
    if (newOpt.vascular) s += 1;
    if (newOpt.age65 && !newOpt.age75) s += 1;
    if (newOpt.female) s += 1;
    setScore(s);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk</h2>
      <div className="space-y-3 mb-6 max-w-md">
        {Object.keys(options).map(k => {
          const labels: any = { chf: "Congestive Heart Failure (+1)", htn: "Hypertension (+1)", age75: "Age ≥ 75 years (+2)", dm: "Diabetes Mellitus (+1)", stroke: "Stroke/TIA/Thromboembolism (+2)", vascular: "Vascular disease (+1)", age65: "Age 65-74 years (+1)", female: "Female Category (+1)" };
          return (
            <label key={k} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" className="mr-3 w-5 h-5 text-purple-600 rounded" checked={options[k]} onChange={() => toggle(k)} />
              <span className="font-medium text-gray-800">{labels[k]}</span>
            </label>
          )
        })}
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
         <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Total Score</p>
         <p className="text-3xl font-bold text-purple-900">{score} Points</p>
      </div>
    </div>
  );
}

function CURB65Calculator() {
  return <ScoreCalculator title="CURB-65 Score for Pneumonia Severity" 
    items={[
      {key: "c", label: "Confusion (+1)", value: 1},
      {key: "u", label: "BUN > 19 mg/dL (7 mmol/L) (+1)", value: 1},
      {key: "r", label: "Respiratory Rate ≥ 30 breaths/min (+1)", value: 1},
      {key: "b", label: "Systolic BP < 90 mmHg or Diastolic ≤ 60 mmHg (+1)", value: 1},
      {key: "a", label: "Age ≥ 65 years (+1)", value: 1}
    ]} 
  />;
}

function APGARCalculator() {
  const [appearance, setAppearance] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [grimace, setGrimace] = useState(0);
  const [activity, setActivity] = useState(0);
  const [respiration, setRespiration] = useState(0);

  const total = appearance + pulse + grimace + activity + respiration;

  const getInterpretation = (score: number) => {
    if (score >= 7) return { text: "Normal — No immediate intervention needed", color: "text-green-700" };
    if (score >= 4) return { text: "Moderately depressed — May require some resuscitative measures", color: "text-yellow-700" };
    return { text: "Severely depressed — Requires immediate resuscitation", color: "text-red-700" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">APGAR Score for Newborn Assessment</h2>
      <div className="space-y-4 max-w-xl mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Appearance (Skin Color)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={appearance} onChange={e => setAppearance(Number(e.target.value))}>
            <option value={0}>0 — Blue/Pale all over</option>
            <option value={1}>1 — Blue extremities, body pink (Acrocyanosis)</option>
            <option value={2}>2 — Completely pink</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Pulse (Heart Rate)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={pulse} onChange={e => setPulse(Number(e.target.value))}>
            <option value={0}>0 — Absent</option>
            <option value={1}>1 — Below 100 bpm</option>
            <option value={2}>2 — Above 100 bpm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Grimace (Reflex Irritability)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={grimace} onChange={e => setGrimace(Number(e.target.value))}>
            <option value={0}>0 — No response</option>
            <option value={1}>1 — Grimace/feeble cry when stimulated</option>
            <option value={2}>2 — Cry, cough, or sneeze on stimulation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Activity (Muscle Tone)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={activity} onChange={e => setActivity(Number(e.target.value))}>
            <option value={0}>0 — Limp / None</option>
            <option value={1}>1 — Some flexion of extremities</option>
            <option value={2}>2 — Active motion, well-flexed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Respiration (Breathing Effort)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={respiration} onChange={e => setRespiration(Number(e.target.value))}>
            <option value={0}>0 — Absent</option>
            <option value={1}>1 — Weak, irregular, gasping</option>
            <option value={2}>2 — Strong cry, good breathing</option>
          </select>
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Total APGAR Score</p>
        <p className="text-3xl font-bold text-purple-900">{total} / 10</p>
        <p className={`mt-2 font-medium ${getInterpretation(total).color}`}>{getInterpretation(total).text}</p>
      </div>
    </div>
  );
}

function WellsCalculator() {
  return <ScoreCalculator title="Wells' Criteria for DVT" 
    items={[
      {key: "1", label: "Active cancer (+1)", value: 1},
      {key: "2", label: "Paralysis, paresis, or recent plaster immobilization of legs (+1)", value: 1},
      {key: "3", label: "Recently bedridden > 3 days or major surgery within 12 weeks (+1)", value: 1},
      {key: "4", label: "Localized tenderness along the deep venous system (+1)", value: 1},
      {key: "5", label: "Entire leg swollen (+1)", value: 1},
      {key: "6", label: "Calf swelling > 3 cm compared to asymptomatic leg (+1)", value: 1},
      {key: "7", label: "Pitting edema confined to symptomatic leg (+1)", value: 1},
      {key: "8", label: "Collateral superficial veins (non-varicose) (+1)", value: 1},
      {key: "9", label: "Previously documented DVT (+1)", value: 1},
      {key: "10", label: "Alternative diagnosis at least as likely as DVT (-2)", value: -2}
    ]} 
  />;
}

function GCSCalculator() {
  const [eye, setEye] = useState(1);
  const [verbal, setVerbal] = useState(1);
  const [motor, setMotor] = useState(1);

  const total = eye + verbal + motor;

  const getInterpretation = (score: number) => {
    if (score <= 8) return { text: "Severe brain injury — Coma (intubation likely needed)", color: "text-red-700" };
    if (score <= 12) return { text: "Moderate brain injury", color: "text-yellow-700" };
    return { text: "Mild brain injury", color: "text-green-700" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Glasgow Coma Scale (GCS)</h2>
      <div className="space-y-4 max-w-xl mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Eye Opening (E)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={eye} onChange={e => setEye(Number(e.target.value))}>
            <option value={1}>1 — No eye opening</option>
            <option value={2}>2 — Eye opening to pain</option>
            <option value={3}>3 — Eye opening to voice</option>
            <option value={4}>4 — Eyes open spontaneously</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Verbal Response (V)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={verbal} onChange={e => setVerbal(Number(e.target.value))}>
            <option value={1}>1 — No verbal response</option>
            <option value={2}>2 — Incomprehensible sounds</option>
            <option value={3}>3 — Inappropriate words</option>
            <option value={4}>4 — Confused</option>
            <option value={5}>5 — Oriented</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Motor Response (M)</label>
          <select className="w-full border p-2 rounded text-gray-800" value={motor} onChange={e => setMotor(Number(e.target.value))}>
            <option value={1}>1 — No motor response</option>
            <option value={2}>2 — Extension to pain (decerebrate)</option>
            <option value={3}>3 — Abnormal flexion to pain (decorticate)</option>
            <option value={4}>4 — Withdrawal from pain</option>
            <option value={5}>5 — Localizing pain</option>
            <option value={6}>6 — Obeys commands</option>
          </select>
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Total GCS Score</p>
        <p className="text-3xl font-bold text-purple-900">{total} / 15</p>
        <p className="text-sm text-gray-600 mt-1">E{eye} + V{verbal} + M{motor}</p>
        <p className={`mt-2 font-medium ${getInterpretation(total).color}`}>{getInterpretation(total).text}</p>
      </div>
    </div>
  );
}

// Generic component for checkbox-based scores
function ScoreCalculator({ title, items }: { title: string, items: any[] }) {
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<any>({});

  const toggle = (item: any) => {
    const newOpt = { ...options, [item.key]: !options[item.key] };
    setOptions(newOpt);
    let s = 0;
    items.forEach(i => {
      if (newOpt[i.key]) s += i.value;
    });
    setScore(s);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">{title}</h2>
      <div className="space-y-3 mb-6 max-w-xl">
        {items.map(item => (
          <label key={item.key} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" className="mr-3 w-5 h-5 text-purple-600 rounded" checked={options[item.key] || false} onChange={() => toggle(item)} />
            <span className="font-medium text-gray-800">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 inline-block min-w-[200px]">
         <p className="text-sm text-purple-800 uppercase tracking-wide font-bold">Total Score</p>
         <p className="text-3xl font-bold text-purple-900">{score} Points</p>
      </div>
    </div>
  );
}
