import { GoogleGenAI } from "@google/genai";

export const getMarketAnalysis = async (marketData: string) => {
  const API_KEY = "AIzaSyApYGJ98fWG9dpxWpphyrjfvCBvgPuwnf0";
  if (!API_KEY) {
    console.warn("API Key not found");
    return "AI Analysis unavailable without API Key.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI Request Timeout")), 60000)
    );

    const aiCallPromise = ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `You are a senior high-frequency trading analyst for an exclusive platform called ScalperHub. 
      Analyze the following market condition context and provide a short, punchy, "cyberpunk-style" trading signal (Bullish/Bearish) and a 1-sentence reasoning.
      
      Context: ${marketData}
      
      Format:
      SIGNAL: [BULLISH/BEARISH]
      INSIGHT: [Reasoning]`,
    });
    
    const response: any = await Promise.race([aiCallPromise, timeoutPromise]);
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};