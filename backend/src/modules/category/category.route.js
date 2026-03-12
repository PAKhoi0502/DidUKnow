import express from "express";
import {
    createCategoryController,
    deleteCategoryController,
    getCategoriesController,
    getCategoryByIdController,
    upsertCategoryTranslationController,
    updateCategoryController
} from "./category.controller.js";
import {
    validateCategoryIdParam,
    validateCategoryTranslationLanguageParam,
    validateCreateCategory,
    validateUpdateCategory,
    validateUpsertCategoryTranslation
} from "./category.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Category]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/", getCategoriesController);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Category]
 *     summary: Get category by id
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
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/:id", validateCategoryIdParam, getCategoryByIdController);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Category]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateCategoryRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CreatedResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       409:
 *         $ref: '#/components/responses/CategoryDuplicateResponse'
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Admin"),
    validateCreateCategory,
    createCategoryController
);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     tags: [Category]
 *     summary: Update category by id
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
 *       $ref: '#/components/requestBodies/UpdateCategoryRequestBody'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/CategoryDuplicateResponse'
 */
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateCategoryIdParam,
    validateUpdateCategory,
    updateCategoryController
);

/**
 * @swagger
 * /api/categories/{id}/translations/{language}:
 *   put:
 *     tags: [Category]
 *     summary: Upsert category translation by language
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
 *       $ref: '#/components/requestBodies/UpsertCategoryTranslationRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryTranslationItemApiResponse'
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
    authorizeRoles("Admin"),
    validateCategoryIdParam,
    validateCategoryTranslationLanguageParam,
    validateUpsertCategoryTranslation,
    upsertCategoryTranslationController
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Category]
 *     summary: Delete category by id
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
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/CategoryInUseResponse'
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateCategoryIdParam,
    deleteCategoryController
);

export default router;
