const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async generateReelContent(mood, niche, musicType) {
        const prompt = `
            Act as a viral Instagram Reel expert. Generate a complete content package for a reel with the following details:
            Mood: ${mood}
            Niche: ${niche}
            Music Type: ${musicType}

            Return the response in strictly JSON format with the following keys:
            "aiCaption": A story-driven engaging caption with emojis.
            "aiHooks": An array of 3 viral hook lines.
            "aiHashtags": An array of 20 trending hashtags.
            "aiStoryboard": An array of objects each with "shot" (number), "description", and "visualSuggestion".
            "thumbnailText": A bold text overlay suggestion for the thumbnail.
            "ctaSuggestions": An array of 3-5 call-to-action suggestions.

            Do not include any markdown formatting or extra text outside the JSON.
        `;

        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-pro-latest",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {

                const model = this.genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Basic JSON cleaning if Gemini wraps it in code blocks
                const jsonStr = text.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(jsonStr);

                return parsed;
            } catch (error) {
                console.error(`Error with model ${modelName}:`, error.message || error);
                lastError = error;
            }
        }

        console.error('All Gemini AI models failed. Last error:', lastError);
        throw new Error('Failed to generate AI content');
    }
}

module.exports = new AIService();
