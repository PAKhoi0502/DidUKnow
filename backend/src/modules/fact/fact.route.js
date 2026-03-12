import express from "express";
import {
    createFactController,
    deleteFactController,
    getFactByIdController,
    getFactsController,
    getRandomFactController,
    upsertFactTranslationController,
    updateFactController,
    updateFactStatusController
} from "./fact.controller.js";
import {
    validateCreateFact,
    validateFactIdParam,
    validateFactTranslationLanguageParam,
    validateUpdateFact,
    validateUpdateFactStatus,
    validateUpsertFactTranslation
} from "./fact.validator.js";
import { authenticate, authenticateOptional } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/facts:
 *   get:
 *     tags: [Fact]
 *     summary: Get fact list
 *     description: Public endpoint. Guests can only see published facts.
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Admin/Editor only filter
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
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
 *               $ref: '#/components/schemas/FactListApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 */
router.get("/", authenticateOptional, getFactsController);

/**
 * @swagger
 * /api/facts/random:
 *   get:
 *     tags: [Fact]
 *     summary: Get random fact
 *     description: Public endpoint. Returns one random published fact across all categories or within a specific category.
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional category filter
 *       - in: query
 *         name: exclude_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional fact id to exclude from random result
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/random", authenticateOptional, getRandomFactController);

/**
 * @swagger
 * /api/facts:
 *   post:
 *     tags: [Fact]
 *     summary: Create a new fact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateFactRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Admin", "Editor"),
    validateCreateFact,
    createFactController
);

/**
 * @swagger
 * /api/facts/{id}:
 *   get:
 *     tags: [Fact]
 *     summary: Get fact by id
 *     description: Public endpoint. Draft facts are restricted by service-level authorization.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/:id", authenticateOptional, validateFactIdParam, getFactByIdController);

/**
 * @swagger
 * /api/facts/{id}:
 *   patch:
 *     tags: [Fact]
 *     summary: Update fact by id
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
 *       $ref: '#/components/requestBodies/UpdateFactRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
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
    "/:id",
    authenticate,
    validateFactIdParam,
    validateUpdateFact,
    updateFactController
);

/**
 * @swagger
 * /api/facts/{id}/status:
 *   patch:
 *     tags: [Fact]
 *     summary: Update fact status by id
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
 *       $ref: '#/components/requestBodies/UpdateFactStatusRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
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
    authorizeRoles("Admin"),
    validateFactIdParam,
    validateUpdateFactStatus,
    updateFactStatusController
);

/**
 * @swagger
 * /api/facts/{id}/translations/{language}:
 *   put:
 *     tags: [Fact]
 *     summary: Upsert fact translation by language
 *     description: Requires authentication. Service-level authorization allows owner or admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [vi, en]
 *         example: vi
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpsertFactTranslationRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactTranslationItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.put(
    "/:id/translations/:language",
    authenticate,
    validateFactIdParam,
    validateFactTranslationLanguageParam,
    validateUpsertFactTranslation,
    upsertFactTranslationController
);

/**
 * @swagger
 * /api/facts/{id}:
 *   delete:
 *     tags: [Fact]
 *     summary: Delete fact by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ceca911fdb988f26fcbf95
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete(
    "/:id",
    authenticate,
    validateFactIdParam,
    deleteFactController
);

export default router;
