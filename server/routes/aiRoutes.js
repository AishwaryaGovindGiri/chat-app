import express from "express";

import {
    chatWithAI,
    generateReplySuggestions,
    generateReactionSearch
} from "../controllers/aiController.js";

import { protectRoute } from "../middleware/auth.js";

const aiRouter = express.Router();


// AI Assistant
aiRouter.post(
    "/chat",
    protectRoute,
    chatWithAI
);


// AI Reply Suggestions
aiRouter.post(
    "/suggestions",
    protectRoute,
    generateReplySuggestions
);


// AI GIF / Sticker Reaction
aiRouter.post(
    "/reaction",
    protectRoute,
    generateReactionSearch
);


export default aiRouter;