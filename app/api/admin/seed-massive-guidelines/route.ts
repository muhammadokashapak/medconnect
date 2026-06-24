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
        const description = `Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of ${topic}.`;
        const keyPoints = [
          `First-line therapy recommendations and dosage adjustments for ${topic}.`,
          `Diagnostic criteria and required laboratory/imaging investigations.`,
          `Risk stratification and prognosis evaluation.`,
          `When to refer to a specialist and surgical indications.`
        ];
        
        guidelinesToInsert.push({
          id: `gl_${idCounter++}`,
          title: `${org} Guidelines for ${topic}`,
          specialty: field.name,
          version: year.toString(),
          description: description,
          content: keyPoints.join('\n\n')
        });
      }
    }

    await prisma.savedGuideline.deleteMany();
    await prisma.guideline.deleteMany();
    
    await prisma.guideline.createMany({
      data: guidelinesToInsert
    });

    return NextResponse.json({ message: "Seeded " + guidelinesToInsert.length + " guidelines successfully." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
