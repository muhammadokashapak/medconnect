require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Knowledge Hub...");
  
  await prisma.guideline.createMany({
    data: [
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
