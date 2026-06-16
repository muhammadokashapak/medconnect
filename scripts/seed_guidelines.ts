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
