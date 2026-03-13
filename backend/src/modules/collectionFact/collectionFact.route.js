import express from "express";
import {
    createCollectionFactController,
    deleteCollectionFactController,
    getCollectionFactsController
} from "./collectionFact.controller.js";
import {
    validateCollectionIdParam,
    validateCreateCollectionFact,
    validateFactIdParam
} from "./collectionFact.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/collection-facts:
 *   post:
 *     tags: [CollectionFact]
 *     summary: Add fact to collection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateCollectionFactRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionFactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/CollectionFactDuplicateResponse'
 */
router.post("/", authenticate, validateCreateCollectionFact, createCollectionFactController);

/**
 * @swagger
 * /api/collection-facts/collections/{collection_id}:
 *   get:
 *     tags: [CollectionFact]
 *     summary: Get facts in collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
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
 *               $ref: '#/components/schemas/CollectionFactListApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/collections/:collection_id", authenticate, validateCollectionIdParam, getCollectionFactsController);

/**
 * @swagger
 * /api/collection-facts/collections/{collection_id}/facts/{fact_id}:
 *   delete:
 *     tags: [CollectionFact]
 *     summary: Remove fact from collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *       - in: path
 *         name: fact_id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf96
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionFactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete(
    "/collections/:collection_id/facts/:fact_id",
    authenticate,
    validateCollectionIdParam,
    validateFactIdParam,
    deleteCollectionFactController
);

export default router;
