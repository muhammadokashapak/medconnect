import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const existing = await prisma.guideline.count();
    if (existing > 0) {
      return NextResponse.json({ message: "Guidelines already seeded." });
    }

    const defaultGuidelines = [
      {
        title: "AHA/ACC Hypertension Guidelines 2024",
        specialty: "Cardiology",
        description: "Latest comprehensive guidelines for the prevention, detection, evaluation, and management of high blood pressure in adults.",
        version: "2024.1",
        content: `### 1. Classification of Blood Pressure
- **Normal:** <120/<80 mm Hg
- **Elevated:** 120-129/<80 mm Hg
- **Stage 1 Hypertension:** 130-139/80-89 mm Hg
- **Stage 2 Hypertension:** ≥140/≥90 mm Hg

### 2. Diagnosis
- Ensure accurate measurement using validated devices.
- Confirm diagnosis using Out-of-Office BP monitoring (ABPM or HBPM).

### 3. Treatment Strategies
- **Nonpharmacologic Interventions:** Weight loss, healthy diet (DASH), sodium reduction, potassium supplementation, increased physical activity, and moderation of alcohol.
- **Pharmacologic Treatment:** Recommended for Stage 1 if ASCVD risk is ≥10%, and for all Stage 2 patients. First-line agents include Thiazide diuretics, CCBs, and ACE inhibitors or ARBs.`
      },
      {
        title: "ADA Standards of Medical Care in Diabetes",
        specialty: "Endocrinology",
        description: "Current clinical practice recommendations for the management of diabetes.",
        version: "2024.2",
        content: `### 1. Diagnosis
- **FPG:** ≥126 mg/dL (7.0 mmol/L)
- **2-h PG:** ≥200 mg/dL (11.1 mmol/L) during OGTT
- **A1C:** ≥6.5% (48 mmol/mol)
- **Classic symptoms + Random PG:** ≥200 mg/dL

### 2. Glycemic Targets
- Nonpregnant adults: A1C <7.0% (53 mmol/mol)
- Preprandial capillary plasma glucose: 80-130 mg/dL
- Peak postprandial capillary plasma glucose: <180 mg/dL

### 3. Pharmacologic Therapy for Type 2 Diabetes
- Metformin remains the preferred initial pharmacologic agent.
- Consider GLP-1 RA or SGLT2i in patients with established ASCVD, heart failure, or CKD independently of A1C.`
      },
      {
        title: "GINA Asthma Management Strategy",
        specialty: "Pulmonology",
        description: "Global Strategy for Asthma Management and Prevention.",
        version: "2024.0",
        content: `### 1. Diagnosis
- History of variable respiratory symptoms (wheeze, shortness of breath, chest tightness, cough).
- Evidence of variable expiratory airflow limitation.

### 2. Assessment
- Assess symptom control using Asthma Control Test (ACT).
- Assess future risk of exacerbations, fixed airflow limitation, and medication side-effects.

### 3. Treatment
- **Track 1 (Preferred):** Low dose ICS-formoterol as reliever.
- **Track 2:** SABA as reliever, with regular ICS controller.
- **Step up/down therapy:** Adjust based on symptom control and exacerbations. Don't use SABA alone without ICS.`
      }
    ];

    await prisma.guideline.createMany({
      data: defaultGuidelines
    });

    return NextResponse.json({ message: "Successfully seeded default guidelines." });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed guidelines" }, { status: 500 });
  }
}
