import { GoogleGenAI } from "@google/genai";

export const getMarketAnalysis = async (marketData: string) => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return "AI Analysis unavailable without API Key.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `You are a senior high-frequency trading analyst for an exclusive platform called ScalperHub. 
      Analyze the following market condition context and provide a short, punchy, "cyberpunk-style" trading signal (Bullish/Bearish) and a 1-sentence reasoning.
      
      Context: ${marketData}
      
      Format:
      SIGNAL: [BULLISH/BEARISH]
      INSIGHT: [Reasoning]`,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};