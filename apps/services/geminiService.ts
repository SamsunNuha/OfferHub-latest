const MODEL_NAME = 'gemini-3.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const SYSTEM_INSTRUCTION = 
  "You are 'Offer Lanka AI', the ultimate local shopping assistant for 'OfferHub Sri Lanka'. " +
  "Recommend real-world shopping habits, help discover deals at Keells, Cargills, Glomark, Singer, Odel, Softlogic. " +
  "Keep recommendations concise, bulleted, professional, and optimized for Sri Lankan shoppers in LKR currency.";

export async function getAiRecommendations(prompt: string, apiKey?: string): Promise<string> {
  // If api key is not provided, check process.env or use fallback
  const activeKey = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!activeKey || activeKey === 'MY_GEMINI_API_KEY') {
    console.warn("Gemini API key is not configured. Falling back to offline simulator.");
    return mockOfflineRecommendations(prompt);
  }

  const url = `${BASE_URL}?key=${activeKey}`;
  
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    generationConfig: {
      temperature: 0.7,
      responseModalities: ["TEXT"]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (HTTP ${response.status}):`, errorText);
      return "I'm having trouble retrieving recommendations at the moment. However, we have amazing local deals on Fruits at Keells (20% OFF) and Fashion at Odel (20% OFF)!";
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      return text;
    }
    
    return "Could not generate advice right now. Please explore today's best deals on our home screen!";
  } catch (error) {
    console.error("Gemini request failed:", error);
    return mockOfflineRecommendations(prompt);
  }
}

function mockOfflineRecommendations(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('keells') || q.includes('grocery') || q.includes('food') || q.includes('rice')) {
    return "• Keells Super Savers: Save 20% on all Fruits & Vegetables (valid till next week).\n" +
           "• Cargills Online Keeri Samba 5kg is currently retailing at LKR 1,650 (save 5%).\n" +
           "• Keells Nexus cardholders get an additional 5% off on weekly essentials.";
  }
  
  if (q.includes('singer') || q.includes('tv') || q.includes('electronic') || q.includes('fridge')) {
    return "• Singer Plus: Up to 30% OFF on selected smart TVs and kitchen appliances.\n" +
           "• Softlogic Max: Get 15% cashback when using Commercial Bank Credit Cards for 24-month easy payment plans.\n" +
           "• Abans: LG smart inverter refrigerator available from LKR 245,000.";
  }

  if (q.includes('odel') || q.includes('fashion') || q.includes('shoe') || q.includes('clothe')) {
    return "• Odel Ward Place: 20% OFF on premium accessories and designer wear.\n" +
           "• Nolimit: Earn double points when shopping on weekends using the reward loyalty tier.\n" +
           "• Nike Air Max React Sneakers: Retailing at LKR 48,000 at Decathlon Colombo.";
  }

  return "Offline Mode Assistant: Currently experiencing connection lag. Recommended default: Check Keells Super Savers Pack (Rs. 4,301) to save 39% or Singer electronics up to 30% OFF!";
}

export async function analyzeImageWithGemini(base64Image: string, apiKey?: string): Promise<any> {
  const activeKey = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!activeKey || activeKey === 'MY_GEMINI_API_KEY') {
    console.warn("Gemini API key is not configured. Falling back to offline scanner.");
    return {
      productName: "Keells Premium Pack (Mock)",
      brand: "Keells",
      category: "Groceries",
      estimatedPrice: "LKR 4,300",
      description: "This looks like a grocery bundle from Keells based on offline mock detection."
    };
  }

  const url = `${BASE_URL}?key=${activeKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: "Analyze this image and identify the product. Return a JSON object with productName, brand, category, estimatedPrice (in LKR), and description. Make sure it's valid JSON without markdown wrapping." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Gemini API Error");

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      // Remove possible markdown formatting from Gemini
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Image analysis failed:", error);
  }
  return null;
}
