import { GoogleGenAI } from "@google/genai";
import { QuoteRequest, QuoteResponse, Job, OptimizationResult, PaymentStatus, Expense, BusinessSettings } from "../types";

// Helper to get AI instance
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key missing in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// generateQuote function removed in favor of services/quoteService.ts manual calculation.

export const optimizeRoute = async (jobs: Job[], settings: BusinessSettings): Promise<OptimizationResult | null> => {
  const ai = getAI();
  if (!ai) return null;

  const systemPrompt = `
    You are an expert route optimizer.
    Return RAW JSON: { "orderedJobIds": string[], "reasoning": string, "efficiencyScore": number }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Jobs: ${JSON.stringify(jobs)}`,
      config: {
        systemInstruction: systemPrompt
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text) as OptimizationResult;
  } catch (error) {
    console.error("Error optimizing route:", error);
    return {
      orderedJobIds: jobs.map(j => j.id),
      reasoning: "Optimization unavailable.",
      efficiencyScore: 50
    };
  }
};

export const generateCustomerResponse = async (job: Job, action: 'accept' | 'reject'): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Could not generate message.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Action: ${action} for ${job.customer_name} at ${job.address}. Write a short friendly email.`
    });
    return response.text || "Message generation failed.";
  } catch (e) {
    return "Status updated.";
  }
};

export const generateInvoiceEmail = async (job: Job, type: 'invoice' | 'receipt'): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Could not generate invoice email.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Task: ${type} for ${job.customer_name} (£${job.price_quote}). Write a friendly email.`
    });
    return response.text || "Email generation failed.";
  } catch (e) {
    return "See attached invoice.";
  }
};

export const askBusinessCopilot = async (
  question: string,
  context: { jobs: Job[], expenses: Expense[] }
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Copilot unavailable.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Question: ${question}, Context: ${JSON.stringify(context)}`,
      config: {
        systemInstruction: "You are the JobMow Copilot. Be helpful and data-driven."
      }
    });
    return response.text || "I couldn't analyze that.";
  } catch (error) {
    return "Error analyzing data.";
  }
};

export const generateETAMessage = async (job: Job): Promise<string> => {
  const ai = getAI();
  if (!ai) return "I'm on my way!";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `SMS to ${job.customer_name}: "I'm on my way to ${job.address}". 15 words max.`
    });
    return response.text?.trim() || "I'm on my way!";
  } catch (e) {
    return "On my way!";
  }
};

export const generateRainDelayMessage = async (newDate: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Rescheduled due to rain.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `SMS for rain delay, moving to ${newDate}. 20 words max.`
    });
    return response.text?.trim() || "Rescheduled due to rain.";
  } catch (e) {
    return "Rescheduled.";
  }
};

export const generateReviewRequest = async (job: Job): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Please leave us a review!";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `SMS asking ${job.customer_name} for a review. 20 words max.`
    });
    return response.text?.trim() || "Please leave a review!";
  } catch (e) {
    return "Review requested.";
  }
};
