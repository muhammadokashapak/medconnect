// AI Provider Abstraction Layer

export interface AIResponse {
  content: string;
  providerUsed: string;
  tokens?: number;
}

export async function generateAIResponse(
  systemPrompt: string, 
  userPrompt: string, 
  type: string
): Promise<AIResponse> {
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(combinedPrompt);
    const text = result.response.text();
    return {
      content: text,
      providerUsed: "GEMINI",
      tokens: text.split(" ").length * 1.5 // rough estimate
    };
  } catch (geminiError) {
    console.error("Gemini Error in provider:", geminiError);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });
      const data = await response.json();
      const text = data.choices[0].message.content;
      return {
        content: text,
        providerUsed: "OPENROUTER",
        tokens: data.usage?.total_tokens || 0
      };
    } catch (orError) {
      console.error("OpenRouter Error in provider:", orError);
      return {
        content: "Error: Could not generate response from AI providers.",
        providerUsed: "NONE",
        tokens: 0
      };
    }
  }
}
