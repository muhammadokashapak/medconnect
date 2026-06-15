import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const existing = await prisma.guideline.count();
    if (existing > 0) {
      await prisma.guideline.deleteMany(); // Clear existing to allow full re-seed
    }

    const defaultGuidelines = [
      {
        title: "AHA/ACC Hypertension Guidelines 2024",
        specialty: "Cardiology",
        description: "Latest comprehensive guidelines for the prevention, detection, evaluation, and management of high blood pressure in adults.",
        version: "2024.1",
        content: `### 1. Classification of Blood Pressure\n- **Normal:** <120/<80 mm Hg\n- **Elevated:** 120-129/<80 mm Hg\n- **Stage 1 Hypertension:** 130-139/80-89 mm Hg\n- **Stage 2 Hypertension:** >=140/>=90 mm Hg\n\n### 2. Treatment Strategies\n- **Nonpharmacologic Interventions:** Weight loss, healthy diet (DASH), sodium reduction, potassium supplementation, increased physical activity.\n- **Pharmacologic Treatment:** First-line agents include Thiazide diuretics, CCBs, and ACE inhibitors or ARBs.`
      },
      {
        title: "ESC Heart Failure Guidelines",
        specialty: "Cardiology",
        description: "European Society of Cardiology guidelines for diagnosis and treatment of acute and chronic heart failure.",
        version: "2023.0",
        content: `### Core Therapies for HFrEF\n- ACE-I/ARNI\n- Beta-blockers\n- MRA\n- SGLT2 inhibitors\n\nAll four pillars should be initiated as soon as safely possible.`
      },
      {
        title: "ADA Standards of Medical Care in Diabetes",
        specialty: "Endocrinology",
        description: "Current clinical practice recommendations for the management of diabetes.",
        version: "2024.2",
        content: `### 1. Diagnosis\n- **FPG:** >=126 mg/dL (7.0 mmol/L)\n- **A1C:** >=6.5% (48 mmol/mol)\n\n### 2. Pharmacologic Therapy for Type 2 Diabetes\n- Metformin remains the preferred initial pharmacologic agent.\n- Consider GLP-1 RA or SGLT2i in patients with established ASCVD, heart failure, or CKD.`
      },
      {
        title: "AACE Thyroid Nodule Guidelines",
        specialty: "Endocrinology",
        description: "Clinical practice guidelines for the diagnosis and management of thyroid nodules.",
        version: "2022.0",
        content: `### Ultrasound Evaluation\n- High-suspicion nodules >= 1cm require FNA.\n- Intermediate suspicion >= 1.5cm require FNA.\n- Low suspicion >= 2cm require FNA.`
      },
      {
        title: "GINA Asthma Management Strategy",
        specialty: "Pulmonology",
        description: "Global Strategy for Asthma Management and Prevention.",
        version: "2024.0",
        content: `### Treatment\n- **Track 1 (Preferred):** Low dose ICS-formoterol as reliever.\n- **Track 2:** SABA as reliever, with regular ICS controller. Don't use SABA alone without ICS.`
      },
      {
        title: "GOLD COPD Guidelines",
        specialty: "Pulmonology",
        description: "Global Initiative for Chronic Obstructive Lung Disease.",
        version: "2024.1",
        content: `### Initial Pharmacological Treatment\n- Group A: A bronchodilator\n- Group B: LABA + LAMA\n- Group E: LABA + LAMA (consider ICS if eos >= 300)`
      },
      {
        title: "AAN Migraine Prevention Guidelines",
        specialty: "Neurology",
        description: "Evidence-based guideline update: Pharmacologic treatment for episodic migraine prevention in adults.",
        version: "2022.3",
        content: `### First-Line Preventative Medications\n- Divalproex sodium, sodium valproate, topiramate.\n- Metoprolol, propranolol, timolol.\n- CGRP monoclonal antibodies (e.g., Erenumab).`
      },
      {
        title: "ACG GERD Guidelines",
        specialty: "Gastroenterology",
        description: "American College of Gastroenterology clinical guideline for the diagnosis and management of gastroesophageal reflux disease.",
        version: "2022.1",
        content: `### Management\n- An 8-week trial of empiric PPIs for typical GERD symptoms.\n- Maintenance PPI should be administered to GERD patients who continue to have symptoms after PPI is discontinued.`
      },
      {
        title: "AAD Acne Vulgaris Guidelines",
        specialty: "Dermatology",
        description: "Guidelines of care for the management of acne vulgaris.",
        version: "2023.0",
        content: `### First-Line Treatments\n- **Mild:** Topical retinoid or topical retinoid + topical antimicrobial.\n- **Moderate:** Topical retinoid + oral antibiotic + topical benzoyl peroxide.\n- **Severe:** Oral isotretinoin or combination of oral antibiotics, topical retinoid, and BPO.`
      },
      {
        title: "AAOS Osteoarthritis of the Knee",
        specialty: "Orthopedics",
        description: "Treatment of Osteoarthritis of the Knee (Non-Arthroplasty).",
        version: "2021.2",
        content: `### Strong Recommendations\n- Supervised exercise, unstructured physical activity, and/or weight loss.\n- Oral NSAIDs, topical NSAIDs.\n- Intra-articular corticosteroids (short-term relief).`
      },
      {
        title: "AAP Otitis Media Guidelines",
        specialty: "Pediatrics",
        description: "Diagnosis and Management of Acute Otitis Media.",
        version: "2022.0",
        content: `### Antibiotic Therapy\n- High-dose Amoxicillin (80-90 mg/kg/day) is the treatment of choice for most children.\n- Consider observation with close follow-up for children >= 2 years with non-severe illness.`
      },
      {
        title: "ACOG Postpartum Hemorrhage",
        specialty: "Gynecology",
        description: "Practice Bulletin regarding Postpartum Hemorrhage.",
        version: "2020.1",
        content: `### Management\n- First-line: Uterine massage and bimanual compression.\n- Medical: Oxytocin, Methylergonovine, 15-methyl PGF2a, Misoprostol.\n- Surgical: Uterine balloon tamponade, B-Lynch suture, hysterectomy as last resort.`
      },
      {
        title: "APA Major Depressive Disorder",
        specialty: "Psychiatry",
        description: "Practice Guideline for the Treatment of Patients With Major Depressive Disorder.",
        version: "2021.0",
        content: `### Initial Treatment\n- SSRIs, SNRIs, Mirtazapine, or Bupropion are recommended as optimal first-line medications.\n- Cognitive Behavioral Therapy (CBT) or Interpersonal Therapy (IPT) are recommended as initial psychotherapy.`
      },
      {
        title: "ACEP Sepsis Guidelines",
        specialty: "Emergency Medicine",
        description: "Clinical Policy: Critical Issues in the Early Evaluation and Management of Adult Patients Presenting to the Emergency Department with Suspected Sepsis.",
        version: "2023.1",
        content: `### Early Resuscitation\n- Administer broad-spectrum IV antimicrobials within 1 hour of recognition.\n- Measure lactate and repeat if initial is > 2 mmol/L.\n- Administer 30 mL/kg IV crystalloid fluid for hypotension or lactate >= 4 mmol/L.`
      }
    ];

    await prisma.guideline.createMany({
      data: defaultGuidelines
    });

    return NextResponse.json({ message: "Successfully seeded " + defaultGuidelines.length + " default guidelines across all specialties." });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed guidelines" }, { status: 500 });
  }
}
