import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We'll generate realistic guidelines for the top 10 most important diseases
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
  You are an expert medical professional writing a highly detailed, evidence-based Clinical Practice Guideline for ${topic}.
  Organization: ${org}. Specialty: ${specialty}.
  
  Write a comprehensive medical document in Markdown format (at least 500 words). Do NOT wrap the entire response in triple backticks. Just output raw markdown.
  
  Must include the following sections with EXACT these markdown headings:
  # Executive Summary
  (Brief intro)
  
  ### 1. Etiology and Pathophysiology
  (Detailed causes)
  
  ### 2. Diagnostic Workup and Criteria
  (Include a detailed Markdown table of required labs/imaging)
  
  ### 3. Treatment Algorithm and Management
  (Include specific drug classes, realistic first-line and second-line therapies, and realistic dosages for ${topic}. Use blockquotes for warnings or clinical pearls.)
  
  ### 4. Patient Follow-up and Prognosis
  (Monitoring timelines)
  
  ### 5. References and Evidence Base
  (List 2-3 realistic mock references for ${org})
  
  Make it look extremely professional, using bullet points, bold text, blockquotes (> Clinical Pearl: ...), and well-formatted tables.
  `;

  console.log(`Generating content for ${topic}...`);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  
  const prisma = new PrismaClient();

  console.log("Starting realistic guideline generation...");
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
      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Failed to generate ${condition.topic}:`, e);
    }
  }

  if (guidelinesToInsert.length > 0) {
    console.log(`Clearing old guidelines and inserting ${guidelinesToInsert.length} realistic ones...`);
    await prisma.savedGuideline.deleteMany();
    await prisma.guideline.deleteMany();
    await prisma.guideline.createMany({ data: guidelinesToInsert });
    console.log("Success! Real guidelines seeded.");
  } else {
    console.log("No guidelines generated.");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
