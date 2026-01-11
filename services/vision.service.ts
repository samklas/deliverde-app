import Constants from "expo-constants";
import {
  readAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { VegetableAnalysisResult } from "@/types/vision";

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return base64;
};

export const analyzeVegetableImage = async (
  imageUri: string
): Promise<VegetableAnalysisResult[]> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "your_openai_api_key") {
    throw new Error("OpenAI API key is not configured");
  }

  const base64Image = await convertImageToBase64(imageUri);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify all vegetables visible. Estimate the weight in grams based on the visual size of each vegetable.

Return a JSON array with the following format:
[{"name": "vegetable name in Finnish", "confidence": 0.0-1.0, "estimatedGrams": number}]

Guidelines for gram estimation:
- Small tomato: ~80g, medium: ~120g, large: ~180g
- Cucumber: ~200-300g
- Carrot: small ~50g, medium ~80g, large ~120g
- Onion: small ~70g, medium ~150g, large ~250g
- Bell pepper: ~150-200g
- Broccoli floret: ~30-50g, whole head: ~300-500g
- Potato: small ~100g, medium ~170g, large ~280g
- Lettuce leaf: ~10-20g, whole head: ~300-500g

Common Finnish vegetable names:
- tomato = tomaatti
- cucumber = kurkku
- carrot = porkkana
- onion = sipuli
- lettuce = salaatti
- bell pepper = paprika
- broccoli = parsakaali
- potato = peruna
- zucchini = kesäkurpitsa
- spinach = pinaatti
- cabbage = kaali
- cauliflower = kukkakaali
- peas = herneet
- beans = pavut
- corn = maissi
- eggplant = munakoiso
- garlic = valkosipuli
- leek = purjo
- celery = selleri
- radish = retiisi
- beetroot = punajuuri
- avocado = avokado

Only include vegetables, not fruits. Be specific about the type.
If you cannot identify any vegetables, return an empty array [].
Return ONLY the JSON array, no other text.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("OpenAI response data:", data);
  const content = data.choices[0]?.message?.content;

  if (!content) {
    return [];
  }

  try {
    // Clean the response in case there's markdown formatting
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleanedContent);
  } catch {
    console.error("Failed to parse AI response:", content);
    return [];
  }
};
