import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, QuoteResponse, Job, OptimizationResult, PaymentStatus, Expense, BusinessSettings } from "../types";

// Helper to get AI instance following @google/genai initialization guidelines
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateQuote = async (request: QuoteRequest, settings: BusinessSettings): Promise<QuoteResponse | null> => {
  const ai = getAI();
  if (!ai) return null;

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const workingDaysStr = (settings.workingDays || [1,2,3,4,5]).map(d => daysMap[d]).join(', ');

  const prompt = `
    You are an expert lawn care estimator for ${settings.businessName} in the UK.
    Estimate the price and duration for a lawn mowing job based on these details:
    - Size: ${request.lawnSize}
    - Frequency: ${request.frequency}
    - Address Context: ${request.address} (Consider UK property types generally)
    - Extras: ${request.extras.join(', ') || 'None'}

    Business Pricing Rules:
    - Base Hourly Rate: ${settings.currency}${settings.baseHourlyRate}/hr
    - Small Lawn Base Time: ~30 mins
    - Medium Lawn Base Time: ~45 mins
    - Large Lawn Base Time: ~75 mins
    - Estate Base Time: 120+ mins
    
    Discounts (Apply to the per-mow price):
    - Weekly: ${settings.weeklyDiscount}% off per visit
    - Fortnightly: ${settings.fortnightlyDiscount}% off per visit
    - Monthly: ${settings.monthlyDiscount}% off per visit
    - One-off: Standard per-mow price (no discount)

    Dynamic Pricing Rules (Mandatory):
    1. Overgrown Surcharge: If your final estimated duration is ${settings.overgrownThreshold} minutes or more, you MUST add a flat surcharge of ${settings.currency}${settings.overgrownSurcharge} to the total.
    2. Fuel Surcharge: Use your internal geographic knowledge or tools to estimate the distance from our base (${settings.businessBasePostcode}) to the customer (${request.address}). If the distance is likely more than ${settings.fuelSurchargeRadius}km, you MUST add a travel surcharge of ${settings.currency}${settings.fuelSurchargeAmount}.

    Business Operations:
    - We strictly operate on these days: ${workingDaysStr}.
    - Please mention in the explanation if we can likely fit them in on these days.

    Instructions:
    1. Calculate total duration based on lawn size and extras.
    2. Calculate total base price using hourly rate.
    3. Apply frequency discount.
    4. Check and add the Dynamic Surcharges defined above to the total.
    5. List which surcharges were applied in the response.
    
    Return a JSON object.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      estimatedPrice: { type: Type.NUMBER, description: "Total estimated price per visit in GBP (£) including all surcharges" },
      estimatedDurationMinutes: { type: Type.INTEGER, description: "Estimated time in minutes" },
      explanation: { type: Type.STRING, description: "Brief friendly explanation. Mention why surcharges were added if applicable (e.g. 'includes a small fuel charge for travel')." },
      surchargesApplied: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of surcharge names applied: 'Overgrown Grass', 'Fuel Surcharge', or empty array."
      }
    },
    required: ["estimatedPrice", "estimatedDurationMinutes", "explanation", "surchargesApplied"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as QuoteResponse;
  } catch (error) {
    console.error("Error generating quote:", error);
    return {
      estimatedPrice: settings.baseHourlyRate,
      estimatedDurationMinutes: 60,
      explanation: "We couldn't generate a live quote, so this is a baseline estimate based on average lawn sizes.",
      surchargesApplied: []
    };
  }
};

export const optimizeRoute = async (jobs: Job[], settings: BusinessSettings): Promise<OptimizationResult | null> => {
  const ai = getAI();
  if (!ai) return null;

  const jobListString = jobs.map(j => 
    `ID: ${j.id}, Address: ${j.address}, Postcode: ${j.postcode}, Visit Duration: ${j.durationMinutes}mins`
  ).join('\n');

  const prompt = `
    You are a smart logistics system for a lawn care business. 
    Optimize the driving route for these jobs, considering real-world traffic conditions.
    
    Jobs:
    ${jobListString}

    Parameters:
    - Start Time: ${settings.scheduleStartHour}:00 (Morning Rush Hour Context)
    - Optimization Goal: Minimize total time (drive time + traffic delays).
    
    Task:
    1. Use Google Maps to verify the locations and check typical traffic congestion for a weekday at ${settings.scheduleStartHour}:00.
    2. Reorder the jobs to create the most efficient path.
    
    Output Format:
    Return a RAW JSON object. Do NOT use markdown code blocks.
    JSON Structure:
    {
      "orderedJobIds": ["id1", "id2", ...],
      "reasoning": "Explanation referencing specific roads or traffic patterns found via Google Maps...",
      "efficiencyScore": 95
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
      },
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(text) as OptimizationResult;

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks
      .map((c: any) => c.web?.uri || c.maps?.uri)
      .filter((u: any) => typeof u === 'string');

    if (urls.length > 0) {
      result.groundingUrls = urls;
    }

    return result;
  } catch (error) {
    console.error("Error optimizing route with Maps:", error);
    return {
      orderedJobIds: jobs.map(j => j.id),
      reasoning: "Traffic data unavailable. Using standard sequence.",
      efficiencyScore: 50
    };
  }
};

export const generateCustomerResponse = async (job: Job, action: 'accept' | 'reject'): Promise<string> => {
    const ai = getAI();
    if (!ai) return "Could not generate email.";

    const prompt = `
      You are the owner of JobMow, a professional lawn care service in the UK.
      Write a short, friendly, and professional email to a customer named ${job.customerName}.
      
      Context:
      - Service: Lawn Mowing (${job.lawnSize}, ${job.frequency})
      - Address: ${job.address}
      - Price Quote: £${job.priceQuote}
      
      Action: ${action === 'accept' ? 'Accepting the booking' : 'Declining the booking'}
      
      If Accepting:
      - Confirm we can help.
      - Mention we will be there soon to start.
      - Keep it under 100 words.
      - Use British English spelling (e.g., 'neighbourhood').
      
      If Declining:
      - Politely decline (perhaps due to being fully booked or out of service area).
      - Wish them luck.
      - Keep it under 80 words.

      Return just the email body text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text || "Email generation failed.";
    } catch (e) {
        console.error("Email gen error", e);
        return "Dear Customer, \n\nWe have updated your booking status. Please contact us for details.\n\nThanks,\nJobMow";
    }
};

export const generateInvoiceEmail = async (job: Job, type: 'invoice' | 'receipt'): Promise<string> => {
    const ai = getAI();
    if (!ai) return "Could not generate email.";
    
    const prompt = `
      You are the owner of JobMow, a lawn care business in the UK.
      Write a friendly email to ${job.customerName}.
      
      Details:
      - Service: ${job.frequency} Mowing
      - Address: ${job.address}
      - Amount: £${job.priceQuote}
      - Date Completed: ${job.completedDate || 'Today'}
      
      Task: Write a ${type === 'invoice' ? 'Payment Request / Invoice' : 'Payment Receipt / Thank You'}.
      
      Rules:
      - Keep it short and professional using British English.
      - If Invoice: Politely ask for payment via bank transfer (BACS).
      - If Receipt: Thank them for the payment and say we look forward to the next service.
      
      Return just the body text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text || "Email generation failed.";
    } catch (e) {
        console.error("Invoice email error", e);
        return "Please find attached your invoice/receipt for our recent lawn care service.";
    }
};

export const askBusinessCopilot = async (
  question: string, 
  context: { jobs: Job[], expenses: Expense[] }
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "I'm having trouble connecting to the brain. Please check your internet.";

  const simplifiedJobs = context.jobs.map(j => ({
    name: j.customerName,
    status: j.status,
    amount: j.priceQuote,
    paid: j.paymentStatus === PaymentStatus.PAID,
    date: j.scheduledDate || j.completedDate,
    address: j.address
  }));

  const simplifiedExpenses = context.expenses.map(e => ({
    item: e.title,
    amt: e.amount,
    cat: e.category,
    date: e.date
  }));

  const systemPrompt = `
    You are the "JobMow Copilot", a helpful business assistant for a lawn care company owner.
    
    CURRENT BUSINESS DATA:
    Today is: ${new Date().toLocaleDateString()}
    
    JOBS DATABASE:
    ${JSON.stringify(simplifiedJobs)}
    
    EXPENSES DATABASE:
    ${JSON.stringify(simplifiedExpenses)}
    
    INSTRUCTIONS:
    1. Answer the user's question based strictly on the data above.
    2. If asked to draft a message (email/text), write it professionally in British English.
    3. If asked about profit/revenue, calculate it from the data.
       - Revenue = Sum of 'amount' for jobs where paid is true (or generally all completed jobs if specified).
       - Expenses = Sum of 'amt' in expenses.
    4. Keep answers concise and helpful. Use emoji occasionally.
    5. If you don't have the info, say so.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `User Question: "${question}"`,
      config: {
        systemInstruction: systemPrompt,
      },
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Copilot error:", error);
    return "Sorry, I encountered an error analyzing your business data.";
  }
};

export const generateETAMessage = async (job: Job): Promise<string> => {
    const ai = getAI();
    const fallback = `Hi ${job.customerName}, JobMow is on the way to ${job.address}! See you shortly.`;
    
    if (!ai) return fallback;

    const prompt = `
      You are an automated assistant for a lawn care worker.
      Write a short SMS text (maximum 20 words) to customer ${job.customerName}.
      Message: "I'm on my way".
      Context: Address is ${job.address}.
      If there are notes: "${job.notes || ''}", politely remind them (e.g. unlock gate, dogs inside).
      Sign off: "- JobMow".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text?.trim() || fallback;
    } catch (e) {
        return fallback;
    }
};

export const generateRainDelayMessage = async (newDate: string): Promise<string> => {
    const ai = getAI();
    const dateObj = new Date(newDate);
    const dateStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' });
    
    const fallback = `Hi, due to rain we've moved your mow to ${dateStr}. Thanks, JobMow`;
    
    if (!ai) return fallback;

    const prompt = `
      Write a friendly SMS (under 25 words) from 'JobMow'.
      Topic: Rescheduling appointment due to rain.
      New Date: ${dateStr}.
      Tone: Helpful, slight apology.
      Don't include placeholders like [Name], make it generic enough to send to everyone.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text?.trim() || fallback;
    } catch (e) {
        return fallback;
    }
};

export const generateReviewRequest = async (job: Job): Promise<string> => {
    const ai = getAI();
    const fallback = `Hi ${job.customerName}, thanks for the payment! If you're happy with the lawn, a quick review would be amazing: [LINK]`;

    if (!ai) return fallback;

    const prompt = `
      Write a short, friendly SMS/text (under 30 words) to ${job.customerName}.
      Context: They just paid for their lawn mowing.
      Goal: Ask for a Google Review (I will insert the link later).
      Tone: Grateful, polite, not pushy.
      Sign off: JobMow.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text?.trim() || fallback;
    } catch (e) {
        return fallback;
    }
};