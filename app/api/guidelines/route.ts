import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

function getUserIdFromToken(req: Request): string | null {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const specialty = searchParams.get("specialty") || "";

    const hardcodedGuidelines = [
      {
        id: "g1",
        title: "AHA/ACC Hypertension Guidelines",
        specialty: "Cardiology",
        description: "Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults.",
        content: "Normal BP: <120/80 mmHg. Elevated: 120-129/<80. Stage 1: 130-139/80-89. Stage 2: >=140/>=90. Lifestyle modifications are first line for elevated BP and stage 1. First line meds: Thiazides, CCBs, ACEI or ARBs.",
        version: "2017",
        createdAt: new Date().toISOString()
      },
      {
        id: "g2",
        title: "ADA Standards of Medical Care in Diabetes",
        specialty: "Endocrinology",
        description: "Comprehensive guidelines for diabetes diagnosis and management.",
        content: "Screening: BMI >= 25 (23 in Asian Americans) + risk factors. Diagnosis: FPG >= 126 mg/dL, 2-h PG >= 200 mg/dL, A1C >= 6.5%. First line: Metformin + lifestyle. Target A1C < 7.0%.",
        version: "2023",
        createdAt: new Date().toISOString()
      },
      {
        id: "g3",
        title: "GINA Asthma Strategy",
        specialty: "Pulmonology",
        description: "Global Strategy for Asthma Management and Prevention.",
        content: "ICS-formoterol is the preferred reliever and controller for adults and adolescents. SABA alone is no longer recommended for adults. Step 1-2: as-needed low dose ICS-formoterol.",
        version: "2023",
        createdAt: new Date().toISOString()
      },
      {
        id: "g4",
        title: "GOLD COPD Guidelines",
        specialty: "Pulmonology",
        description: "Global Strategy for the Diagnosis, Management, and Prevention of COPD.",
        content: "Diagnosis requires post-bronchodilator FEV1/FVC < 0.70. Initial treatment based on ABE assessment tool. LAMA or LABA for Group A, LAMA+LABA for Group B/E. ICS added for high eosinophils.",
        version: "2023",
        createdAt: new Date().toISOString()
      },
      {
        id: "g5",
        title: "AHA/ACC Heart Failure Guidelines",
        specialty: "Cardiology",
        description: "Management of Heart Failure.",
        content: "HFrEF GDMT includes ARNI/ACEI/ARB + Beta Blocker + MRA + SGLT2i. SGLT2i (Dapagliflozin/Empagliflozin) now recommended across the spectrum of LVEF including HFpEF.",
        version: "2022",
        createdAt: new Date().toISOString()
      },
      {
        id: "g6",
        title: "Surviving Sepsis Campaign",
        specialty: "Emergency Medicine",
        description: "International Guidelines for Management of Sepsis and Septic Shock.",
        content: "1-hour bundle: Measure lactate, obtain blood cultures before antibiotics, administer broad-spectrum antibiotics, begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate >= 4 mmol/L, apply vasopressors if hypotensive during or after fluid resuscitation to maintain MAP >= 65 mmHg.",
        version: "2021",
        createdAt: new Date().toISOString()
      },
      {
        id: "g7",
        title: "KDIGO Chronic Kidney Disease",
        specialty: "Nephrology",
        description: "Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.",
        content: "Classification based on CGA (Cause, GFR, Albuminuria). Treat hypertension (ACEi/ARB if albuminuria present). SGLT2i for CKD with T2DM or proteinuric non-diabetic CKD.",
        version: "2024",
        createdAt: new Date().toISOString()
      },
      {
        id: "g8",
        title: "AASLD Cirrhosis Management",
        specialty: "Gastroenterology",
        description: "Guidance concerning the management of ascites, SBP, and HRS.",
        content: "Ascites: Dietary sodium restriction (< 2000 mg/day). Diuretics: Spironolactone and Furosemide (ratio 100:40). Avoid NSAIDs, ACEi, ARBs. SBP prophylaxis indicated for high-risk patients.",
        version: "2021",
        createdAt: new Date().toISOString()
      },
      {
        id: "g9",
        title: "AAN Migraine Prevention",
        specialty: "Neurology",
        description: "Evidence-based guideline update: Pharmacologic treatment for episodic migraine prevention in adults.",
        content: "Level A: Divalproex, topiramate, metoprolol, propranolol, timolol. CGRP antagonists now widely used for prevention. Amitriptyline and venlafaxine are Level B.",
        version: "2012 (Reaffirmed 2022)",
        createdAt: new Date().toISOString()
      },
      {
        id: "g10",
        title: "AAP Febrile Seizures",
        specialty: "Pediatrics",
        description: "Clinical Practice Guideline for the Long-term Management of the Child With Simple Febrile Seizures.",
        content: "Continuous or intermittent antiepileptic therapy is not recommended for children with one or more simple febrile seizures. Antipyretics do not prevent simple febrile seizures.",
        version: "2008 (Reaffirmed 2023)",
        createdAt: new Date().toISOString()
      }
    ];

    let filtered = hardcodedGuidelines;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description.toLowerCase().includes(q)
      );
    }

    if (specialty && specialty !== "All") {
      filtered = filtered.filter(g => g.specialty === specialty);
    }

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
