import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Goal, ImprovementPlan } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please configure it in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeAccent = async (audioBase64: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = getAI();
  
  // Using gemini-2.5-flash which supports audio and is more stable
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze this audio for English accent characteristics. 
    Perform a deep phonetic and acoustic analysis.
    
    1. Transcribe the text.
    2. Extract phonetic features: vowel pronunciation, consonant clarity, rhythm, stress patterns, and intonation.
    3. Compare the speech against these global accent categories and provide a similarity score (0-100) for EACH:
       - American General
       - Canadian
       - New York
       - Southern US
       - RP British
       - London Cockney
       - Northern UK
       - Irish
       - Scottish
       - European ESL English
       - Indian
       - Pakistani
       - Filipino
       - Singaporean
       - Australian
       - New Zealand
       - South African
       - Nigerian English
       - Arabic English
       - Middle Eastern English
       - International Neutral English
    
    4. Identify the top matching accent and provide a confidence level.
    5. If the speech is unclear or not English, set confidence to low.
    
    Return the response strictly in JSON format with the following structure:
    {
      "transcription": "...",
      "phoneticAnalysis": {
        "vowels": "...",
        "consonants": "...",
        "rhythm": "...",
        "intonation": "..."
      },
      "scores": {
        "American General": 85.5,
        ...
      },
      "topMatch": "...",
      "confidence": 0.92,
      "feedback": "..."
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: audioBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.text;
    if (!responseText) {
      throw new Error("Empty response from AI. Please try speaking more clearly.");
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Detailed Analysis Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The Gemini API key is invalid. Please ensure it is correctly set in the Secrets panel.");
    }
    throw new Error(error.message || "Failed to analyze accent. Please try again.");
  }
};

export const generateImprovementPlan = async (goal: Goal, topMatch: string, phoneticAnalysis: any): Promise<ImprovementPlan> => {
  const ai = getAI();
  
  const prompt = `
    Based on the user's current accent (${topMatch}) and their goal (${goal}), 
    create a personalized accent improvement plan.
    
    Current Phonetic Profile: ${JSON.stringify(phoneticAnalysis)}
    
    Provide:
    1. A summary of the improvement strategy.
    2. 3 specific daily training exercises.
    3. A speech shadowing script tailored to their goal.
    4. 5 key pronunciation focus points.
    
    Return the response in Markdown format.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });

    return { plan: result.text || "" };
  } catch (error: any) {
    console.error("Plan generation error:", error);
    throw new Error(error.message || "Failed to generate plan");
  }
};
