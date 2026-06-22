"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const labCategories = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    description: "Evaluates overall health and detects a wide range of disorders, including anemia, infection, and leukemia.",
    labs: [
      { name: "White Blood Cells (WBC)", range: "4,500 to 11,000 cells/mcL", meaningHigh: "Infection, Inflammation, Leukemia", meaningLow: "Bone marrow failure, Autoimmune diseases" },
      { name: "Red Blood Cells (RBC)", range: "Male: 4.32-5.72 / Female: 3.90-5.03 million/mcL", meaningHigh: "Dehydration, Polycythemia vera", meaningLow: "Anemia, Bleeding" },
      { name: "Hemoglobin (Hgb)", range: "Male: 13.5-17.5 / Female: 12.0-15.5 g/dL", meaningHigh: "Polycythemia, COPD", meaningLow: "Anemia, Iron deficiency" },
      { name: "Hematocrit (Hct)", range: "Male: 38.3-48.6% / Female: 35.5-44.9%", meaningHigh: "Dehydration", meaningLow: "Anemia, Bleeding" },
      { name: "Platelets", range: "150,000 to 450,000/mcL", meaningHigh: "Essential thrombocythemia", meaningLow: "Thrombocytopenia, Bleeding risk" },
    ]
  },
  {
    id: "bmp",
    name: "Basic Metabolic Panel (BMP)",
    description: "Measures glucose, calcium, and electrolytes, as well as kidney function.",
    labs: [
      { name: "Sodium (Na)", range: "135 to 145 mEq/L", meaningHigh: "Dehydration, Diabetes Insipidus", meaningLow: "Diuretic use, Heart failure, Overhydration" },
      { name: "Potassium (K)", range: "3.5 to 5.0 mEq/L", meaningHigh: "Kidney disease, ACE inhibitors", meaningLow: "Diuretic use, Diarrhea, Vomiting" },
      { name: "Chloride (Cl)", range: "96 to 106 mEq/L", meaningHigh: "Dehydration, Metabolic acidosis", meaningLow: "Metabolic alkalosis, Heart failure" },
      { name: "CO2 (Bicarbonate)", range: "23 to 29 mEq/L", meaningHigh: "COPD, Metabolic alkalosis", meaningLow: "Metabolic acidosis, Kidney disease" },
      { name: "BUN (Blood Urea Nitrogen)", range: "7 to 20 mg/dL", meaningHigh: "Kidney failure, Dehydration, GI bleeding", meaningLow: "Liver disease, Malnutrition" },
      { name: "Creatinine", range: "Male: 0.7-1.3 / Female: 0.6-1.1 mg/dL", meaningHigh: "Kidney impairment, Muscle breakdown", meaningLow: "Low muscle mass, Malnutrition" },
      { name: "Glucose (Fasting)", range: "70 to 99 mg/dL", meaningHigh: "Diabetes, Stress, Pancreatitis", meaningLow: "Insulin overdose, Starvation, Liver disease" },
    ]
  },
  {
    id: "lft",
    name: "Liver Function Tests (LFT)",
    description: "Determines the health of the liver by measuring levels of proteins, liver enzymes, and bilirubin in your blood.",
    labs: [
      { name: "ALT (Alanine Transaminase)", range: "7 to 55 U/L", meaningHigh: "Hepatitis, Liver necrosis, Ischemia", meaningLow: "Normal" },
      { name: "AST (Aspartate Transaminase)", range: "8 to 48 U/L", meaningHigh: "Hepatitis, Myocardial infarction, Muscle injury", meaningLow: "Normal" },
      { name: "ALP (Alkaline Phosphatase)", range: "40 to 129 U/L", meaningHigh: "Biliary obstruction, Bone disease (Paget's)", meaningLow: "Malnutrition, Zinc deficiency" },
      { name: "Total Bilirubin", range: "0.1 to 1.2 mg/dL", meaningHigh: "Jaundice, Hemolysis, Biliary obstruction", meaningLow: "Normal" },
      { name: "Albumin", range: "3.5 to 5.0 g/dL", meaningHigh: "Dehydration", meaningLow: "Liver disease, Nephrotic syndrome, Malnutrition" },
    ]
  },
  {
    id: "lipids",
    name: "Lipid Panel",
    description: "Measures lipids in your blood, such as cholesterol and triglycerides.",
    labs: [
      { name: "Total Cholesterol", range: "< 200 mg/dL", meaningHigh: "Hypercholesterolemia, Cardiovascular risk", meaningLow: "Malnutrition, Hyperthyroidism" },
      { name: "LDL (Bad Cholesterol)", range: "< 100 mg/dL (Optimal)", meaningHigh: "Atherosclerosis, Heart disease risk", meaningLow: "Normal/Optimal" },
      { name: "HDL (Good Cholesterol)", range: "Male: > 40 / Female: > 50 mg/dL", meaningHigh: "Lower cardiovascular risk", meaningLow: "Higher cardiovascular risk, Metabolic syndrome" },
      { name: "Triglycerides", range: "< 150 mg/dL", meaningHigh: "Metabolic syndrome, Diabetes, Pancreatitis risk", meaningLow: "Normal" },
    ]
  }
];

export default function LabValuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCategories = labCategories.map(cat => {
    if (selectedCategory !== "all" && cat.id !== selectedCategory) return null;
    
    const filteredLabs = cat.labs.filter(lab => 
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lab.meaningHigh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.meaningLow.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLabs.length === 0 && !cat.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;

    return {
      ...cat,
      labs: searchQuery ? filteredLabs : cat.labs
    };
  }).filter(Boolean) as typeof labCategories;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <Link href="/knowledge" className="hover:text-blue-600 transition">Knowledge Base</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Lab Values</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Lab Values Reference</h1>
            <p className="text-gray-600 mt-2">Comprehensive guide to normal laboratory values, causes for elevation and depression.</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Lab Values</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Potassium, ALT, Anemia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="cbc">Complete Blood Count (CBC)</option>
                <option value="bmp">Basic Metabolic Panel (BMP)</option>
                <option value="lft">Liver Function Tests (LFT)</option>
                <option value="lipids">Lipid Panel</option>
              </select>
            </div>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-5xl mb-4">🔬</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No lab values found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50/50 p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Lab Test</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Normal Range</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider w-1/4">Elevated Means (↑)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider w-1/4">Decreased Means (↓)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {category.labs.map((lab, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lab.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 bg-gray-50/30">{lab.range}</td>
                          <td className="px-6 py-4 text-sm text-red-700">{lab.meaningHigh}</td>
                          <td className="px-6 py-4 text-sm text-blue-700">{lab.meaningLow}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
