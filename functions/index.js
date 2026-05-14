import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Define the schema once outside to keep the handler clean
const animalSchema = {
    type: "object",
    properties: {
        species: { type: "string", enum: ["dog", "cat", "unknown"] },
        breed: { type: "string", description: "Likely breed, e.g., 'Malaysian Kampung Dog' or 'Tabby'" },
        color: { type: "string" },
        isNeutered: { type: "boolean", description: "True if a cat has a tipped ear or notch" },
        healthStatus: { type: "string", description: "Summary of visible health, e.g., 'Skin infection', 'Underweight', 'Healthy'" },
        distinctiveFeatures: { type: "string", description: "Markings like 'white socks', 'collar', or 'scar'" },
        isEmergency: { type: "boolean", description: "True if the animal appears injured or in critical condition" }
    },
    required: ["species", "breed", "color", "isNeutered", "healthStatus", "isEmergency"]
};

export const analyzeAnimal = onRequest(
    {
        region: "us-central1",
        secrets: [GEMINI_API_KEY],
        timeoutSeconds: 60,
    },
    async (req, res) => {
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());

            // Apply the Schema and JSON configuration here
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: animalSchema,
                }
            });

            const { imageBase64, mimeType } = req.body;

            if (!imageBase64) {
                const result = await model.generateContent("Say OK if you are working.");
                return res.json({
                    message: "No image found, running text test.",
                    test: result.response.text()
                });
            }

            // The Malaysian-specific rescue prompt
            const prompt = `
                Act as a Malaysian animal rescue expert. Analyze this image for a stray animal report.
                
                CRITICAL INDICATORS:
                - CATS: Look for a "tipped ear" (the top 1cm of the left ear removed). This is the standard Malaysian sign for a neutered community cat.
                - HEALTH: Check for common local issues: mange (kurap), open wounds, severe thinness, or eye infections.
                - IDENTITY: Describe markings clearly so rescuers can find this specific animal again.
                
                Output the result in the specified JSON format.
            `;

            const imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType || "image/jpeg",
                },
            };

            const result = await model.generateContent([prompt, imagePart]);

            // Parse and return the structured JSON
            const responseData = JSON.parse(result.response.text());
            res.json(responseData);

        } catch (err) {
            console.error("PawGuard AI Error:", err);
            res.status(500).json({
                error: "Analysis failed",
                message: err.message
            });
        }
    }
);