import express from "express";
import { getSupportedLanguagesController } from "./language.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/languages/supported:
 *   get:
 *     tags: [Language]
 *     summary: Get supported languages
 *     description: Public endpoint for frontend language configuration.
 *     responses:
 *       200:
 *         description: success
 */
router.get("/supported", getSupportedLanguagesController);

export default router;
