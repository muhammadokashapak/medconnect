import { prisma } from '../lib/prisma';

const guidelinesData = [
  {
    title: "Management of Hypertension in Adults (JNC 8)",
    specialty: "Cardiology",
    description: "Evidence-based guideline for the management of high blood pressure in adults.",
    content: "### Recommendations for BP Control:\n1. **General Population >= 60 years**:\n   - Initiate pharmacologic treatment to lower BP at SBP >= 150 mm Hg or DBP >= 90 mm Hg.\n   - Goal: SBP < 150 mm Hg and DBP < 90 mm Hg.\n2. **General Population < 60 years**:\n   - Initiate treatment at DBP >= 90 mm Hg (Goal: < 90 mm Hg).\n   - Initiate treatment at SBP >= 140 mm Hg (Goal: < 140 mm Hg).\n3. **Adults >= 18 years with CKD or Diabetes**:\n   - Goal SBP < 140 mm Hg and DBP < 90 mm Hg.\n\n### Initial Drugs of Choice:\n- Nonblack population (including diabetes): Thiazide diuretic, CCB, ACE inhibitor, or ARB.\n- Black population (including diabetes): Thiazide diuretic or CCB.\n- CKD population: ACE inhibitor or ARB to improve kidney outcomes.",
    version: "2014 v1"
  },
  {
    title: "Asthma Management Guidelines (GINA 2023)",
    specialty: "Pulmonology",
    description: "Global Initiative for Asthma strategy for asthma management and prevention.",
    content: "### Key Updates:\n1. SABA-only treatment is no longer recommended for adults and adolescents. ICS must be included to reduce risk of severe exacerbations.\n2. **Track 1 (Preferred)**: Low dose ICS-formoterol as the reliever (MART - Maintenance and Reliever Therapy).\n3. **Track 2 (Alternative)**: SABA as reliever, but patient MUST be on a maintenance ICS.\n\n### Steps of Treatment (Track 1):\n- **Steps 1 & 2**: As-needed low dose ICS-formoterol.\n- **Step 3**: Maintenance and reliever low dose ICS-formoterol.\n- **Step 4**: Maintenance and reliever medium dose ICS-formoterol.\n- **Step 5**: Add-on LAMA, refer for phenotypic assessment +/- biologic therapy.",
    version: "2023 Update"
  },
  {
    title: "Type 2 Diabetes Management (ADA 2024)",
    specialty: "Endocrinology",
    description: "American Diabetes Association Standards of Care for Type 2 Diabetes.",
    content: "### Glycemic Targets:\n- **A1C**: < 7.0% for many nonpregnant adults.\n- **Preprandial capillary plasma glucose**: 80-130 mg/dL.\n- **Peak postprandial capillary plasma glucose**: < 180 mg/dL.\n\n### Pharmacologic Therapy:\n1. **First-line therapy**: Metformin and comprehensive lifestyle modifications.\n2. **Patients with ASCVD or high risk**: GLP-1 receptor agonist or SGLT2 inhibitor with proven cardiovascular benefit.\n3. **Patients with Heart Failure or CKD**: SGLT2 inhibitor with proven benefit.\n4. **Weight Management**: Emphasize GLP-1 RA or GIP/GLP-1 RA for high efficacy in weight loss (e.g., Semaglutide, Tirzepatide).",
    version: "2024 Standards"
  },
  {
    title: "Basic Life Support (AHA Guidelines)",
    specialty: "Emergency Medicine",
    description: "AHA Guidelines for CPR and ECC in adults.",
    content: "### Sequence: C-A-B (Compressions, Airway, Breathing)\n\n1. **Recognize emergency**: Check for responsiveness and no breathing or abnormal breathing (gasping).\n2. **Call for help**: Activate emergency response system and get AED.\n3. **Chest Compressions**:\n   - Rate: 100-120 compressions per minute.\n   - Depth: At least 2 inches (5 cm), no more than 2.4 inches (6 cm).\n   - Allow complete chest recoil after each compression.\n   - Minimize interruptions (limit to < 10 seconds).\n4. **Airway & Breathing**:\n   - Open airway using head tilt-chin lift.\n   - Compression to ventilation ratio: 30:2.\n5. **Defibrillation**:\n   - Use AED as soon as available. Follow prompts.",
    version: "2020 Update"
  },
  {
    title: "Acute Stroke Management (AHA/ASA)",
    specialty: "Neurology",
    description: "Early management of patients with acute ischemic stroke.",
    content: "### Time is Brain\n- Evaluation by physician < 10 mins.\n- Stroke team < 15 mins.\n- CT scan < 25 mins.\n- Interpretation of CT < 45 mins.\n- Thrombolytic therapy < 60 mins from arrival.\n\n### IV Alteplase (tPA) Criteria:\n- Diagnosis of ischemic stroke causing measurable neurologic deficit.\n- Onset of symptoms < 4.5 hours before beginning treatment.\n- Age >= 18 years.\n- **Contraindications**: Severe head trauma in past 3 months, history of intracranial hemorrhage, active internal bleeding, uncontrolled hypertension (SBP > 185 or DBP > 110 mm Hg), platelet count < 100,000, current use of DOACs or therapeutic heparin.\n\n### Mechanical Thrombectomy:\n- Indicated for LVO (Large Vessel Occlusion) up to 24 hours in selected patients based on perfusion imaging (DAWN/DEFUSE 3 criteria).",
    version: "2019 Update"
  },
  {
    title: "Management of GERD (ACG 2022)",
    specialty: "Gastroenterology",
    description: "Diagnosis and management of Gastroesophageal Reflux Disease.",
    content: "### Diagnosis:\n- Presumptive diagnosis established by typical symptoms (heartburn, regurgitation).\n- Empiric PPI trial is recommended for classic symptoms.\n- Endoscopy reserved for alarm symptoms (dysphagia, weight loss, bleeding) or non-responders.\n\n### Management:\n- **8-week trial of PPI** once daily before a meal.\n- Maintenance therapy for patients with severe esophagitis or Barrett's esophagus.\n- Lifestyle: Weight loss, elevating head of bed, avoiding late meals.",
    version: "2022 Guidelines"
  },
  {
    title: "Peptic Ulcer Disease & H. Pylori (ACG)",
    specialty: "Gastroenterology",
    description: "Treatment of Helicobacter pylori infection.",
    content: "### Indications for Testing:\n- Active PUD, history of PUD, gastric MALT lymphoma, uninvestigated dyspepsia.\n\n### Treatment Regimens:\n1. **Bismuth Quadruple Therapy (Preferred if macrolide resistance is high)**:\n   - PPI, Bismuth, Tetracycline, Metronidazole for 14 days.\n2. **Concomitant Therapy**:\n   - PPI, Clarithromycin, Amoxicillin, Metronidazole for 10-14 days.\n\n### Post-Treatment:\n- Confirm eradication >= 4 weeks after antibiotics and after holding PPI for 1-2 weeks. Use stool antigen or breath test.",
    version: "2017 Guidelines"
  },
  {
    title: "Management of Heart Failure (AHA/ACC/HFSA 2022)",
    specialty: "Cardiology",
    description: "Guideline for the Management of Heart Failure.",
    content: "### GDMT for HFrEF (LVEF <= 40%):\n1. ARNI, ACEI, or ARB (ARNI preferred over ACEI/ARB).\n2. Beta-blockers (Carvedilol, Metoprolol succinate, or Bisoprolol).\n3. Mineralocorticoid Receptor Antagonist (MRA) (e.g., Spironolactone) if eGFR > 30 and K+ < 5.0.\n4. SGLT2 Inhibitors (Dapagliflozin or Empagliflozin) for all patients with symptomatic HFrEF.\n\n### HFpEF (LVEF >= 50%):\n- SGLT2 inhibitors are now recommended to decrease hospitalizations and cardiovascular mortality.",
    version: "2022 Update"
  },
  {
    title: "Sepsis Management (Surviving Sepsis Campaign)",
    specialty: "Intensive Care",
    description: "International Guidelines for Management of Sepsis and Septic Shock.",
    content: "### 1-Hour Bundle:\n1. Measure lactate level. Remeasure if initial lactate > 2 mmol/L.\n2. Obtain blood cultures BEFORE administering antibiotics.\n3. Administer broad-spectrum antibiotics.\n4. Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate >= 4 mmol/L.\n5. Apply vasopressors if hypotensive during or after fluid resuscitation to maintain MAP >= 65 mm Hg.\n\n### First-line Vasopressor:\n- Norepinephrine is the first-line agent.",
    version: "2021 Update"
  },
  {
    title: "Management of Community-Acquired Pneumonia",
    specialty: "Infectious Disease",
    description: "ATS/IDSA Clinical Practice Guideline for CAP in Adults.",
    content: "### Outpatient Treatment:\n- **No comorbidities**: Amoxicillin OR Macrolide OR Doxycycline.\n- **With comorbidities (heart, lung, liver, renal disease, DM)**: Combination of Amoxicillin/Clavulanate + Macrolide/Doxycycline OR Monotherapy with Respiratory Fluoroquinolone (Levofloxacin).\n\n### Inpatient Treatment (Non-Severe):\n- Beta-lactam (Ceftriaxone, Ampicillin-Sulbactam) + Macrolide OR Respiratory Fluoroquinolone.\n\n### Duration:\n- Minimum of 5 days, patient should be afebrile for 48-72 hours.",
    version: "2019 Guidelines"
  },
  {
    title: "Diagnosis and Treatment of UTI",
    specialty: "Infectious Disease",
    description: "IDSA guidelines for uncomplicated acute cystitis and pyelonephritis.",
    content: "### Acute Uncomplicated Cystitis in Women:\n- **First-line**:\n  1. Nitrofurantoin 100 mg BID x 5 days.\n  2. TMP-SMX DS BID x 3 days (if local resistance < 20%).\n  3. Fosfomycin 3g single dose.\n- Fluoroquinolones should be reserved as alternative agents.\n\n### Acute Pyelonephritis:\n- Outpatient: Oral Ciprofloxacin 500 mg BID x 7 days or Levofloxacin 750 mg daily x 5 days (if resistance < 10%).\n- If resistance >= 10%, give initial IV dose of Ceftriaxone or aminoglycoside.",
    version: "IDSA Update"
  },
  {
    title: "Major Depressive Disorder (APA)",
    specialty: "Psychiatry",
    description: "Treatment of patients with Major Depressive Disorder.",
    content: "### Initial Treatment:\n- SSRI, SNRI, Mirtazapine, or Bupropion are optimal first-line choices.\n- Combine pharmacotherapy with psychotherapy (CBT) for best outcomes.\n\n### Follow-up:\n- Assess response in 2-4 weeks.\n- If no response at 4-8 weeks, maximize dose, switch to different antidepressant, or augment (e.g., atypical antipsychotic, Lithium, or thyroid hormone).",
    version: "APA Guidelines"
  },
  {
    title: "Management of Osteoarthritis (ACR 2019)",
    specialty: "Rheumatology",
    description: "Guidelines for management of osteoarthritis of hand, hip, and knee.",
    content: "### Knee OA Management:\n- **Strongly Recommended**: Exercise, weight loss, Tai Chi, walking cane, topical NSAIDs, oral NSAIDs, intraarticular glucocorticoid injections.\n- **Conditionally Recommended**: Acetaminophen, Tramadol, Duloxetine.\n- **Recommended Against**: Glucosamine, Chondroitin, intraarticular hyaluronic acid injections.",
    version: "2019 Guidelines"
  },
  {
    title: "Anaphylaxis Management",
    specialty: "Emergency Medicine",
    description: "WAO guidelines for the assessment and management of anaphylaxis.",
    content: "### First-line Treatment:\n- **Epinephrine (Adrenaline)** IM injection in the mid-anterolateral thigh.\n- Dose: 0.01 mg/kg (max 0.5 mg in adults).\n- May repeat every 5-15 minutes if symptoms persist.\n\n### Adjunctive Therapy:\n- Antihistamines (H1 and H2 blockers) for cutaneous symptoms.\n- Glucocorticoids to prevent biphasic reactions (controversial, but often used).\n- Bronchodilators for bronchospasm unresponsive to epinephrine.",
    version: "WAO 2020"
  },
  {
    title: "Chronic Kidney Disease Management (KDIGO 2024)",
    specialty: "Nephrology",
    description: "KDIGO Clinical Practice Guideline for the Evaluation and Management of CKD.",
    content: "### Key Interventions:\n- BP control (Goal < 120 mm Hg SBP for most CKD patients).\n- ACEi or ARB for patients with albuminuria (UACR >= 30 mg/g) and hypertension.\n- **SGLT2 inhibitors** recommended for patients with eGFR >= 20 mL/min/1.73m2 and UACR >= 200 mg/g to slow progression.\n- nsMRA (Finerenone) for T2DM and CKD with albuminuria despite max tolerated RAS inhibition.",
    version: "2024 Guidelines"
  }
];

async function seedGuidelines() {
  console.log("Starting guideline seed...");
  
  for (const guide of guidelinesData) {
    const existing = await prisma.guideline.findFirst({
      where: { title: guide.title }
    });
    
    if (!existing) {
      await prisma.guideline.create({
        data: guide
      });
      console.log(`Added: ${guide.title}`);
    } else {
      console.log(`Already exists: ${guide.title}`);
    }
  }
  
  console.log("Guideline seeding completed.");
}

seedGuidelines()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
