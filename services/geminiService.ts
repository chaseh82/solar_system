import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getPlanetFunFact = async (planetName: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key unavailable. Unable to fetch data.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tell me a fascinating, short, scientific fact about the planet (or dwarf planet) ${planetName} that a general user might not know. Keep it under 40 words. Do not start with 'Did you know'.`,
    });
    
    return response.text || "No information available.";
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return "Unable to contact the Cosmic Archive (Gemini API Error).";
  }
};
