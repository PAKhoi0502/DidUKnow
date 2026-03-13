import express from "express";
import { getFactViewSummaryByFactIdController } from "./factView.controller.js";
import { validateFactIdParam, validateFactViewSummaryQuery } from "./factView.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/fact-views/facts/{fact_id}/summary:
 *   get:
 *     tags: [FactView]
 *     summary: Get fact view summary by fact id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fact_id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-03-01T00:00:00.000Z
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-03-31T23:59:59.000Z
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactViewSummaryApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.get(
    "/facts/:fact_id/summary",
    authenticate,
    authorizeRoles("Admin", "Editor"),
    validateFactIdParam,
    validateFactViewSummaryQuery,
    getFactViewSummaryByFactIdController
);

export default router;
