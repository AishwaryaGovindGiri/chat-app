import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ---------------- AI CHAT ----------------
export const chatWithAI = async (req, res) => {
    try {
        console.log("AI request received");

        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required",
            });
        }

        console.log("Sending request to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: message,
        });

        console.log("Gemini response received");

        res.json({
            success: true,
            reply: response.text,
        });

    } catch (error) {
        console.log("Gemini AI Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to get AI response",
        });
    }
};


// ---------------- AI REPLY SUGGESTIONS ----------------
export const generateReplySuggestions = async (req, res) => {
    try {
        console.log("Generating AI reply suggestions...");

        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required",
            });
        }

        const prompt = `
You are helping a user reply to a chat message.

The other person said:
"${message}"

Generate exactly 3 short and natural reply suggestions.

Rules:
- Each reply should be different in tone.
- Keep each reply under 15 words.
- Make them sound like something a real person would send.
- Do not number them.
- Return ONLY the 3 replies, each on a new line.
`;

        console.log("Sending suggestions request to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });

        console.log("Suggestions response received");

        const suggestions = response.text
            .split("\n")
            .map((suggestion) =>
                suggestion
                    .replace(/^[-*•]\s*/, "")
                    .replace(/^\d+[\).\s]+/, "")
                    .trim()
            )
            .filter(Boolean)
            .slice(0, 3);

        res.json({
            success: true,
            suggestions,
        });

    } catch (error) {
        console.log(
            "Gemini Suggestions Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate reply suggestions",
        });
    }
};


// ---------------- AI GIF / STICKER SEARCH ----------------
export const generateReactionSearch = async (req, res) => {
    try {
        console.log("Generating AI reaction search...");

        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required",
            });
        }

        const prompt = `
You are helping choose a GIF or sticker reaction for a chat message.

The other person said:
"${message}"

Understand the emotion, situation, and tone of the message.

Create ONE short search phrase that would find a suitable
GIF or sticker reaction on GIPHY.

Examples:

Message:
"I finally got the job!"
Search:
happy celebration excited reaction

Message:
"Bro I failed my exam 😭"
Search:
sad crying disappointed reaction

Message:
"What did you just say?!"
Search:
shocked confused reaction

Message:
"That was so stupid 😂"
Search:
laughing funny reaction

Rules:
- Return ONLY the search phrase.
- Use 2 to 6 words.
- Do not use quotes.
- Do not explain anything.
- Do not mention GIPHY.
`;

        console.log("Sending reaction request to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });

        const searchQuery = response.text
            .trim()
            .replace(/^["']|["']$/g, "")
            .replace(/\n/g, " ");

        console.log("AI reaction search:", searchQuery);

        res.json({
            success: true,
            searchQuery,
        });

    } catch (error) {
        console.log(
            "Gemini Reaction Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate reaction search",
        });
    }
};