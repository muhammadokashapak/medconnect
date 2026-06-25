import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    data: [
  {
    "id": "mi",
    "disease": "Myocardial Infarction (Heart Attack)",
    "category": "Cardiology",
    "tests": [
      {
        "name": "Troponin T or I",
        "normalValue": "< 0.04 ng/mL",
        "conditionValue": "> 0.04 ng/mL (serial rise)",
        "clinicalSignificance": "Primary biomarker for myocardial necrosis."
      },
      {
        "name": "CK-MB",
        "normalValue": "0-3 ng/mL",
        "conditionValue": "> 3 ng/mL",
        "clinicalSignificance": "Useful for detecting reinfarction."
      },
      {
        "name": "ECG",
        "normalValue": "Normal sinus rhythm",
        "conditionValue": "ST-elevation or depression, T-wave inversion",
        "clinicalSignificance": "Differentiates STEMI vs NSTEMI."
      }
    ]
  },
  {
    "id": "hf",
    "disease": "Congestive Heart Failure",
    "category": "Cardiology",
    "tests": [
      {
        "name": "BNP",
        "normalValue": "< 100 pg/mL",
        "conditionValue": "> 400 pg/mL",
        "clinicalSignificance": "Confirms heart failure vs pulmonary causes."
      },
      {
        "name": "Echocardiogram",
        "normalValue": "EF > 55%",
        "conditionValue": "EF < 40%",
        "clinicalSignificance": "Diagnoses HFrEF vs HFpEF."
      }
    ]
  },
  {
    "id": "afib",
    "disease": "Atrial Fibrillation",
    "category": "Cardiology",
    "tests": [
      {
        "name": "ECG",
        "normalValue": "Normal PR, regular rhythm",
        "conditionValue": "Irregularly irregular, absent P waves",
        "clinicalSignificance": "Definitive diagnosis."
      },
      {
        "name": "TSH",
        "normalValue": "0.4-4.0 mIU/L",
        "conditionValue": "< 0.4 mIU/L",
        "clinicalSignificance": "Rule out hyperthyroidism."
      }
    ]
  },
  {
    "id": "pericarditis",
    "disease": "Acute Pericarditis",
    "category": "Cardiology",
    "tests": [
      {
        "name": "ECG",
        "normalValue": "Normal",
        "conditionValue": "Diffuse ST elevations, PR depressions",
        "clinicalSignificance": "Classic finding."
      },
      {
        "name": "ESR / CRP",
        "normalValue": "Normal",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Inflammation markers."
      }
    ]
  },
  {
    "id": "endocarditis",
    "disease": "Infective Endocarditis",
    "category": "Cardiology",
    "tests": [
      {
        "name": "Blood Cultures",
        "normalValue": "Negative",
        "conditionValue": "Positive x 3 sets",
        "clinicalSignificance": "Identifies causative organism."
      },
      {
        "name": "Echocardiogram (TEE)",
        "normalValue": "Normal valves",
        "conditionValue": "Vegetation or abscess",
        "clinicalSignificance": "Visualizes the infection."
      }
    ]
  },
  {
    "id": "aortic_dissection",
    "disease": "Aortic Dissection",
    "category": "Cardiology",
    "tests": [
      {
        "name": "CT Angiography",
        "normalValue": "Intact aorta",
        "conditionValue": "Intimal flap",
        "clinicalSignificance": "Gold standard imaging."
      },
      {
        "name": "D-Dimer",
        "normalValue": "< 0.5 µg/mL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "If normal, strongly rules out dissection."
      }
    ]
  },
  {
    "id": "pe",
    "disease": "Pulmonary Embolism",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "CTPA",
        "normalValue": "Clear arteries",
        "conditionValue": "Filling defect",
        "clinicalSignificance": "Definitive diagnosis."
      },
      {
        "name": "D-Dimer",
        "normalValue": "< 0.5 µg/mL FEU",
        "conditionValue": "> 0.5 µg/mL",
        "clinicalSignificance": "High sensitivity to rule out."
      }
    ]
  },
  {
    "id": "copd",
    "disease": "COPD Exacerbation",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "ABG (pCO2)",
        "normalValue": "35-45 mmHg",
        "conditionValue": "> 45 mmHg",
        "clinicalSignificance": "Hypercapnic failure."
      },
      {
        "name": "Chest X-Ray",
        "normalValue": "Clear",
        "conditionValue": "Hyperinflation, exclude pneumonia",
        "clinicalSignificance": "Check for complications."
      }
    ]
  },
  {
    "id": "asthma",
    "disease": "Asthma Exacerbation",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "Peak Flow (PEF)",
        "normalValue": "> 80% predicted",
        "conditionValue": "< 50% predicted",
        "clinicalSignificance": "Assesses severity."
      },
      {
        "name": "ABG",
        "normalValue": "Normal",
        "conditionValue": "Respiratory Alkalosis, then Acidosis",
        "clinicalSignificance": "Acidosis indicates impending failure."
      }
    ]
  },
  {
    "id": "pneumonia",
    "disease": "Community-Acquired Pneumonia",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "Chest X-Ray",
        "normalValue": "Clear",
        "conditionValue": "Lobar consolidation",
        "clinicalSignificance": "Confirms diagnosis."
      },
      {
        "name": "Procalcitonin",
        "normalValue": "< 0.15 ng/mL",
        "conditionValue": "> 0.25 ng/mL",
        "clinicalSignificance": "Suggests bacterial etiology."
      }
    ]
  },
  {
    "id": "tb",
    "disease": "Tuberculosis",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "Sputum AFB Smear",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Rapid detection of acid-fast bacilli."
      },
      {
        "name": "GeneXpert MTB/RIF",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Confirms TB and Rifampin resistance."
      }
    ]
  },
  {
    "id": "ards",
    "disease": "Acute Respiratory Distress Syndrome",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "PaO2/FiO2 Ratio",
        "normalValue": "> 400",
        "conditionValue": "< 300",
        "clinicalSignificance": "Defines ARDS severity (Berlin criteria)."
      },
      {
        "name": "Chest X-Ray",
        "normalValue": "Clear",
        "conditionValue": "Bilateral opacities",
        "clinicalSignificance": "Non-cardiogenic pulmonary edema."
      }
    ]
  },
  {
    "id": "stroke",
    "disease": "Ischemic Stroke",
    "category": "Neurology",
    "tests": [
      {
        "name": "Non-Contrast Head CT",
        "normalValue": "Normal",
        "conditionValue": "Rule out hemorrhage",
        "clinicalSignificance": "Must be done before giving tPA."
      },
      {
        "name": "MRI Brain (DWI)",
        "normalValue": "Normal",
        "conditionValue": "Restricted diffusion",
        "clinicalSignificance": "Most sensitive for acute infarct."
      }
    ]
  },
  {
    "id": "sah",
    "disease": "Subarachnoid Hemorrhage",
    "category": "Neurology",
    "tests": [
      {
        "name": "Head CT",
        "normalValue": "Normal",
        "conditionValue": "Hyperdense blood in basal cisterns",
        "clinicalSignificance": "Diagnostic."
      },
      {
        "name": "Lumbar Puncture",
        "normalValue": "Clear",
        "conditionValue": "Xanthochromia",
        "clinicalSignificance": "Used if CT is negative but clinical suspicion high."
      }
    ]
  },
  {
    "id": "ms",
    "disease": "Multiple Sclerosis",
    "category": "Neurology",
    "tests": [
      {
        "name": "MRI Brain/Spine",
        "normalValue": "Normal",
        "conditionValue": "Demyelinating plaques (Dawson fingers)",
        "clinicalSignificance": "Shows dissemination in space/time."
      },
      {
        "name": "CSF Oligoclonal Bands",
        "normalValue": "Absent",
        "conditionValue": "Present (≥2 bands)",
        "clinicalSignificance": "Intrathecal IgG synthesis."
      }
    ]
  },
  {
    "id": "gb",
    "disease": "Guillain-Barré Syndrome",
    "category": "Neurology",
    "tests": [
      {
        "name": "CSF Analysis",
        "normalValue": "Normal protein/cells",
        "conditionValue": "High protein, normal WBC (Cytoalbuminologic dissociation)",
        "clinicalSignificance": "Classic finding."
      },
      {
        "name": "EMG / Nerve Conduction",
        "normalValue": "Normal",
        "conditionValue": "Demyelination",
        "clinicalSignificance": "Confirms neuropathy."
      }
    ]
  },
  {
    "id": "mg",
    "disease": "Myasthenia Gravis",
    "category": "Neurology",
    "tests": [
      {
        "name": "AChR Antibodies",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Highly specific."
      },
      {
        "name": "Ice Pack Test",
        "normalValue": "No change",
        "conditionValue": "Ptosis improves",
        "clinicalSignificance": "Bedside test."
      }
    ]
  },
  {
    "id": "seizure",
    "disease": "Epilepsy / Seizure Disorder",
    "category": "Neurology",
    "tests": [
      {
        "name": "EEG",
        "normalValue": "Normal rhythm",
        "conditionValue": "Epileptiform discharges",
        "clinicalSignificance": "Confirms seizure focus."
      },
      {
        "name": "Prolactin",
        "normalValue": "< 20 ng/mL",
        "conditionValue": "Elevated (within 20 mins)",
        "clinicalSignificance": "Differentiates true seizure from pseudoseizure."
      }
    ]
  },
  {
    "id": "dka",
    "disease": "Diabetic Ketoacidosis",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "Blood Glucose",
        "normalValue": "70-99 mg/dL",
        "conditionValue": "> 250 mg/dL",
        "clinicalSignificance": "Hyperglycemia."
      },
      {
        "name": "Beta-Hydroxybutyrate",
        "normalValue": "< 0.4 mmol/L",
        "conditionValue": "> 3.0 mmol/L",
        "clinicalSignificance": "Ketosis."
      },
      {
        "name": "pH (ABG/VBG)",
        "normalValue": "7.35-7.45",
        "conditionValue": "< 7.30",
        "clinicalSignificance": "Acidosis."
      }
    ]
  },
  {
    "id": "hhs",
    "disease": "Hyperosmolar Hyperglycemic State",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "Blood Glucose",
        "normalValue": "70-99 mg/dL",
        "conditionValue": "> 600 mg/dL",
        "clinicalSignificance": "Profound hyperglycemia."
      },
      {
        "name": "Serum Osmolality",
        "normalValue": "275-295 mOsm/kg",
        "conditionValue": "> 320 mOsm/kg",
        "clinicalSignificance": "Severe hyperosmolarity."
      }
    ]
  },
  {
    "id": "hypothyroid",
    "disease": "Hypothyroidism",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "TSH",
        "normalValue": "0.4-4.0 mIU/L",
        "conditionValue": "> 4.0 mIU/L",
        "clinicalSignificance": "Primary screening."
      },
      {
        "name": "Free T4",
        "normalValue": "0.8-1.8 ng/dL",
        "conditionValue": "< 0.8 ng/dL",
        "clinicalSignificance": "Confirms overt disease."
      }
    ]
  },
  {
    "id": "addison",
    "disease": "Addison's Disease",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "8 AM Cortisol",
        "normalValue": "10-20 µg/dL",
        "conditionValue": "< 3 µg/dL",
        "clinicalSignificance": "Suggests insufficiency."
      },
      {
        "name": "ACTH Stimulation Test",
        "normalValue": "Cortisol rises >18 µg/dL",
        "conditionValue": "Failure to rise",
        "clinicalSignificance": "Confirms primary adrenal insufficiency."
      }
    ]
  },
  {
    "id": "cushing",
    "disease": "Cushing's Syndrome",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "24-hr Urine Free Cortisol",
        "normalValue": "10-50 µg/day",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Screening test."
      },
      {
        "name": "Dexamethasone Suppression",
        "normalValue": "Cortisol < 1.8 µg/dL",
        "conditionValue": "Failure to suppress",
        "clinicalSignificance": "Confirms hypercortisolism."
      }
    ]
  },
  {
    "id": "pancreatitis",
    "disease": "Acute Pancreatitis",
    "category": "Gastroenterology",
    "tests": [
      {
        "name": "Lipase",
        "normalValue": "0-160 U/L",
        "conditionValue": "> 3x upper limit",
        "clinicalSignificance": "Highly specific."
      },
      {
        "name": "CT Abdomen",
        "normalValue": "Normal",
        "conditionValue": "Pancreatic inflammation/necrosis",
        "clinicalSignificance": "Used if diagnosis is uncertain or complications suspected."
      }
    ]
  },
  {
    "id": "cirrhosis",
    "disease": "Liver Cirrhosis",
    "category": "Gastroenterology",
    "tests": [
      {
        "name": "Albumin",
        "normalValue": "3.5-5.0 g/dL",
        "conditionValue": "< 3.5 g/dL",
        "clinicalSignificance": "Poor synthetic function."
      },
      {
        "name": "PT/INR",
        "normalValue": "1.0",
        "conditionValue": "Prolonged (INR > 1.2)",
        "clinicalSignificance": "Failure to make clotting factors."
      },
      {
        "name": "Platelets",
        "normalValue": "150-450 x 10^3",
        "conditionValue": "< 150 x 10^3",
        "clinicalSignificance": "Portal hypertension/splenomegaly."
      }
    ]
  },
  {
    "id": "cdiff",
    "disease": "C. Difficile Colitis",
    "category": "Gastroenterology",
    "tests": [
      {
        "name": "Stool C. diff Toxin PCR",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Confirms toxigenic strain."
      },
      {
        "name": "WBC Count",
        "normalValue": "4.5-11.0",
        "conditionValue": "> 15.0",
        "clinicalSignificance": "Leukocytosis is common and severe."
      }
    ]
  },
  {
    "id": "ibd",
    "disease": "Inflammatory Bowel Disease",
    "category": "Gastroenterology",
    "tests": [
      {
        "name": "Fecal Calprotectin",
        "normalValue": "< 50 µg/g",
        "conditionValue": "> 150 µg/g",
        "clinicalSignificance": "Highly sensitive for bowel inflammation."
      },
      {
        "name": "Colonoscopy",
        "normalValue": "Normal mucosa",
        "conditionValue": "Ulcerations / Cobblestoning",
        "clinicalSignificance": "Definitive diagnosis."
      }
    ]
  },
  {
    "id": "aki",
    "disease": "Acute Kidney Injury",
    "category": "Nephrology",
    "tests": [
      {
        "name": "Creatinine",
        "normalValue": "Baseline",
        "conditionValue": "Increase by 0.3 or 1.5x",
        "clinicalSignificance": "Defines AKI."
      },
      {
        "name": "FENa",
        "normalValue": "1-2%",
        "conditionValue": "< 1% (Prerenal) or > 2% (ATN)",
        "clinicalSignificance": "Determines etiology."
      }
    ]
  },
  {
    "id": "ckd",
    "disease": "Chronic Kidney Disease",
    "category": "Nephrology",
    "tests": [
      {
        "name": "eGFR",
        "normalValue": "> 90",
        "conditionValue": "< 60 for >3 months",
        "clinicalSignificance": "Diagnostic."
      },
      {
        "name": "Urine ACR",
        "normalValue": "< 30 mg/g",
        "conditionValue": "> 30 mg/g",
        "clinicalSignificance": "Albuminuria."
      }
    ]
  },
  {
    "id": "nephrotic",
    "disease": "Nephrotic Syndrome",
    "category": "Nephrology",
    "tests": [
      {
        "name": "24-hr Urine Protein",
        "normalValue": "< 150 mg",
        "conditionValue": "> 3.5 g",
        "clinicalSignificance": "Massive proteinuria."
      },
      {
        "name": "Serum Albumin",
        "normalValue": "3.5-5.0",
        "conditionValue": "< 3.0",
        "clinicalSignificance": "Hypoalbuminemia."
      },
      {
        "name": "Lipid Panel",
        "normalValue": "Normal",
        "conditionValue": "Elevated Cholesterol",
        "clinicalSignificance": "Hyperlipidemia."
      }
    ]
  },
  {
    "id": "ida",
    "disease": "Iron Deficiency Anemia",
    "category": "Hematology",
    "tests": [
      {
        "name": "Ferritin",
        "normalValue": "12-300 ng/mL",
        "conditionValue": "< 15 ng/mL",
        "clinicalSignificance": "Depleted iron stores."
      },
      {
        "name": "TIBC",
        "normalValue": "250-450",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Increased binding capacity."
      }
    ]
  },
  {
    "id": "dic",
    "disease": "Disseminated Intravascular Coagulation",
    "category": "Hematology",
    "tests": [
      {
        "name": "D-Dimer",
        "normalValue": "< 0.5",
        "conditionValue": "Significantly Elevated",
        "clinicalSignificance": "Fibrin degradation."
      },
      {
        "name": "Fibrinogen",
        "normalValue": "200-400",
        "conditionValue": "< 100",
        "clinicalSignificance": "Consumed factors."
      }
    ]
  },
  {
    "id": "tls",
    "disease": "Tumor Lysis Syndrome",
    "category": "Oncology",
    "tests": [
      {
        "name": "Uric Acid",
        "normalValue": "< 7.2 mg/dL",
        "conditionValue": "> 8.0 mg/dL",
        "clinicalSignificance": "DNA breakdown."
      },
      {
        "name": "Potassium",
        "normalValue": "3.5-5.0",
        "conditionValue": "> 6.0 mEq/L",
        "clinicalSignificance": "Cellular release."
      },
      {
        "name": "Phosphorus",
        "normalValue": "2.5-4.5",
        "conditionValue": "> 4.5 mg/dL",
        "clinicalSignificance": "Hyperphosphatemia."
      }
    ]
  },
  {
    "id": "sepsis",
    "disease": "Sepsis",
    "category": "Infectious Disease",
    "tests": [
      {
        "name": "Lactate",
        "normalValue": "0.5-1.0 mmol/L",
        "conditionValue": "> 2.0 mmol/L",
        "clinicalSignificance": "Tissue hypoperfusion."
      },
      {
        "name": "Blood Cultures",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Must be drawn before antibiotics."
      }
    ]
  },
  {
    "id": "hiv",
    "disease": "HIV/AIDS",
    "category": "Infectious Disease",
    "tests": [
      {
        "name": "HIV 4th Gen Ag/Ab",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Screening and diagnosis."
      },
      {
        "name": "CD4 Count",
        "normalValue": "500-1500 cells",
        "conditionValue": "< 200 cells",
        "clinicalSignificance": "Defines AIDS."
      }
    ]
  },
  {
    "id": "syphilis",
    "disease": "Syphilis",
    "category": "Infectious Disease",
    "tests": [
      {
        "name": "RPR / VDRL",
        "normalValue": "Non-reactive",
        "conditionValue": "Reactive",
        "clinicalSignificance": "Screening (non-treponemal)."
      },
      {
        "name": "FTA-ABS",
        "normalValue": "Non-reactive",
        "conditionValue": "Reactive",
        "clinicalSignificance": "Confirmatory (treponemal)."
      }
    ]
  },
  {
    "id": "lyme",
    "disease": "Lyme Disease",
    "category": "Infectious Disease",
    "tests": [
      {
        "name": "Lyme ELISA",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Initial screening."
      },
      {
        "name": "Western Blot",
        "normalValue": "Negative",
        "conditionValue": "Positive bands",
        "clinicalSignificance": "Confirmatory test."
      }
    ]
  },
  {
    "id": "ra",
    "disease": "Rheumatoid Arthritis",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "Anti-CCP",
        "normalValue": "< 20",
        "conditionValue": "Positive",
        "clinicalSignificance": "Highly specific for RA."
      },
      {
        "name": "Rheumatoid Factor",
        "normalValue": "< 14",
        "conditionValue": "Positive",
        "clinicalSignificance": "Sensitive but not specific."
      }
    ]
  },
  {
    "id": "sle",
    "disease": "Systemic Lupus Erythematosus",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "ANA",
        "normalValue": "Negative",
        "conditionValue": "Positive (>1:80)",
        "clinicalSignificance": "High sensitivity."
      },
      {
        "name": "Anti-dsDNA",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "High specificity, correlates with flares."
      }
    ]
  },
  {
    "id": "gout",
    "disease": "Gout",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "Synovial Fluid",
        "normalValue": "Clear",
        "conditionValue": "Negative birefringent needles",
        "clinicalSignificance": "Gold standard."
      },
      {
        "name": "Uric Acid",
        "normalValue": "< 7.2",
        "conditionValue": "> 6.8",
        "clinicalSignificance": "Hyperuricemia."
      }
    ]
  }
]
  }, { status: 200 });
};
