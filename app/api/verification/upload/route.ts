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

export async function POST(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { licenseImage, cnicImage, selfieImage } = body;

    if (!licenseImage || !cnicImage || !selfieImage) {
      return NextResponse.json({ message: "All verification documents are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });

    let autoVerified = false;
    let verificationNotes = "Pending manual review.";

    try {
      if (process.env.GEMINI_API_KEY && licenseImage.startsWith('data:image')) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const base64Data = licenseImage.split(',')[1];
        const mimeType = licenseImage.substring(licenseImage.indexOf(':') + 1, licenseImage.indexOf(';'));

        const prompt = `Extract the doctor's name and PMDC (or PMC) license number from this certificate. Return ONLY a valid JSON object in this format: { "name": "extracted name", "pmdcNumber": "extracted number" }. Ensure the JSON is clean and valid. Do not use markdown backticks like \`\`\`json.`;

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType } }
        ]);

        const text = result.response.text().trim();
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const extracted = JSON.parse(cleanedText);

        const extractedName = (extracted.name || "").toLowerCase();
        const expectedName = doctor.fullName.toLowerCase();
        
        const extractedPMDC = (extracted.pmdcNumber || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const expectedPMDC = doctor.pmdcNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

        // Check if extracted details roughly match the doctor's record
        if (
          extractedName && expectedName && 
          (extractedName.includes(expectedName) || expectedName.includes(extractedName) || extractedName === expectedName) &&
          extractedPMDC && expectedPMDC && 
          extractedPMDC.includes(expectedPMDC)
        ) {
          autoVerified = true;
          verificationNotes = "Auto-verified via AI PMDC Certificate Scan.";
        } else {
          verificationNotes = `AI Scan Mismatch. Found Name: ${extracted.name}, PMDC: ${extracted.pmdcNumber}. Expected Name: ${doctor.fullName}, PMDC: ${doctor.pmdcNumber}`;
        }
      }
    } catch (aiError) {
      console.error("AI Verification Error:", aiError);
      verificationNotes = "AI parsing failed, pending manual review.";
    }

    const finalStatus = autoVerified ? "VERIFIED" : "PENDING";

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        licenseImage,
        cnicImage,
        selfieImage,
        verificationStatus: finalStatus,
        verificationNotes,
        verifiedAt: autoVerified ? new Date() : null,
        verifiedBy: autoVerified ? "AI_SYSTEM" : null,
      },
    });

    const response = NextResponse.json({ 
      message: autoVerified ? "Documents submitted and auto-verified successfully!" : "Verification documents submitted successfully",
      status: updatedDoctor.verificationStatus 
    }, { status: 200 });

    if (autoVerified) {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { id: doctor.id, email: doctor.email, role: doctor.role, verificationStatus: "VERIFIED" },
        process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!",
        { expiresIn: "7d" }
      );
      response.cookies.set({
        name: "medconnect_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Verification Upload Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
