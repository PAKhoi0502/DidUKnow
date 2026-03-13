import express from "express";
import {
    createReportFactController,
    getAllReportFactsController,
    getMyReportFactsController,
    updateReportFactStatusController
} from "./reportFact.controller.js";
import {
    validateCreateReportFact,
    validateReportFactListQuery,
    validateReportFactStatusUpdate,
    validateReportIdParam
} from "./reportFact.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/report-facts:
 *   post:
 *     tags: [ReportFact]
 *     summary: Create report for a fact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateReportFactRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportFactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/ReportFactDuplicateResponse'
 */
router.post("/", authenticate, validateCreateReportFact, createReportFactController);

/**
 * @swagger
 * /api/report-facts/me:
 *   get:
 *     tags: [ReportFact]
 *     summary: Get my report facts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, reviewing, resolved, rejected]
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportFactListApiResponse'
 *       401:
 *         description: unauthorized
 */
router.get("/me", authenticate, validateReportFactListQuery, getMyReportFactsController);

/**
 * @swagger
 * /api/report-facts:
 *   get:
 *     tags: [ReportFact]
 *     summary: Get all report facts (admin/editor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, reviewing, resolved, rejected]
 *       - in: query
 *         name: fact_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportFactListApiResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("Admin", "Editor"),
    validateReportFactListQuery,
    getAllReportFactsController
);

/**
 * @swagger
 * /api/report-facts/{id}/status:
 *   patch:
 *     tags: [ReportFact]
 *     summary: Update report fact status (admin/editor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateReportFactStatusRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportFactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.patch(
    "/:id/status",
    authenticate,
    authorizeRoles("Admin", "Editor"),
    validateReportIdParam,
    validateReportFactStatusUpdate,
    updateReportFactStatusController
);

export default router;
