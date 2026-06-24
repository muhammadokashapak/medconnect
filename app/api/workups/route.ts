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
        "clinicalSignificance": "Primary biomarker for myocardial necrosis. Elevated levels indicate heart muscle damage."
      },
      {
        "name": "CK-MB",
        "normalValue": "0-3 ng/mL",
        "conditionValue": "> 3 ng/mL",
        "clinicalSignificance": "Useful for detecting reinfarction, peaks earlier than troponin."
      },
      {
        "name": "Myoglobin",
        "normalValue": "0-85 ng/mL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Early marker of muscle damage, but lacks cardiac specificity."
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
        "clinicalSignificance": "Confirms heart failure vs pulmonary causes of dyspnea. Higher levels correlate with severity."
      },
      {
        "name": "NT-proBNP",
        "normalValue": "< 300 pg/mL",
        "conditionValue": "> 900 pg/mL",
        "clinicalSignificance": "Similar to BNP but with longer half-life."
      },
      {
        "name": "Creatinine",
        "normalValue": "0.6-1.2 mg/dL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Check for cardiorenal syndrome."
      }
    ]
  },
  {
    "id": "afib",
    "disease": "Atrial Fibrillation",
    "category": "Cardiology",
    "tests": [
      {
        "name": "TSH",
        "normalValue": "0.4-4.0 mIU/L",
        "conditionValue": "< 0.4 mIU/L",
        "clinicalSignificance": "Hyperthyroidism is a reversible cause of A-Fib."
      },
      {
        "name": "Potassium (K)",
        "normalValue": "3.5-5.0 mEq/L",
        "conditionValue": "Low/High",
        "clinicalSignificance": "Electrolyte imbalances can trigger arrhythmias."
      },
      {
        "name": "Magnesium (Mg)",
        "normalValue": "1.7-2.2 mg/dL",
        "conditionValue": "< 1.7 mg/dL",
        "clinicalSignificance": "Hypomagnesemia often accompanies A-Fib."
      }
    ]
  },
  {
    "id": "htn",
    "disease": "Hypertension (Primary)",
    "category": "Cardiology",
    "tests": [
      {
        "name": "Lipid Panel (LDL)",
        "normalValue": "< 100 mg/dL",
        "conditionValue": "> 130 mg/dL",
        "clinicalSignificance": "Assess overall cardiovascular risk."
      },
      {
        "name": "eGFR",
        "normalValue": "> 90 mL/min",
        "conditionValue": "< 60 mL/min",
        "clinicalSignificance": "Check for hypertensive nephropathy."
      },
      {
        "name": "Fasting Glucose",
        "normalValue": "< 100 mg/dL",
        "conditionValue": "> 126 mg/dL",
        "clinicalSignificance": "Assess for metabolic syndrome / Diabetes."
      }
    ]
  },
  {
    "id": "copd",
    "disease": "COPD Exacerbation",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "pCO2 (ABG)",
        "normalValue": "35-45 mmHg",
        "conditionValue": "> 45 mmHg",
        "clinicalSignificance": "Indicates hypercapnic respiratory failure."
      },
      {
        "name": "pH (ABG)",
        "normalValue": "7.35-7.45",
        "conditionValue": "< 7.35",
        "clinicalSignificance": "Shows respiratory acidosis requiring possible BiPAP."
      },
      {
        "name": "WBC Count",
        "normalValue": "4.5-11.0 x 10^3/µL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Indicates infectious trigger for exacerbation."
      }
    ]
  },
  {
    "id": "pe",
    "disease": "Pulmonary Embolism",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "D-Dimer",
        "normalValue": "< 0.5 µg/mL FEU",
        "conditionValue": "> 0.5 µg/mL FEU",
        "clinicalSignificance": "High sensitivity, low specificity. Used to rule out PE in low-risk patients."
      },
      {
        "name": "pO2 (ABG)",
        "normalValue": "80-100 mmHg",
        "conditionValue": "< 80 mmHg",
        "clinicalSignificance": "Hypoxemia due to V/Q mismatch."
      },
      {
        "name": "Troponin",
        "normalValue": "< 0.04 ng/mL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Indicates right ventricular strain."
      }
    ]
  },
  {
    "id": "pneumonia",
    "disease": "Community-Acquired Pneumonia",
    "category": "Pulmonology",
    "tests": [
      {
        "name": "Procalcitonin",
        "normalValue": "< 0.15 ng/mL",
        "conditionValue": "> 0.25 ng/mL",
        "clinicalSignificance": "Helps differentiate bacterial from viral pneumonia and guides antibiotic therapy."
      },
      {
        "name": "WBC Count",
        "normalValue": "4.5-11.0 x 10^3/µL",
        "conditionValue": "> 11.0 x 10^3/µL",
        "clinicalSignificance": "Leukocytosis with left shift suggests bacterial infection."
      },
      {
        "name": "CRP",
        "normalValue": "< 10 mg/L",
        "conditionValue": "> 50 mg/L",
        "clinicalSignificance": "Nonspecific marker of severe inflammation."
      }
    ]
  },
  {
    "id": "dm2",
    "disease": "Diabetes Mellitus Type 2",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "Fasting Plasma Glucose",
        "normalValue": "< 100 mg/dL",
        "conditionValue": "≥ 126 mg/dL",
        "clinicalSignificance": "Diagnostic for Diabetes when confirmed on two separate occasions."
      },
      {
        "name": "Hemoglobin A1c",
        "normalValue": "< 5.7%",
        "conditionValue": "≥ 6.5%",
        "clinicalSignificance": "Reflects average glucose over 3 months. Diagnostic for Diabetes."
      },
      {
        "name": "Urine Microalbumin",
        "normalValue": "< 30 mg/g",
        "conditionValue": "> 30 mg/g",
        "clinicalSignificance": "Early indicator of diabetic nephropathy."
      }
    ]
  },
  {
    "id": "dka",
    "disease": "Diabetic Ketoacidosis (DKA)",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "Blood Glucose",
        "normalValue": "70-99 mg/dL",
        "conditionValue": "> 250 mg/dL",
        "clinicalSignificance": "Hallmark of DKA."
      },
      {
        "name": "Beta-Hydroxybutyrate",
        "normalValue": "< 0.4 mmol/L",
        "conditionValue": "> 3.0 mmol/L",
        "clinicalSignificance": "Directly measures ketones in blood. More accurate than urine ketones."
      },
      {
        "name": "Anion Gap",
        "normalValue": "8-12 mEq/L",
        "conditionValue": "> 12 mEq/L",
        "clinicalSignificance": "Indicates high anion gap metabolic acidosis."
      },
      {
        "name": "pH (ABG)",
        "normalValue": "7.35-7.45",
        "conditionValue": "< 7.30",
        "clinicalSignificance": "Severity of acidemia."
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
        "clinicalSignificance": "Primary screening test. High TSH indicates primary hypothyroidism."
      },
      {
        "name": "Free T4",
        "normalValue": "0.8-1.8 ng/dL",
        "conditionValue": "< 0.8 ng/dL",
        "clinicalSignificance": "Confirms overt hypothyroidism when TSH is high."
      },
      {
        "name": "Anti-TPO Antibodies",
        "normalValue": "< 9 IU/mL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Confirms Hashimoto's thyroiditis as the autoimmune cause."
      }
    ]
  },
  {
    "id": "hyperthyroid",
    "disease": "Hyperthyroidism",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "TSH",
        "normalValue": "0.4-4.0 mIU/L",
        "conditionValue": "< 0.1 mIU/L",
        "clinicalSignificance": "Suppressed TSH is the hallmark of primary hyperthyroidism."
      },
      {
        "name": "Free T4",
        "normalValue": "0.8-1.8 ng/dL",
        "conditionValue": "> 1.8 ng/dL",
        "clinicalSignificance": "Elevated levels confirm diagnosis."
      },
      {
        "name": "TSI (Thyroid Stimulating Immunoglobulin)",
        "normalValue": "< 130%",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Diagnostic for Graves' Disease."
      }
    ]
  },
  {
    "id": "ckd",
    "disease": "Chronic Kidney Disease (CKD)",
    "category": "Nephrology",
    "tests": [
      {
        "name": "eGFR",
        "normalValue": "> 90 mL/min",
        "conditionValue": "< 60 mL/min",
        "clinicalSignificance": "For >3 months, indicates CKD. Staging depends on exact value."
      },
      {
        "name": "Creatinine",
        "normalValue": "0.6-1.2 mg/dL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Waste product accumulating due to poor filtration."
      },
      {
        "name": "Phosphorus",
        "normalValue": "2.5-4.5 mg/dL",
        "conditionValue": "> 4.5 mg/dL",
        "clinicalSignificance": "Hyperphosphatemia common in advanced CKD."
      },
      {
        "name": "PTH",
        "normalValue": "15-65 pg/mL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Secondary hyperparathyroidism due to CKD-MBD."
      }
    ]
  },
  {
    "id": "aki",
    "disease": "Acute Kidney Injury (AKI)",
    "category": "Nephrology",
    "tests": [
      {
        "name": "Creatinine",
        "normalValue": "Baseline",
        "conditionValue": "Increase by ≥0.3 mg/dL or 1.5x baseline",
        "clinicalSignificance": "Defines the AKI event."
      },
      {
        "name": "BUN/Cr Ratio",
        "normalValue": "10-20:1",
        "conditionValue": "> 20:1",
        "clinicalSignificance": "Suggests pre-renal etiology (e.g. dehydration, heart failure)."
      },
      {
        "name": "FENa (Fractional Excretion of Sodium)",
        "normalValue": "1-2%",
        "conditionValue": "< 1%",
        "clinicalSignificance": "Pre-renal cause. If >2%, suggests ATN."
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
        "clinicalSignificance": "Indicates impaired synthetic function of the liver."
      },
      {
        "name": "Prothrombin Time (PT/INR)",
        "normalValue": "INR ~1.0",
        "conditionValue": "Prolonged (INR > 1.2)",
        "clinicalSignificance": "Liver fails to produce clotting factors."
      },
      {
        "name": "Total Bilirubin",
        "normalValue": "0.1-1.2 mg/dL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Impaired excretion capacity."
      },
      {
        "name": "Platelets",
        "normalValue": "150-450 x 10^3/µL",
        "conditionValue": "< 150 x 10^3/µL",
        "clinicalSignificance": "Thrombocytopenia due to portal hypertension/splenomegaly."
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
        "conditionValue": "> 3x upper limit of normal",
        "clinicalSignificance": "Highly sensitive and specific for acute pancreatitis."
      },
      {
        "name": "Amylase",
        "normalValue": "30-110 U/L",
        "conditionValue": "> 3x upper limit of normal",
        "clinicalSignificance": "Elevated but clears faster and is less specific than lipase."
      },
      {
        "name": "Triglycerides",
        "normalValue": "< 150 mg/dL",
        "conditionValue": "> 1000 mg/dL",
        "clinicalSignificance": "Check for hypertriglyceridemia as the etiology."
      }
    ]
  },
  {
    "id": "hepb",
    "disease": "Hepatitis B Infection",
    "category": "Gastroenterology",
    "tests": [
      {
        "name": "HBsAg (Surface Antigen)",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Indicates active infection (acute or chronic)."
      },
      {
        "name": "Anti-HBs",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Indicates immunity (via recovery or vaccination)."
      },
      {
        "name": "ALT",
        "normalValue": "7-56 U/L",
        "conditionValue": "Significantly Elevated",
        "clinicalSignificance": "Hepatocellular injury marker."
      }
    ]
  },
  {
    "id": "ida",
    "disease": "Iron Deficiency Anemia",
    "category": "Hematology",
    "tests": [
      {
        "name": "Hemoglobin",
        "normalValue": "Male: 13.5-17.5 / Female: 12.0-15.5 g/dL",
        "conditionValue": "Low",
        "clinicalSignificance": "Confirms anemia."
      },
      {
        "name": "MCV",
        "normalValue": "80-100 fL",
        "conditionValue": "< 80 fL",
        "clinicalSignificance": "Microcytic anemia."
      },
      {
        "name": "Ferritin",
        "normalValue": "12-300 ng/mL",
        "conditionValue": "< 15 ng/mL",
        "clinicalSignificance": "Most sensitive and specific test for iron deficiency."
      },
      {
        "name": "TIBC",
        "normalValue": "250-450 µg/dL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Liver produces more transferrin to maximize iron binding."
      }
    ]
  },
  {
    "id": "b12_deficiency",
    "disease": "Vitamin B12 Deficiency",
    "category": "Hematology",
    "tests": [
      {
        "name": "MCV",
        "normalValue": "80-100 fL",
        "conditionValue": "> 100 fL",
        "clinicalSignificance": "Macrocytic anemia."
      },
      {
        "name": "Vitamin B12",
        "normalValue": "200-900 pg/mL",
        "conditionValue": "< 200 pg/mL",
        "clinicalSignificance": "Confirms deficiency."
      },
      {
        "name": "Methylmalonic Acid (MMA)",
        "normalValue": "< 0.4 µmol/L",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Highly sensitive functional marker; elevated in B12 deficiency (normal in Folate deficiency)."
      }
    ]
  },
  {
    "id": "dic",
    "disease": "Disseminated Intravascular Coagulation",
    "category": "Hematology",
    "tests": [
      {
        "name": "Platelets",
        "normalValue": "150-450 x 10^3/µL",
        "conditionValue": "Low",
        "clinicalSignificance": "Consumption of platelets."
      },
      {
        "name": "D-Dimer",
        "normalValue": "< 0.5 µg/mL",
        "conditionValue": "Significantly Elevated",
        "clinicalSignificance": "Fibrin degradation products from widespread clotting."
      },
      {
        "name": "PT/aPTT",
        "normalValue": "Normal ranges",
        "conditionValue": "Prolonged",
        "clinicalSignificance": "Consumption of coagulation factors."
      },
      {
        "name": "Fibrinogen",
        "normalValue": "200-400 mg/dL",
        "conditionValue": "< 100 mg/dL",
        "clinicalSignificance": "Depleted due to rampant clot formation."
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
        "clinicalSignificance": "Indicates tissue hypoperfusion/anaerobic metabolism. Guides resuscitation."
      },
      {
        "name": "WBC Count",
        "normalValue": "4.5-11.0 x 10^3/µL",
        "conditionValue": "> 12.0 or < 4.0 x 10^3/µL",
        "clinicalSignificance": "SIRS criteria. Leukocytosis or leukopenia."
      },
      {
        "name": "Procalcitonin",
        "normalValue": "< 0.15 ng/mL",
        "conditionValue": "> 2.0 ng/mL",
        "clinicalSignificance": "High risk of severe bacterial sepsis."
      },
      {
        "name": "Blood Cultures",
        "normalValue": "No growth",
        "conditionValue": "Positive",
        "clinicalSignificance": "Identify the causative organism for targeted antibiotics."
      }
    ]
  },
  {
    "id": "uti",
    "disease": "Urinary Tract Infection",
    "category": "Infectious Disease",
    "tests": [
      {
        "name": "Urinalysis - Nitrites",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Specific for Gram-negative bacteria (e.g., E. coli)."
      },
      {
        "name": "Urinalysis - Leukocyte Esterase",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Indicates presence of white blood cells (pyuria)."
      },
      {
        "name": "Urine Culture",
        "normalValue": "No growth",
        "conditionValue": "> 10^5 CFU/mL",
        "clinicalSignificance": "Confirms diagnosis and provides susceptibilities."
      }
    ]
  },
  {
    "id": "ra",
    "disease": "Rheumatoid Arthritis",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "Rheumatoid Factor (RF)",
        "normalValue": "< 14 IU/mL",
        "conditionValue": "Positive",
        "clinicalSignificance": "Present in 70-80% of patients, but not highly specific."
      },
      {
        "name": "Anti-CCP Antibodies",
        "normalValue": "< 20 EU",
        "conditionValue": "Positive",
        "clinicalSignificance": "Highly specific (>90%) for RA. Appears early."
      },
      {
        "name": "ESR / CRP",
        "normalValue": "Normal",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Markers of systemic inflammation, correlates with disease activity."
      }
    ]
  },
  {
    "id": "lupus",
    "disease": "Systemic Lupus Erythematosus (SLE)",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "ANA (Antinuclear Antibody)",
        "normalValue": "Negative",
        "conditionValue": "Positive (Titer > 1:80)",
        "clinicalSignificance": "Highly sensitive. Best initial screening test."
      },
      {
        "name": "Anti-dsDNA",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Highly specific for SLE. Correlates with lupus nephritis and disease activity."
      },
      {
        "name": "Anti-Smith (Anti-Sm)",
        "normalValue": "Negative",
        "conditionValue": "Positive",
        "clinicalSignificance": "Highly specific, but lacks sensitivity (only in 20-30% of patients)."
      },
      {
        "name": "Complement C3 / C4",
        "normalValue": "Normal",
        "conditionValue": "Low",
        "clinicalSignificance": "Consumed during active flare-ups."
      }
    ]
  },
  {
    "id": "gout",
    "disease": "Gout",
    "category": "Rheumatology",
    "tests": [
      {
        "name": "Serum Uric Acid",
        "normalValue": "3.5-7.2 mg/dL",
        "conditionValue": "> 6.8 mg/dL",
        "clinicalSignificance": "Hyperuricemia supports diagnosis, but can be normal during an acute attack."
      },
      {
        "name": "Synovial Fluid Analysis",
        "normalValue": "Normal",
        "conditionValue": "Negatively birefringent needle-shaped crystals",
        "clinicalSignificance": "Gold standard diagnostic test."
      }
    ]
  },
  {
    "id": "ms",
    "disease": "Multiple Sclerosis",
    "category": "Neurology",
    "tests": [
      {
        "name": "CSF Oligoclonal Bands",
        "normalValue": "Absent",
        "conditionValue": "Present (≥2 bands)",
        "clinicalSignificance": "Suggests intrathecal IgG synthesis. Found in ~90% of MS patients."
      },
      {
        "name": "CSF IgG Index",
        "normalValue": "0.3-0.7",
        "conditionValue": "> 0.7",
        "clinicalSignificance": "Indicates elevated IgG production in the CNS."
      }
    ]
  },
  {
    "id": "meningitis",
    "disease": "Bacterial Meningitis",
    "category": "Neurology",
    "tests": [
      {
        "name": "CSF WBC Count",
        "normalValue": "0-5 cells/µL",
        "conditionValue": "> 1000 cells/µL (PMN predominant)",
        "clinicalSignificance": "Massive pleocytosis indicating bacterial infection."
      },
      {
        "name": "CSF Glucose",
        "normalValue": "50-80 mg/dL",
        "conditionValue": "< 40 mg/dL",
        "clinicalSignificance": "Bacteria consume glucose."
      },
      {
        "name": "CSF Protein",
        "normalValue": "15-45 mg/dL",
        "conditionValue": "> 100 mg/dL",
        "clinicalSignificance": "Elevated due to breakdown of blood-brain barrier."
      }
    ]
  },
  {
    "id": "hemorrhage",
    "disease": "Massive Hemorrhage / Shock",
    "category": "Emergency Medicine",
    "tests": [
      {
        "name": "Hemoglobin",
        "normalValue": "12-17.5 g/dL",
        "conditionValue": "< 7.0 g/dL",
        "clinicalSignificance": "Threshold typically used for blood transfusion trigger."
      },
      {
        "name": "Lactate",
        "normalValue": "0.5-1.0 mmol/L",
        "conditionValue": "> 4.0 mmol/L",
        "clinicalSignificance": "Severe hypoperfusion and shock."
      },
      {
        "name": "Fibrinogen",
        "normalValue": "200-400 mg/dL",
        "conditionValue": "< 150 mg/dL",
        "clinicalSignificance": "Monitor for coagulopathy of trauma. Trigger for cryoprecipitate."
      }
    ]
  },
  {
    "id": "osteoporosis",
    "disease": "Osteoporosis",
    "category": "Endocrinology",
    "tests": [
      {
        "name": "DEXA Scan T-Score",
        "normalValue": "> -1.0",
        "conditionValue": "≤ -2.5",
        "clinicalSignificance": "Diagnostic for Osteoporosis."
      },
      {
        "name": "Vitamin D (25-OH)",
        "normalValue": "30-100 ng/mL",
        "conditionValue": "< 20 ng/mL",
        "clinicalSignificance": "Deficiency exacerbates bone loss."
      },
      {
        "name": "Calcium",
        "normalValue": "8.5-10.2 mg/dL",
        "conditionValue": "Low/Normal",
        "clinicalSignificance": "Baseline check before initiating bisphosphonates."
      }
    ]
  },
  {
    "id": "pcos",
    "disease": "Polycystic Ovary Syndrome (PCOS)",
    "category": "Gynecology",
    "tests": [
      {
        "name": "Total Testosterone",
        "normalValue": "15-70 ng/dL",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Hyperandrogenism."
      },
      {
        "name": "LH/FSH Ratio",
        "normalValue": "1:1",
        "conditionValue": "> 2:1",
        "clinicalSignificance": "Classic finding in PCOS."
      },
      {
        "name": "Fasting Glucose / Insulin",
        "normalValue": "Normal",
        "conditionValue": "Elevated",
        "clinicalSignificance": "Check for insulin resistance."
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
        "conditionValue": "> 3x upper limit",
        "clinicalSignificance": "Highly sensitive screening test."
      },
      {
        "name": "Dexamethasone Suppression Test",
        "normalValue": "Suppression of Cortisol",
        "conditionValue": "Failure to suppress",
        "clinicalSignificance": "Confirms hypercortisolism."
      },
      {
        "name": "ACTH",
        "normalValue": "10-60 pg/mL",
        "conditionValue": "Low or High",
        "clinicalSignificance": "Differentiates ACTH-dependent (pituitary/ectopic) vs independent (adrenal)."
      }
    ]
  }
]
  }, { status: 200 });
};
