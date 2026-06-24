import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fields = [
  {
    name: "Cardiology",
    topics: ["Hypertension", "Heart Failure", "Atrial Fibrillation", "Myocardial Infarction", "Stable Angina", "Valvular Disease", "Dyslipidemia", "Aortic Aneurysm", "Endocarditis", "Pericarditis", "Hypertrophic Cardiomyopathy", "Peripheral Arterial Disease", "Cardiogenic Shock", "Pulmonary Hypertension", "Syncope", "Ventricular Arrhythmias", "Pacemaker Indications", "Aortic Dissection", "DVT Prophylaxis", "Myocarditis", "Congenital Heart Disease in Adults", "Cardio-Oncology", "Sports Cardiology"]
  },
  {
    name: "Pulmonology",
    topics: ["Asthma", "COPD", "Pneumonia", "Pulmonary Embolism", "Tuberculosis", "Lung Cancer Screening", "Interstitial Lung Disease", "Obstructive Sleep Apnea", "ARDS", "Cystic Fibrosis", "Bronchiectasis", "Pleural Effusion", "Pneumothorax", "Sarcoidosis", "Pulmonary Hypertension", "Occupational Lung Disease", "Alpha-1 Antitrypsin Deficiency", "Pulmonary Fibrosis", "Non-TB Mycobacteria", "Solitary Pulmonary Nodule"]
  },
  {
    name: "Neurology",
    topics: ["Ischemic Stroke", "Hemorrhagic Stroke", "Migraine", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease", "Alzheimer's Disease", "Myasthenia Gravis", "Guillain-Barre Syndrome", "ALS", "Peripheral Neuropathy", "Status Epilepticus", "Subarachnoid Hemorrhage", "Concussion", "Meningitis", "Encephalitis", "Trigeminal Neuralgia", "Restless Legs Syndrome", "Essential Tremor", "Brain Tumors", "Tourette Syndrome", "Huntington's Disease"]
  },
  {
    name: "Endocrinology",
    topics: ["Type 2 Diabetes", "Type 1 Diabetes", "Hypothyroidism", "Hyperthyroidism", "Osteoporosis", "PCOS", "Addison's Disease", "Cushing's Syndrome", "Hyperparathyroidism", "Hypoparathyroidism", "Prolactinoma", "Acromegaly", "Diabetes Insipidus", "Pheochromocytoma", "Primary Aldosteronism", "Thyroid Nodules", "Thyroid Cancer", "Congenital Adrenal Hyperplasia", "Obesity Management", "Male Hypogonadism", "Turner Syndrome"]
  },
  {
    name: "Gastroenterology",
    topics: ["GERD", "Peptic Ulcer Disease", "Crohn's Disease", "Ulcerative Colitis", "Irritable Bowel Syndrome", "Celiac Disease", "Hepatitis C", "Hepatitis B", "Cirrhosis", "Acute Pancreatitis", "Chronic Pancreatitis", "Gallstones", "Colorectal Cancer Screening", "Barrett's Esophagus", "Eosinophilic Esophagitis", "C. diff Infection", "Gastroparesis", "Nonalcoholic Fatty Liver Disease (NAFLD)", "Primary Biliary Cholangitis", "Hemochromatosis", "Wilson Disease"]
  },
  {
    name: "Nephrology",
    topics: ["Chronic Kidney Disease", "Acute Kidney Injury", "Nephrotic Syndrome", "Nephritic Syndrome", "IgA Nephropathy", "Polycystic Kidney Disease", "Kidney Stones", "Hyponatremia", "Hyperkalemia", "Metabolic Acidosis", "Lupus Nephritis", "Goodpasture Syndrome", "Alport Syndrome", "Renal Artery Stenosis", "Renal Cell Carcinoma", "Dialysis Initiation", "Kidney Transplant Protocol", "Hypokalemia", "Hypercalcemia", "Diabetes Insipidus"]
  },
  {
    name: "Oncology",
    topics: ["Breast Cancer", "Lung Cancer", "Colorectal Cancer", "Prostate Cancer", "Melanoma", "Pancreatic Cancer", "Ovarian Cancer", "Cervical Cancer", "Hodgkin Lymphoma", "Non-Hodgkin Lymphoma", "Multiple Myeloma", "CML", "CLL", "AML", "ALL", "Testicular Cancer", "Thyroid Cancer", "Gastric Cancer", "Hepatocellular Carcinoma", "Renal Cell Carcinoma", "Sarcoma", "Brain Tumors", "Palliative Care"]
  },
  {
    name: "Pediatrics",
    topics: ["Asthma in Children", "Otitis Media", "ADHD", "Autism Spectrum Disorder", "Febrile Seizures", "UTI in Children", "Croup", "Bronchiolitis", "Gastroenteritis", "Childhood Obesity", "Type 1 Diabetes", "Celiac Disease in Children", "Neonatal Jaundice", "Sepsis in Neonates", "Congenital Heart Defects", "Cystic Fibrosis", "Sickle Cell Disease", "Lead Poisoning", "Immunization Schedule", "Child Abuse Recognition"]
  },
  {
    name: "Obstetrics/Gynecology",
    topics: ["Prenatal Care", "Gestational Diabetes", "Preeclampsia", "Ectopic Pregnancy", "Endometriosis", "PCOS", "Cervical Cancer Screening", "Breast Cancer Screening", "Menopause Management", "Pelvic Inflammatory Disease", "Uterine Fibroids", "Ovarian Cysts", "Contraception", "Infertility", "Vaginitis", "Postpartum Depression", "Placenta Previa", "Placental Abruption", "Preterm Labor", "Rh Incompatibility", "Gestational Hypertension"]
  },
  {
    name: "Infectious Diseases",
    topics: ["Sepsis", "HIV/AIDS", "Tuberculosis", "COVID-19", "Influenza", "Community-Acquired Pneumonia", "Urinary Tract Infections", "Cellulitis", "Osteomyelitis", "Endocarditis", "Meningitis", "Lyme Disease", "Syphilis", "Gonorrhea", "Chlamydia", "Herpes Simplex", "Malaria", "C. diff Infection", "MRSA Infections", "Hepatitis C", "Hepatitis B", "Rabies Prophylaxis"]
  }
];

function generateDetailedMarkdown(topic: string, org: string, specialty: string, year: number) {
  return `
# Executive Summary
The updated ${year} **${org} Clinical Practice Guidelines for ${topic}** provide a comprehensive framework for the diagnosis, evaluation, and evidence-based management of patients. The goal is to optimize clinical outcomes, reduce morbidity and mortality, and standardize therapeutic approaches across healthcare settings.

These recommendations represent a consensus of expert panels based on rigorous systematic reviews of recent randomized controlled trials and cohort studies.

---

### 1. Etiology and Pathophysiology
The underlying mechanisms driving **${topic}** are multifactorial. Clinical manifestation depends largely on the progression of the disease and individual patient risk factors.

*   **Primary Drivers:** Genetic predisposition, environmental factors, and age-related physiological changes.
*   **Pathological Cascade:** Progression is often marked by inflammatory markers, cellular degradation, or acute systemic failure depending on the chronicity of the presentation.
*   **Risk Factors:** Advanced age, family history, sedentary lifestyle, and concomitant comorbidities.

> **Clinical Pearl:** Early identification of these pathophysiological markers can significantly alter the trajectory of the disease, allowing for targeted preemptive interventions.

---

### 2. Diagnostic Workup and Criteria
Accurate diagnosis relies on a combination of clinical history, physical examination, and objective investigative modalities. The ${org} recommends the following structured diagnostic approach:

#### 2.1 Standard Laboratory Investigations
| Test Category | Specific Marker / Assay | Clinical Utility |
| :--- | :--- | :--- |
| **First-Line Labs** | CBC, CMP, CRP/ESR | Baseline metabolic and inflammatory assessment |
| **Disease-Specific** | Autoantibodies, Biomarkers | Confirmatory testing for ${topic} |
| **Monitoring** | Renal & Hepatic Function | Clearance evaluation before starting aggressive pharmacotherapy |

#### 2.2 Imaging and Procedural Diagnostics
Depending on severity, consider:
*   **Ultrasound/X-Ray:** For initial, non-invasive screening.
*   **CT/MRI (with or without contrast):** If structural anomalies or severe pathological progression is suspected.
*   **Biopsy / Endoscopy / Specialized Scans:** Indicated only in refractory cases or when gold-standard confirmation is strictly necessary.

#### 2.3 Diagnostic Criteria (Major and Minor)
Diagnosis requires **at least TWO major criteria** OR **ONE major and TWO minor criteria**.
*   **Major Criteria:** Definitive imaging evidence, specific histological findings, or pathognomonic clinical signs.
*   **Minor Criteria:** Non-specific systemic symptoms, mild laboratory derangements, or borderline physiological changes.

---

### 3. Treatment Algorithm and Management
Management of **${topic}** follows a tiered approach based on disease severity (Mild, Moderate, Severe).

#### 3.1 Non-Pharmacological Interventions
Always initiate lifestyle and non-pharmacological interventions as the foundation of therapy:
*   Dietary modifications and medical nutrition therapy.
*   Supervised physical rehabilitation or activity pacing.
*   Cessation of smoking, alcohol limitation, and strict adherence to hygiene/preventative protocols.

#### 3.2 Pharmacotherapy (First-Line and Alternative)
The cornerstone of medical management. All dosages must be adjusted for renal/hepatic impairment.

1.  **First-Line Agents:** 
    *   *Drug Class A:* Start at lowest effective dose and titrate every 2-4 weeks.
    *   *Mechanism:* Directly antagonizes the primary pathophysiological driver.
    *   *Contraindications:* Severe renal impairment, pregnancy (Category D/X).
2.  **Second-Line / Adjunct Therapy:** 
    *   *Drug Class B:* Add if targets are not achieved within 3 months.
    *   *Mechanism:* Synergistic effect with first-line agents.
3.  **Rescue / Acute Management:** 
    *   For acute exacerbations of ${topic}, consider rapid-acting intravenous therapies, systemic corticosteroids, or immediate surgical consultation.

> **WARNING:** Avoid polypharmacy where drug-drug interactions (e.g., CYP450 inhibitors) may increase the risk of toxicity. Always consult the latest interaction database.

---

### 4. Patient Follow-up and Prognosis
Close monitoring is required to ensure therapeutic efficacy and to mitigate adverse events.

*   **Initial Follow-up:** 2 to 4 weeks post-initiation of therapy.
*   **Long-term Monitoring:** Every 3 to 6 months. Include repeat of baseline labs and quality-of-life assessments.
*   **Referral Triggers:** Immediate referral to a ${specialty} sub-specialist is warranted if the patient develops refractory symptoms, severe adverse drug reactions, or rapid clinical deterioration.

---

### 5. References and Evidence Base
1. ${org} Task Force on ${topic}. ( ${year} ). *Clinical Practice Guidelines for the Management of ${topic}*. Journal of ${specialty} Medicine.
2. National Institutes of Health. ( ${year-1} ). *Systematic Review and Meta-Analysis of Therapeutic Outcomes*.
3. World Health Organization (WHO) protocols on global standardization of care.
`;
}

export async function GET() {
  try {
    let idCounter = 1;
    const guidelinesToInsert = [];
    
    for (const field of fields) {
      for (let i = 0; i < field.topics.length; i++) {
        const topic = field.topics[i];
        let org = ["AHA/ACC", "ADA", "KDIGO", "WHO", "NICE", "AAP", "ACOG", "ASCO", "IDSA", "AGA"][Math.floor(Math.random() * 10)];
        if(field.name === "Cardiology") org = "AHA/ACC";
        if(field.name === "Endocrinology") org = "ADA/AACE";
        if(field.name === "Nephrology") org = "KDIGO";
        if(field.name === "Pediatrics") org = "AAP";
        if(field.name === "Obstetrics/Gynecology") org = "ACOG";
        if(field.name === "Oncology") org = "ASCO/NCCN";
        if(field.name === "Infectious Diseases") org = "IDSA";
        if(field.name === "Gastroenterology") org = "AGA/ACG";
        
        const year = 2020 + Math.floor(Math.random() * 5);
        const description = `The updated ${year} ${org} Clinical Practice Guidelines for ${topic} providing a comprehensive framework for evaluation, diagnosis, and evidence-based management.`;
        
        const detailedContent = generateDetailedMarkdown(topic, org, field.name, year);
        
        guidelinesToInsert.push({
          id: `gl_${idCounter++}`,
          title: `${org} Guidelines for ${topic}`,
          specialty: field.name,
          version: year.toString(),
          description: description,
          content: detailedContent
        });
      }
    }
  
    await prisma.savedGuideline.deleteMany();
    await prisma.guideline.deleteMany();
    
    await prisma.guideline.createMany({
      data: guidelinesToInsert
    });
  
    return NextResponse.json({ message: "Seeded " + guidelinesToInsert.length + " highly detailed guidelines successfully." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
