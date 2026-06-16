import { prisma } from '../lib/prisma';

const specialtiesList = [
  "Cardiology", "Neurology", "Pulmonology", "Endocrinology", "Gastroenterology",
  "Dermatology", "Orthopedics", "Pediatrics", "Gynecology",
  "Psychiatry", "Emergency Medicine"
];

// Sample realistic medical topics per specialty
const topicsBySpecialty: Record<string, string[]> = {
  "Cardiology": [
    "Atrial Fibrillation", "Heart Failure (HFrEF)", "Heart Failure (HFpEF)", "Stable Angina", "NSTEMI", 
    "STEMI", "Hypertension", "Hyperlipidemia", "Endocarditis", "Pericarditis", 
    "Aortic Aneurysm", "Peripheral Arterial Disease", "Valvular Heart Disease", "Hypertrophic Cardiomyopathy", "Syncope"
  ],
  "Neurology": [
    "Ischemic Stroke", "Hemorrhagic Stroke", "Migraine", "Epilepsy", "Multiple Sclerosis",
    "Parkinson's Disease", "Alzheimer's Disease", "Peripheral Neuropathy", "Myasthenia Gravis", "Guillain-Barre Syndrome",
    "ALS", "Restless Legs Syndrome", "Essential Tremor", "Brain Tumor Initial Management", "Meningitis"
  ],
  "Pulmonology": [
    "Asthma", "COPD", "Pneumonia", "Pulmonary Embolism", "Pulmonary Hypertension",
    "Interstitial Lung Disease", "Obstructive Sleep Apnea", "Tuberculosis", "Lung Cancer Screening", "Cystic Fibrosis",
    "Sarcoidosis", "Pleural Effusion", "Pneumothorax", "Acute Respiratory Distress Syndrome", "Bronchiectasis"
  ],
  "Endocrinology": [
    "Type 1 Diabetes", "Type 2 Diabetes", "Hypothyroidism", "Hyperthyroidism", "Cushing's Syndrome",
    "Addison's Disease", "PCOS", "Osteoporosis", "Hyperparathyroidism", "Hypoparathyroidism",
    "Pheochromocytoma", "Prolactinoma", "Acromegaly", "Diabetes Insipidus", "Metabolic Syndrome"
  ],
  "Gastroenterology": [
    "GERD", "Peptic Ulcer Disease", "H. Pylori", "Crohn's Disease", "Ulcerative Colitis",
    "Irritable Bowel Syndrome", "Celiac Disease", "Hepatitis B", "Hepatitis C", "Cirrhosis",
    "Acute Pancreatitis", "Chronic Pancreatitis", "Gallstones", "Colorectal Cancer Screening", "Esophageal Varices"
  ],
  "Dermatology": [
    "Acne Vulgaris", "Psoriasis", "Atopic Dermatitis", "Contact Dermatitis", "Melanoma",
    "Basal Cell Carcinoma", "Squamous Cell Carcinoma", "Rosacea", "Alopecia Areata", "Vitiligo",
    "Tinea Infection", "Onychomycosis", "Scabies", "Urticaria", "Cellulitis"
  ],
  "Orthopedics": [
    "Osteoarthritis", "Rheumatoid Arthritis", "Osteoporosis Fractures", "Carpal Tunnel Syndrome", "Rotator Cuff Tear",
    "ACL Tear", "Meniscus Tear", "Plantar Fasciitis", "Herniated Disc", "Spinal Stenosis",
    "Gout", "Septic Arthritis", "Osteomyelitis", "Ankle Sprain", "Tendinopathy"
  ],
  "Pediatrics": [
    "Asthma (Pediatric)", "Otitis Media", "Strep Throat", "ADHD", "Autism Spectrum Disorder",
    "Childhood Obesity", "Type 1 Diabetes (Pediatric)", "Eczema (Pediatric)", "Febrile Seizure", "Kawasaki Disease",
    "Croup", "Bronchiolitis", "Gastroenteritis", "UTI (Pediatric)", "Immunization Schedule"
  ],
  "Gynecology": [
    "Contraception", "PCOS", "Endometriosis", "Uterine Fibroids", "Pelvic Inflammatory Disease",
    "Cervical Cancer Screening", "Breast Cancer Screening", "Menopause Management", "Vaginitis", "Ectopic Pregnancy",
    "Ovarian Cysts", "Dysmenorrhea", "Abnormal Uterine Bleeding", "Infertility Evaluation", "Urinary Incontinence"
  ],
  "Psychiatry": [
    "Major Depressive Disorder", "Generalized Anxiety Disorder", "Panic Disorder", "Bipolar Disorder", "Schizophrenia",
    "PTSD", "OCD", "ADHD (Adult)", "Insomnia", "Substance Use Disorder",
    "Alcohol Withdrawal", "Eating Disorders", "Borderline Personality Disorder", "Somatic Symptom Disorder", "Delirium"
  ],
  "Emergency Medicine": [
    "Cardiac Arrest", "Anaphylaxis", "Sepsis", "Major Trauma", "Acute Myocardial Infarction",
    "Stroke (Acute)", "Status Epilepticus", "Poisoning and Overdose", "Acute Respiratory Failure", "Diabetic Ketoacidosis",
    "Hyperkalemia", "Hypertensive Emergency", "Acute Pulmonary Edema", "Pulmonary Embolism (Massive)", "Aortic Dissection"
  ]
};

async function seedMassiveGuidelines() {
  console.log("Starting massive guideline seed...");
  
  let totalAdded = 0;

  for (const specialty of specialtiesList) {
    const topics = topicsBySpecialty[specialty];
    if (!topics) continue;

    console.log(`Seeding for ${specialty}...`);

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const title = `Management of ${topic} (${new Date().getFullYear()} Guidelines)`;
      
      const existing = await prisma.guideline.findFirst({
        where: { title }
      });
      
      if (!existing) {
        await prisma.guideline.create({
          data: {
            title,
            specialty,
            description: `Comprehensive evidence-based clinical guidelines for the diagnosis, management, and treatment of ${topic}. This includes latest pharmacological and non-pharmacological interventions.`,
            content: `### 1. Initial Assessment & Diagnosis\n- Obtain thorough history and physical examination focused on ${topic}.\n- Order appropriate initial investigations (e.g., blood tests, imaging).\n- Consider differential diagnoses and red flag symptoms.\n\n### 2. Acute Management\n- Stabilize the patient if presenting with acute symptoms of ${topic}.\n- Initiate first-line acute therapies according to severity.\n- Monitor vital signs and clinical response.\n\n### 3. Long-term / Maintenance Therapy\n- **First-line treatment**: Start standard of care medication and lifestyle modifications.\n- **Second-line treatment**: Consider alternatives if the patient is unresponsive or has contraindications.\n- Patient education regarding disease progression, compliance, and expected outcomes.\n\n### 4. Follow-up and Referral\n- Schedule routine follow-up at 4-6 weeks.\n- Consider specialist referral if ${topic} is refractory to initial treatments or if complications arise.\n\n*Note: These are generated guidelines for demonstration purposes. Always consult local protocol.*`,
            version: `${new Date().getFullYear()} v1.0`
          }
        });
        totalAdded++;
      }
    }
  }
  
  console.log(`Seeding completed. Added ${totalAdded} new guidelines.`);
}

seedMassiveGuidelines()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
