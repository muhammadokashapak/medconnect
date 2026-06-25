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
      { name: "White Blood Cells (WBC)", range: "4.5 to 11.0 x 10^9/L", meaningHigh: "Infection, Inflammation, Leukemia, Stress", meaningLow: "Bone marrow failure, Autoimmune diseases, Severe infection" },
      { name: "Red Blood Cells (RBC)", range: "Male: 4.3-5.7 / Female: 3.9-5.0 million/mcL", meaningHigh: "Dehydration, Polycythemia vera, Hypoxia", meaningLow: "Anemia, Bleeding, Hemolysis" },
      { name: "Hemoglobin (Hgb)", range: "Male: 13.5-17.5 / Female: 12.0-15.5 g/dL", meaningHigh: "Polycythemia, COPD, Congenital heart disease", meaningLow: "Anemia, Iron deficiency, Thalassemia" },
      { name: "Hematocrit (Hct)", range: "Male: 38.3-48.6% / Female: 35.5-44.9%", meaningHigh: "Dehydration, Polycythemia, Burns", meaningLow: "Anemia, Bleeding, Overhydration" },
      { name: "Platelets (Plt)", range: "150,000 to 450,000/mcL", meaningHigh: "Essential thrombocythemia, Infection, Inflammation", meaningLow: "Thrombocytopenia, Viral infection, DIC, Splenomegaly" },
      { name: "Mean Corpuscular Volume (MCV)", range: "80 to 100 fL", meaningHigh: "Macrocytic anemia (B12/Folate deficiency), Liver disease, Alcoholism", meaningLow: "Microcytic anemia (Iron deficiency, Thalassemia)" },
      { name: "Mean Corpuscular Hemoglobin (MCH)", range: "27 to 33 pg", meaningHigh: "Macrocytic anemia", meaningLow: "Microcytic anemia, Iron deficiency" },
      { name: "Mean Corpuscular Hemoglobin Concentration (MCHC)", range: "32 to 36 g/dL", meaningHigh: "Hereditary spherocytosis, Severe burns", meaningLow: "Iron deficiency anemia, Thalassemia" },
      { name: "Red Cell Distribution Width (RDW)", range: "11.5 to 14.5%", meaningHigh: "Iron, B12, or Folate deficiency (anisocytosis)", meaningLow: "Usually not clinically significant" }
    ]
  },
  {
    id: "bmp",
    name: "Basic Metabolic Panel (BMP)",
    description: "Measures glucose, calcium, and electrolytes, as well as kidney function.",
    labs: [
      { name: "Sodium (Na)", range: "135 to 145 mEq/L", meaningHigh: "Dehydration, Diabetes Insipidus, Cushing syndrome", meaningLow: "Diuretic use, Heart failure, Overhydration, SIADH" },
      { name: "Potassium (K)", range: "3.5 to 5.0 mEq/L", meaningHigh: "Kidney disease, ACE inhibitors, Tissue damage (crush injury)", meaningLow: "Diuretic use, Diarrhea, Vomiting, Hyperaldosteronism" },
      { name: "Chloride (Cl)", range: "96 to 106 mEq/L", meaningHigh: "Dehydration, Metabolic acidosis, Renal tubular acidosis", meaningLow: "Metabolic alkalosis, Heart failure, Prolonged vomiting" },
      { name: "CO2 (Bicarbonate)", range: "23 to 29 mEq/L", meaningHigh: "COPD, Metabolic alkalosis, Severe vomiting", meaningLow: "Metabolic acidosis, Kidney disease, DKA, Lactic acidosis" },
      { name: "Blood Urea Nitrogen (BUN)", range: "7 to 20 mg/dL", meaningHigh: "Kidney failure, Dehydration, GI bleeding, High protein diet", meaningLow: "Liver disease, Malnutrition, Overhydration" },
      { name: "Creatinine (Cr)", range: "Male: 0.7-1.3 / Female: 0.6-1.1 mg/dL", meaningHigh: "Kidney impairment, Muscle breakdown (rhabdomyolysis)", meaningLow: "Low muscle mass, Malnutrition, Pregnancy" },
      { name: "Glucose (Fasting)", range: "70 to 99 mg/dL", meaningHigh: "Diabetes, Stress, Pancreatitis, Corticosteroid use", meaningLow: "Insulin overdose, Starvation, Liver disease, Insulinoma" },
      { name: "Calcium (Ca)", range: "8.5 to 10.2 mg/dL", meaningHigh: "Hyperparathyroidism, Malignancy, Vitamin D toxicity", meaningLow: "Hypoparathyroidism, Vitamin D deficiency, Chronic kidney disease" }
    ]
  },
  {
    id: "renal",
    name: "Renal Panel",
    description: "Comprehensive assessment of kidney function and related minerals.",
    labs: [
      { name: "Estimated Glomerular Filtration Rate (eGFR)", range: "> 90 mL/min/1.73m2", meaningHigh: "Normal kidney function", meaningLow: "Chronic kidney disease, Acute kidney injury" },
      { name: "Uric Acid", range: "Male: 3.4-7.0 / Female: 2.4-6.0 mg/dL", meaningHigh: "Gout, Renal failure, Tumor lysis syndrome, Diuretics", meaningLow: "Wilson's disease, SIADH, Fanconi syndrome" },
      { name: "Phosphorus (PO4)", range: "2.5 to 4.5 mg/dL", meaningHigh: "Renal failure, Hypoparathyroidism, Rhabdomyolysis", meaningLow: "Hyperparathyroidism, Vitamin D deficiency, Refeeding syndrome" },
      { name: "Magnesium (Mg)", range: "1.7 to 2.2 mg/dL", meaningHigh: "Renal failure, Excessive antacid use", meaningLow: "Alcoholism, Diuretics, Malabsorption, Diarrhea" }
    ]
  },
  {
    id: "lft",
    name: "Liver Function Tests (LFT)",
    description: "Determines the health of the liver by measuring levels of proteins, liver enzymes, and bilirubin.",
    labs: [
      { name: "ALT (Alanine Transaminase)", range: "7 to 55 U/L", meaningHigh: "Hepatitis, Liver necrosis, Ischemia, Drug toxicity", meaningLow: "Normal" },
      { name: "AST (Aspartate Transaminase)", range: "8 to 48 U/L", meaningHigh: "Hepatitis, Myocardial infarction, Muscle injury, Alcohol abuse", meaningLow: "Normal" },
      { name: "ALP (Alkaline Phosphatase)", range: "40 to 129 U/L", meaningHigh: "Biliary obstruction, Bone disease (Paget's), Pregnancy", meaningLow: "Malnutrition, Zinc deficiency, Hypophosphatasia" },
      { name: "Total Bilirubin", range: "0.1 to 1.2 mg/dL", meaningHigh: "Jaundice, Hemolysis, Biliary obstruction, Gilbert's syndrome", meaningLow: "Normal" },
      { name: "Direct (Conjugated) Bilirubin", range: "< 0.3 mg/dL", meaningHigh: "Biliary obstruction, Dubin-Johnson syndrome", meaningLow: "Normal" },
      { name: "Albumin", range: "3.5 to 5.0 g/dL", meaningHigh: "Dehydration", meaningLow: "Liver disease, Nephrotic syndrome, Malnutrition, Inflammation" },
      { name: "Total Protein", range: "6.0 to 8.3 g/dL", meaningHigh: "Multiple myeloma, Chronic inflammation, Dehydration", meaningLow: "Liver disease, Kidney disease, Malnutrition" },
      { name: "Gamma-Glutamyl Transferase (GGT)", range: "8 to 61 U/L", meaningHigh: "Alcohol abuse, Biliary obstruction, Liver disease", meaningLow: "Normal" }
    ]
  },
  {
    id: "cardiac",
    name: "Cardiac Biomarkers",
    description: "Tests to evaluate heart function, acute myocardial infarction, and heart failure.",
    labs: [
      { name: "Troponin I", range: "< 0.04 ng/mL", meaningHigh: "Myocardial infarction, Myocarditis, Severe heart failure", meaningLow: "Normal" },
      { name: "Troponin T", range: "< 0.01 ng/mL", meaningHigh: "Myocardial infarction, Renal failure, Pulmonary embolism", meaningLow: "Normal" },
      { name: "CK-MB", range: "0 to 3 ng/mL", meaningHigh: "Myocardial infarction, Skeletal muscle damage", meaningLow: "Normal" },
      { name: "BNP (B-type Natriuretic Peptide)", range: "< 100 pg/mL", meaningHigh: "Congestive heart failure, Cor pulmonale, Renal failure", meaningLow: "Normal" },
      { name: "Myoglobin", range: "< 85 ng/mL", meaningHigh: "Myocardial infarction, Rhabdomyolysis, Skeletal muscle trauma", meaningLow: "Normal" }
    ]
  },
  {
    id: "coagulation",
    name: "Coagulation Profile",
    description: "Assesses blood clotting function and monitors anticoagulant therapies.",
    labs: [
      { name: "Prothrombin Time (PT)", range: "11.0 to 13.5 seconds", meaningHigh: "Liver disease, Vitamin K deficiency, Warfarin therapy, DIC", meaningLow: "Hypercoagulable state" },
      { name: "International Normalized Ratio (INR)", range: "0.8 to 1.1 (Target 2.0-3.0 on Warfarin)", meaningHigh: "Warfarin therapy, Liver disease, Vitamin K deficiency", meaningLow: "Risk of clotting" },
      { name: "Activated Partial Thromboplastin Time (aPTT)", range: "25 to 35 seconds", meaningHigh: "Heparin therapy, Hemophilia, Lupus anticoagulant, DIC", meaningLow: "Extensive cancer, Early DIC" },
      { name: "D-Dimer", range: "< 0.50 mg/L FEU", meaningHigh: "DVT, Pulmonary Embolism, DIC, Pregnancy, Malignancy", meaningLow: "Normal (Rules out VTE in low-risk patients)" },
      { name: "Fibrinogen", range: "200 to 400 mg/dL", meaningHigh: "Acute phase reactant, Inflammation, Pregnancy", meaningLow: "DIC, Severe liver disease, Congenital afibrinogenemia" }
    ]
  },
  {
    id: "abg",
    name: "Arterial Blood Gas (ABG)",
    description: "Measures oxygen, carbon dioxide, and acid-base status of the blood.",
    labs: [
      { name: "pH", range: "7.35 to 7.45", meaningHigh: "Alkalosis (Metabolic or Respiratory)", meaningLow: "Acidosis (Metabolic or Respiratory)" },
      { name: "pCO2 (Partial Pressure of Carbon Dioxide)", range: "35 to 45 mmHg", meaningHigh: "Respiratory acidosis (Hypoventilation), Compensatory metabolic alkalosis", meaningLow: "Respiratory alkalosis (Hyperventilation), Compensatory metabolic acidosis" },
      { name: "pO2 (Partial Pressure of Oxygen)", range: "80 to 100 mmHg", meaningHigh: "Supplemental oxygen therapy", meaningLow: "Hypoxemia (Pulmonary disease, Heart failure)" },
      { name: "HCO3 (Bicarbonate)", range: "22 to 26 mEq/L", meaningHigh: "Metabolic alkalosis, Compensatory respiratory acidosis", meaningLow: "Metabolic acidosis, Compensatory respiratory alkalosis" },
      { name: "Base Excess (BE)", range: "-2 to +2 mEq/L", meaningHigh: "Metabolic alkalosis", meaningLow: "Metabolic acidosis" },
      { name: "SaO2 (Oxygen Saturation)", range: "95 to 100%", meaningHigh: "Hyperoxia", meaningLow: "Hypoxia, Lung disease, Anemia" }
    ]
  },
  {
    id: "endocrine",
    name: "Endocrine & Hormones",
    description: "Evaluates thyroid, adrenal, and reproductive hormone levels.",
    labs: [
      { name: "TSH (Thyroid Stimulating Hormone)", range: "0.4 to 4.0 mIU/L", meaningHigh: "Hypothyroidism, TSH-secreting tumor", meaningLow: "Hyperthyroidism, Overtreatment with levothyroxine" },
      { name: "Free T4 (Thyroxine)", range: "0.9 to 2.3 ng/dL", meaningHigh: "Hyperthyroidism", meaningLow: "Hypothyroidism" },
      { name: "Free T3 (Triiodothyronine)", range: "2.3 to 4.1 pg/mL", meaningHigh: "Hyperthyroidism", meaningLow: "Hypothyroidism, Non-thyroidal illness syndrome" },
      { name: "Cortisol (Morning)", range: "5 to 25 mcg/dL", meaningHigh: "Cushing's syndrome, Stress, Pregnancy", meaningLow: "Addison's disease, Pituitary insufficiency" },
      { name: "Hemoglobin A1c (HbA1c)", range: "< 5.7% (Prediabetes 5.7-6.4%, Diabetes ≥6.5%)", meaningHigh: "Poor blood sugar control, Diabetes mellitus", meaningLow: "Hypoglycemia, Hemolytic anemia" },
      { name: "Prolactin", range: "Male: 2-18 / Female: 2-29 ng/mL", meaningHigh: "Prolactinoma, Pregnancy, Hypothyroidism, Medications (antipsychotics)", meaningLow: "Pituitary necrosis (Sheehan's syndrome)" },
      { name: "FSH (Follicle Stimulating Hormone)", range: "Varies by gender/cycle phase", meaningHigh: "Menopause, Primary ovarian failure, Klinefelter syndrome", meaningLow: "Pituitary or Hypothalamic disorder, Pregnancy" }
    ]
  },
  {
    id: "tumor_autoimmune",
    name: "Tumor Markers & Autoimmune",
    description: "Markers for cancer screening/monitoring and indicators of autoimmune diseases.",
    labs: [
      { name: "PSA (Prostate-Specific Antigen)", range: "< 4.0 ng/mL", meaningHigh: "Prostate cancer, BPH, Prostatitis", meaningLow: "Normal" },
      { name: "CEA (Carcinoembryonic Antigen)", range: "< 2.5 ng/mL (Non-smoker) / < 5.0 (Smoker)", meaningHigh: "Colorectal cancer, Pancreatic cancer, Heavy smoking", meaningLow: "Normal" },
      { name: "CA-125", range: "< 35 U/mL", meaningHigh: "Ovarian cancer, Endometriosis, PID", meaningLow: "Normal" },
      { name: "CRP (C-Reactive Protein)", range: "< 10 mg/L", meaningHigh: "Acute infection, Inflammation, Tissue injury, Rheumatoid arthritis", meaningLow: "Normal" },
      { name: "ESR (Erythrocyte Sedimentation Rate)", range: "Male: 0-15 / Female: 0-20 mm/hr", meaningHigh: "Inflammation, Infection, Autoimmune diseases, Multiple myeloma", meaningLow: "Polycythemia, Sickle cell anemia, Congestive heart failure" },
      { name: "ANA (Antinuclear Antibody)", range: "Negative (Titer < 1:40)", meaningHigh: "SLE (Lupus), Sjogren's syndrome, Scleroderma", meaningLow: "Normal" },
      { name: "Rheumatoid Factor (RF)", range: "< 15 IU/mL", meaningHigh: "Rheumatoid arthritis, Sjogren's syndrome, Chronic infections", meaningLow: "Normal" }
    ]
  },
  {
    id: "lipids",
    name: "Lipid Panel",
    description: "Measures lipids in your blood, such as cholesterol and triglycerides.",
    labs: [
      { name: "Total Cholesterol", range: "< 200 mg/dL", meaningHigh: "Hypercholesterolemia, Cardiovascular risk, Hypothyroidism", meaningLow: "Malnutrition, Hyperthyroidism, Liver disease" },
      { name: "LDL (Bad Cholesterol)", range: "< 100 mg/dL (Optimal)", meaningHigh: "Atherosclerosis, Heart disease risk, Familial hypercholesterolemia", meaningLow: "Normal/Optimal, Malnutrition" },
      { name: "HDL (Good Cholesterol)", range: "Male: > 40 / Female: > 50 mg/dL", meaningHigh: "Lower cardiovascular risk, Regular exercise", meaningLow: "Higher cardiovascular risk, Metabolic syndrome, Smoking" },
      { name: "Triglycerides", range: "< 150 mg/dL", meaningHigh: "Metabolic syndrome, Diabetes, Alcoholism, Pancreatitis risk", meaningLow: "Normal, Low fat diet" }
    ]
  }
];

const diseaseMappings = [
  { id: "all", name: "All Conditions" },
  { id: "anemia", name: "Anemia", labs: ["Hemoglobin (Hgb)", "Hematocrit (Hct)", "Red Blood Cells (RBC)", "Mean Corpuscular Volume (MCV)", "Mean Corpuscular Hemoglobin (MCH)", "Mean Corpuscular Hemoglobin Concentration (MCHC)", "Red Cell Distribution Width (RDW)"] },
  { id: "infection", name: "Infection / Sepsis", labs: ["White Blood Cells (WBC)", "Platelets (Plt)", "CRP (C-Reactive Protein)", "ESR (Erythrocyte Sedimentation Rate)", "Procalcitonin", "Lactate"] },
  { id: "kidney", name: "Kidney Health (CKD/AKI)", labs: ["Blood Urea Nitrogen (BUN)", "Creatinine (Cr)", "Estimated Glomerular Filtration Rate (eGFR)", "Potassium (K)", "Sodium (Na)", "Phosphorus (PO4)", "Calcium (Ca)"] },
  { id: "liver", name: "Liver Disease / Cirrhosis", labs: ["ALT (Alanine Transaminase)", "AST (Aspartate Transaminase)", "ALP (Alkaline Phosphatase)", "Total Bilirubin", "Direct (Conjugated) Bilirubin", "Albumin", "Total Protein", "Gamma-Glutamyl Transferase (GGT)", "Prothrombin Time (PT)", "Platelets (Plt)"] },
  { id: "heart_attack", name: "Heart Attack (MI)", labs: ["Troponin I", "Troponin T", "CK-MB", "Myoglobin", "BNP (B-type Natriuretic Peptide)", "Potassium (K)"] },
  { id: "heart_failure", name: "Heart Failure", labs: ["BNP (B-type Natriuretic Peptide)", "Sodium (Na)", "Potassium (K)", "Creatinine (Cr)", "Estimated Glomerular Filtration Rate (eGFR)"] },
  { id: "diabetes", name: "Diabetes Mellitus", labs: ["Glucose (Fasting)", "Hemoglobin A1c (HbA1c)", "Creatinine (Cr)", "Estimated Glomerular Filtration Rate (eGFR)", "Total Cholesterol", "LDL (Bad Cholesterol)", "Triglycerides"] },
  { id: "thyroid", name: "Thyroid Disorders", labs: ["TSH (Thyroid Stimulating Hormone)", "Free T4 (Thyroxine)", "Free T3 (Triiodothyronine)"] },
  { id: "bleeding", name: "Bleeding / Coagulation", labs: ["Platelets (Plt)", "Prothrombin Time (PT)", "International Normalized Ratio (INR)", "Activated Partial Thromboplastin Time (aPTT)", "D-Dimer", "Fibrinogen"] },
  { id: "respiratory", name: "COPD / Respiratory Failure", labs: ["pH", "pCO2 (Partial Pressure of Carbon Dioxide)", "pO2 (Partial Pressure of Oxygen)", "HCO3 (Bicarbonate)", "SaO2 (Oxygen Saturation)"] },
  { id: "dehydration", name: "Dehydration / Hypovolemia", labs: ["Blood Urea Nitrogen (BUN)", "Creatinine (Cr)", "Sodium (Na)", "Hematocrit (Hct)", "Albumin", "Total Protein"] },
  { id: "bone", name: "Bone Disease / Osteoporosis", labs: ["Calcium (Ca)", "Phosphorus (PO4)", "ALP (Alkaline Phosphatase)", "Vitamin D"] },
  { id: "dvt", name: "DVT / Pulmonary Embolism", labs: ["D-Dimer", "Prothrombin Time (PT)", "International Normalized Ratio (INR)", "Activated Partial Thromboplastin Time (aPTT)", "pO2 (Partial Pressure of Oxygen)"] },
  { id: "autoimmune", name: "Autoimmune / Lupus", labs: ["ANA (Antinuclear Antibody)", "Rheumatoid Factor (RF)", "CRP (C-Reactive Protein)", "ESR (Erythrocyte Sedimentation Rate)", "Estimated Glomerular Filtration Rate (eGFR)"] },
  { id: "gout", name: "Gout / Hyperuricemia", labs: ["Uric Acid", "Creatinine (Cr)", "Estimated Glomerular Filtration Rate (eGFR)"] },
  { id: "prostate", name: "Prostate Issues (BPH)", labs: ["PSA (Prostate-Specific Antigen)", "Creatinine (Cr)", "Estimated Glomerular Filtration Rate (eGFR)", "Blood Urea Nitrogen (BUN)"] },
  { id: "ovarian", name: "Ovarian Cancer Risk", labs: ["CA-125", "CRP (C-Reactive Protein)", "ESR (Erythrocyte Sedimentation Rate)"] },
  { id: "colon", name: "Colon Cancer Risk", labs: ["CEA (Carcinoembryonic Antigen)", "Hemoglobin (Hgb)", "Hematocrit (Hct)"] },
  { id: "malnutrition", name: "Malnutrition", labs: ["Albumin", "Total Protein", "Calcium (Ca)", "Phosphorus (PO4)", "Magnesium (Mg)", "Total Cholesterol"] }
];

export default function LabValuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredCategories = labCategories.map(cat => {
    const isCategory = labCategories.some(c => c.id === selectedFilter);
    const isDisease = diseaseMappings.some(d => d.id === selectedFilter);

    // 1. Filter by category
    if (selectedFilter !== "all" && isCategory && cat.id !== selectedFilter) return null;
    
    // 2. Filter by disease
    let diseaseLabs = cat.labs;
    if (selectedFilter !== "all" && isDisease) {
      const condition = diseaseMappings.find(d => d.id === selectedFilter);
      if (condition && condition.labs) {
        diseaseLabs = cat.labs.filter(lab => condition.labs.includes(lab.name));
      }
    }

    if (diseaseLabs.length === 0) return null;

    // 3. Filter by search query
    const finalLabs = diseaseLabs.filter(lab => 
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lab.meaningHigh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.meaningLow.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (finalLabs.length === 0 && !cat.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;

    return {
      ...cat,
      labs: searchQuery ? finalLabs : diseaseLabs
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
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
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Panel or Condition</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">All Labs</option>
                <optgroup label="Organ Systems & Panels">
                  <option value="cbc">Complete Blood Count (CBC)</option>
                  <option value="bmp">Basic Metabolic Panel (BMP)</option>
                  <option value="lft">Liver Function Tests (LFT)</option>
                  <option value="renal">Renal Panel</option>
                  <option value="cardiac">Cardiac Biomarkers</option>
                  <option value="coagulation">Coagulation Profile</option>
                  <option value="abg">Arterial Blood Gas (ABG)</option>
                  <option value="endocrine">Endocrine & Hormones</option>
                  <option value="tumor_autoimmune">Tumor Markers & Autoimmune</option>
                  <option value="lipids">Lipid Panel</option>
                </optgroup>
                <optgroup label="Clinical Conditions">
                  {diseaseMappings.filter(d => d.id !== 'all').map(disease => (
                    <option key={disease.id} value={disease.id}>{disease.name}</option>
                  ))}
                </optgroup>
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
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Lab Test</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Normal Range</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider w-[25%]">Elevated Means (↑)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider w-[25%]">Decreased Means (↓)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {category.labs.map((lab, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">{lab.name}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50/50 align-top break-words">{lab.range}</td>
                            <td className="px-6 py-4 text-sm text-red-700 align-top">{lab.meaningHigh}</td>
                            <td className="px-6 py-4 text-sm text-blue-700 align-top">{lab.meaningLow}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {category.labs.map((lab, idx) => (
                      <div key={idx} className="p-4 bg-white hover:bg-gray-50 transition">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{lab.name}</h3>
                        <div className="bg-gray-100 px-3 py-2 rounded-lg inline-block mb-3">
                          <span className="text-xs text-gray-500 uppercase font-bold block mb-0.5">Normal Range</span>
                          <span className="text-sm font-semibold text-gray-800">{lab.range}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {lab.meaningHigh && lab.meaningHigh !== "Normal" && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                              <span className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center mb-1">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                Elevated (High)
                              </span>
                              <span className="text-sm text-red-800">{lab.meaningHigh}</span>
                            </div>
                          )}
                          {lab.meaningLow && lab.meaningLow !== "Normal" && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center mb-1">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                Decreased (Low)
                              </span>
                              <span className="text-sm text-blue-800">{lab.meaningLow}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
