import { GoogleGenAI } from "@google/genai";
import { Experience } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExperienceSummary = async (exp: Partial<Experience>): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI Summary unavailable (No API Key).";
  }

  const prompt = `
    Summarize this placement interview experience into a concise, 3-sentence paragraph highlighting the difficulty, key topics, and outcome.
    
    Company: ${exp.companyName}
    Role: ${exp.role}
    OA Topics: ${exp.oaDetails?.topics.join(", ")}
    Rounds: ${exp.rounds?.map(r => `${r.type} (${r.difficulty})`).join(", ")}
    Result: ${exp.shortlisted ? "Shortlisted" : "Not Shortlisted"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate summary at this time.";
  }
};

export const generateCompanyInsight = async (companyName: string, experiences: Experience[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "AI Insights unavailable.";
    }

    // Aggregate data for the prompt
    const difficulties = experiences.map(e => e.difficultyRating);
    const avgDiff = difficulties.length ? (difficulties.reduce((a, b) => a + b, 0) / difficulties.length).toFixed(1) : "N/A";
    const commonTopics = new Set<string>();
    experiences.forEach(e => e.oaDetails?.topics.forEach(t => commonTopics.add(t)));
    
    const prompt = `
      Provide a "Quick Insight" for ${companyName} based on student experiences.
      Average Difficulty: ${avgDiff}/5
      Common Topics: ${Array.from(commonTopics).slice(0, 10).join(", ")}
      
      Output a 10-point bullet list summary (plain text, no markdown bullets, just lines) for a junior preparing for this company. Focus on pattern of questions and preparation strategy.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Insights unavailable.";
    }
}
