const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 9 data...');

  // 1. Guidelines
  await prisma.guideline.createMany({
    data: [
      {
        title: 'Hypertension Management 2026',
        specialty: 'Cardiology',
        description: 'Comprehensive guidelines for managing hypertension in adults.',
        content: '1. Lifestyle modifications first. 2. Start ACE inhibitors or ARBs for primary care. 3. Thiazide diuretics are a strong alternative. Target BP < 130/80 mmHg.',
        version: 'v1.0'
      },
      {
        title: 'Type 2 Diabetes Mellitus Standard of Care',
        specialty: 'Endocrinology',
        description: 'Latest standards for managing Type 2 Diabetes.',
        content: '1. Metformin is first-line therapy. 2. Consider SGLT2 inhibitors for cardiovascular benefits. 3. Monitor HbA1c every 3-6 months. Target HbA1c < 7%.',
        version: 'v2.1'
      },
      {
        title: 'Acute Asthma Exacerbation Protocol',
        specialty: 'Pulmonology',
        description: 'Emergency department management for acute asthma.',
        content: '1. Oxygen therapy to maintain SpO2 > 93%. 2. Short-acting beta agonists (SABA). 3. Systemic corticosteroids within 1 hour of presentation.',
        version: 'v1.5'
      }
    ],
    skipDuplicates: true
  });

  // 2. Drugs
  await prisma.drug.createMany({
    data: [
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10-40 mg PO daily',
        indications: 'Hypertension, Heart Failure, Acute Myocardial Infarction',
        contraindications: 'Angioedema, pregnancy',
        sideEffects: 'Dry cough, hyperkalemia, dizziness',
        interactions: 'NSAIDs (reduced effect), Potassium-sparing diuretics (hyperkalemia)'
      },
      {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500-2000 mg PO daily in divided doses',
        indications: 'Type 2 Diabetes Mellitus',
        contraindications: 'Severe renal impairment (eGFR < 30)',
        sideEffects: 'Diarrhea, nausea, lactic acidosis (rare)',
        interactions: 'Iodinated contrast (temporarily discontinue)'
      },
      {
        name: 'Albuterol',
        genericName: 'Albuterol Sulfate',
        dosage: '2 puffs q4-6h PRN',
        indications: 'Asthma, COPD, bronchospasm',
        contraindications: 'Hypersensitivity',
        sideEffects: 'Tachycardia, tremors, hypokalemia',
        interactions: 'Beta-blockers (antagonistic effect), MAO inhibitors'
      },
      {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        dosage: '81-325 mg PO daily for cardioprotection',
        indications: 'Pain, fever, inflammation, cardioprotection',
        contraindications: 'Bleeding disorders, active ulcer',
        sideEffects: 'GI bleeding, dyspepsia, tinnitus',
        interactions: 'Warfarin, SSRIs (increased bleeding risk)'
      }
    ],
    skipDuplicates: true
  });

  // 3. Research Papers
  await prisma.researchPaper.createMany({
    data: [
      {
        title: 'Efficacy of SGLT2 Inhibitors in Heart Failure',
        authors: 'Dr. Smith, Dr. Doe',
        abstract: 'This study reviews the significant reduction in mortality rates among heart failure patients treated with SGLT2 inhibitors.',
        specialty: 'Cardiology',
        pdfUrl: 'https://example.com/paper1.pdf'
      },
      {
        title: 'Long-term Neurological Impacts of COVID-19',
        authors: 'Dr. Johnson, Dr. Lee',
        abstract: 'A comprehensive 5-year cohort study on patients experiencing long-COVID neurological symptoms.',
        specialty: 'Neurology',
        pdfUrl: 'https://example.com/paper2.pdf'
      }
    ],
    skipDuplicates: true
  });

  // 4. Medical News
  await prisma.medicalNews.createMany({
    data: [
      {
        title: 'FDA Approves New Targeted Therapy for Melanoma',
        content: 'The FDA has fast-tracked approval for a novel BRAF inhibitor showing remarkable efficacy in advanced melanoma patients...',
        category: 'Oncology',
        source: 'MedNews Daily'
      },
      {
        title: 'Breakthrough in Alzheimer\'s Biomarker Detection',
        content: 'Researchers have developed a highly sensitive blood test that can detect tau protein accumulation years before clinical symptoms.',
        category: 'Neurology',
        source: 'Global Health Journal'
      }
    ],
    skipDuplicates: true
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
