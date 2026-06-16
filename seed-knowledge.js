require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Knowledge Hub...");
  
  await prisma.guideline.createMany({
    data: [
      {
        title: 'Management of Acute Coronary Syndrome',
        specialty: 'Cardiology',
        description: 'Protocols for diagnosing and managing ACS, including NSTEMI and STEMI.',
        content: '1. Immediate ECG and cardiac biomarkers. 2. Administer Aspirin, Nitroglycerin. 3. Consider reperfusion therapy for STEMI.',
        version: 'v3.1'
      },
      {
        title: 'Stroke (Ischemic) Acute Management',
        specialty: 'Neurology',
        description: 'Guidelines for early assessment and intervention in acute ischemic stroke.',
        content: '1. Non-contrast CT to rule out hemorrhage. 2. Thrombolysis (rtPA) if within 4.5 hours. 3. BP management.',
        version: 'v4.0'
      },
      {
        title: 'Asthma Exacerbation Management in Pediatrics',
        specialty: 'Pediatrics',
        description: 'Stepwise approach to acute asthma in children.',
        content: '1. Assess severity (mild/mod/severe). 2. SABA nebulization. 3. Systemic corticosteroids for moderate to severe cases.',
        version: 'v2.5'
      },
      {
        title: 'Sepsis Surviving Campaign 2026',
        specialty: 'General Surgery',
        description: 'Updated guidelines for sepsis and septic shock.',
        content: '1. Measure lactate. 2. Obtain blood cultures prior to antibiotics. 3. Administer broad-spectrum antibiotics. 4. Rapid administration of 30 mL/kg crystalloid for hypotension.',
        version: 'v5.0'
      },
      {
        title: 'Major Depressive Disorder Treatment',
        specialty: 'Psychiatry',
        description: 'Clinical guidelines for pharmacological and psychological treatment of MDD.',
        content: '1. First-line SSRIs or SNRIs. 2. Cognitive Behavioral Therapy (CBT). 3. Monitor for suicidal ideation closely.',
        version: 'v1.8'
      },
      {
        title: 'Osteoarthritis Management in Knee and Hip',
        specialty: 'Orthopedics',
        description: 'Non-surgical and surgical management options for OA.',
        content: '1. Weight loss and physical therapy. 2. Oral or topical NSAIDs. 3. Intra-articular corticosteroid injections. 4. Total joint replacement for advanced cases.',
        version: 'v3.2'
      },
      {
        title: 'Acne Vulgaris Treatment Protocol',
        specialty: 'Dermatology',
        description: 'Step-by-step treatment algorithm for varying severities of acne.',
        content: '1. Mild: Topical retinoids, Benzoyl Peroxide. 2. Moderate: Add oral antibiotics (e.g., Doxycycline). 3. Severe: Consider oral Isotretinoin.',
        version: 'v2.0'
      },
      {
        title: 'Breast Cancer Screening Guidelines',
        specialty: 'Oncology',
        description: 'Recommendations for mammography and genetic testing.',
        content: '1. Annual mammogram starting at age 40 for average risk. 2. Earlier screening for BRCA mutation carriers. 3. Clinical breast exam not recommended for average risk screening.',
        version: 'v4.1'
      },
      {
        title: 'Hypertension Management 2026',
        specialty: 'Cardiology',
        description: 'Comprehensive guidelines for managing hypertension in adults.',
        content: '1. Lifestyle modifications first. 2. Start ACE inhibitors or ARBs for primary care.',
        version: 'v1.0'
      },
      {
        title: 'Type 2 Diabetes Mellitus Standard of Care',
        specialty: 'Endocrinology',
        description: 'Latest standards for managing Type 2 Diabetes.',
        content: '1. Metformin is first-line therapy. 2. Consider SGLT2 inhibitors for cardiovascular benefits.',
        version: 'v2.1'
      }
    ],
    skipDuplicates: true
  });

  await prisma.drug.createMany({
    data: [
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10-40 mg PO daily',
        indications: 'Hypertension, Heart Failure, Acute Myocardial Infarction',
        contraindications: 'Angioedema, pregnancy',
        sideEffects: 'Dry cough, hyperkalemia, dizziness',
        interactions: 'NSAIDs (reduced effect), Potassium-sparing diuretics'
      },
      {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500-2000 mg PO daily in divided doses',
        indications: 'Type 2 Diabetes Mellitus',
        contraindications: 'Severe renal impairment (eGFR < 30)',
        sideEffects: 'Diarrhea, nausea, lactic acidosis (rare)',
        interactions: 'Iodinated contrast (temporarily discontinue)'
      }
    ],
    skipDuplicates: true
  });

  await prisma.researchPaper.createMany({
    data: [
      {
        title: 'Efficacy of SGLT2 Inhibitors in Heart Failure',
        authors: 'Dr. Smith, Dr. Doe',
        abstract: 'This study reviews the significant reduction in mortality rates among heart failure patients treated with SGLT2 inhibitors.',
        specialty: 'Cardiology',
        pdfUrl: 'https://example.com/paper1.pdf'
      }
    ],
    skipDuplicates: true
  });

  await prisma.medicalNews.createMany({
    data: [
      {
        title: 'FDA Approves New Targeted Therapy for Melanoma',
        content: 'The FDA has fast-tracked approval for a novel BRAF inhibitor showing remarkable efficacy in advanced melanoma patients...',
        category: 'Oncology',
        source: 'MedNews Daily'
      }
    ],
    skipDuplicates: true
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
