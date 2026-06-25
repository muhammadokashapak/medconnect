import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const topConditions = [
  { topic: "Hypertension", specialty: "Cardiology", org: "AHA/ACC" },
  { topic: "Type 2 Diabetes", specialty: "Endocrinology", org: "ADA" },
  { topic: "Asthma", specialty: "Pulmonology", org: "GINA" },
  { topic: "Ischemic Stroke", specialty: "Neurology", org: "AHA/ASA" },
  { topic: "GERD", specialty: "Gastroenterology", org: "ACG" },
  { topic: "Chronic Kidney Disease", specialty: "Nephrology", org: "KDIGO" },
  { topic: "Breast Cancer", specialty: "Oncology", org: "NCCN" },
  { topic: "Otitis Media", specialty: "Pediatrics", org: "AAP" },
  { topic: "Preeclampsia", specialty: "Obstetrics/Gynecology", org: "ACOG" },
  { topic: "Sepsis", specialty: "Infectious Diseases", org: "Surviving Sepsis Campaign" }
];

async function generateWithGemini(topic: string, specialty: string, org: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are an expert medical professional writing a brief, highly concise, evidence-based Clinical Practice Guideline for ${topic}.
  Organization: ${org}. Specialty: ${specialty}.
  
  Write a concise medical document in Markdown format (maximum 200-250 words). Do NOT wrap the entire response in triple backticks. Just output raw markdown.
  CRITICAL: DO NOT USE ANY TABLES. Tables are strictly forbidden. Use bullet points instead.
  
  Must include the following sections with EXACT these markdown headings:
  # Executive Summary
  (Brief 1-2 sentence intro)
  
  ### 1. Etiology and Pathophysiology
  (Brief causes in bullet points)
  
  ### 2. Diagnostic Workup
  (List of required labs/imaging in simple bullet points. NO TABLES.)
  
  ### 3. Treatment Algorithm
  (Include realistic first-line therapies and dosages for ${topic}. Keep it very brief. Use blockquotes for warnings or clinical pearls.)
  
  ### 4. Patient Follow-up
  (Brief monitoring timeline)
  
  Make it look extremely clean and airy. Use short paragraphs and lots of bullet points.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function GET() {
  try {
    const guidelinesToInsert = [];
    let idCounter = 1;
    
    for (const condition of topConditions) {
      try {
        const detailedContent = await generateWithGemini(condition.topic, condition.specialty, condition.org);
        const year = 2023;
        
        guidelinesToInsert.push({
          id: `gl_${idCounter++}`,
          title: `${condition.org} Guidelines for ${condition.topic}`,
          specialty: condition.specialty,
          version: year.toString(),
          description: `Comprehensive, newly generated evidence-based ${year} recommendations for the diagnosis and management of ${condition.topic}.`,
          content: detailedContent
        });
      } catch (e) {
        console.error(`Failed to generate ${condition.topic}:`, e);
      }
    }
  
    if (guidelinesToInsert.length > 0) {
      await prisma.savedGuideline.deleteMany();
      await prisma.guideline.deleteMany();
      await prisma.guideline.createMany({ data: guidelinesToInsert });
      return NextResponse.json({ message: "Success! Real guidelines seeded." }, { status: 200 });
    } else {
      return NextResponse.json({ message: "No guidelines generated." }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
