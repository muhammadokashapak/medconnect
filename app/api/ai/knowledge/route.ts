import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ message: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        response: `[
          { "title": "API Key Missing", "content": "To enable real AI responses, please add OPENROUTER_API_KEY to your .env file. This is a fallback simulated response." },
          { "title": "Disease Overview", "content": "This is a simulated overview for ${query}. Real data will appear here once the API is connected." },
          { "title": "Symptoms", "content": "Simulated symptoms include A, B, and C." },
          { "title": "Causes & Risk Factors", "content": "Simulated causes." },
          { "title": "Cure & Treatment", "content": "Simulated treatments." }
        ]` 
      }, { status: 200 });
    }

    const prompt = `You are MedConnect's elite clinical AI, acting as a highly advanced medical encyclopedia. 
Your purpose is to provide structured, comprehensive, and scientifically accurate medical information about diseases or clinical conditions.

Format your response STRICTLY as a raw JSON array of objects. Do not include any markdown code blocks like \`\`\`json. Just output the raw array.
Each object must have exactly two keys: "title" and "content".
Provide 6 flashcards exactly with these titles:
1. "Disease Overview" (A high-level clinical summary)
2. "Symptoms" (Detailed list of early, common, and severe symptoms)
3. "Causes & Risk Factors" (Biological mechanisms, pathogens, genetics, or lifestyle factors)
4. "Effects & Complications" (Short-term and long-term effects on the body)
5. "Detection & Diagnosis" (Laboratory tests, imaging, or clinical criteria used to identify it)
6. "Cure & Treatment" (Medications, therapies, lifestyle changes, or surgical interventions)

For the requested disease or medical query: "${query}". Provide the 6 flashcards. Keep the content inside the JSON strings concise but highly informative. Use bullet points (using standard dash '-') within the text string if it helps readability.

If the query is completely unrelated to medicine, health, or biology, return a single flashcard with title "Error" and content "This query is unrelated to medicine."`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MedConnect",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000
      })
    });

    const data = await openRouterRes.json();

    if (!openRouterRes.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
    }

    const text = data.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ response: text }, { status: 200 });
  } catch (error) {
    console.error("AI Knowledge Search Error:", error);
    return NextResponse.json({ message: "Server Error", error: String(error) }, { status: 500 });
  }
}
