
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Tone, ResponseLength, ResponseStyle } from "../types";
import { SYSTEM_PROMPT, DEFAULT_ADMIN_CONFIG } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Nettoyage radical pour garantir un texte pur, sans aucun symbole technique
   */
  private cleanText(text: string): string {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/_/g, "")
      .replace(/`/g, "")
      .replace(/> /g, "")
      .replace(/^- /gm, "")
      .replace(/^(\d+)\. /gm, "$1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Supprime les liens MD mais garde le texte
      .trim();
  }

  async streamResponse(
    prompt: string, 
    tone: Tone, 
    onChunk: (text: string) => void,
    behavior: string = DEFAULT_ADMIN_CONFIG.aiBehavior,
    specs: string[] = DEFAULT_ADMIN_CONFIG.specializations,
    length: ResponseLength = DEFAULT_ADMIN_CONFIG.responseLength,
    style: ResponseStyle = DEFAULT_ADMIN_CONFIG.responseStyle,
    history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
  ) {
    try {
      const result = await this.ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT(tone, behavior, specs, length, style),
          temperature: 0.8, // Légèrement plus haut pour plus de "naturel"
        },
      });

      let fullText = "";
      for await (const chunk of result) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(this.cleanText(fullText));
        }
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      onChunk("Désolé, j'ai rencontré un petit souci technique. Peux-tu reformuler ta demande ?");
    }
  }
}

export const geminiService = new GeminiService();
