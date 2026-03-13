import express from "express";
import {
    createTagController,
    deleteTagController,
    getTagByIdController,
    getTagsController,
    updateTagController
} from "./tag.controller.js";
import {
    validateCreateTag,
    validateTagIdParam,
    validateUpdateTag
} from "./tag.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags: [Tag]
 *     summary: Get all tags
 *     responses:
 *       200:
 *         description: success
 */
router.get("/", getTagsController);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     tags: [Tag]
 *     summary: Get tag by id
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
router.get("/:id", validateTagIdParam, getTagByIdController);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags: [Tag]
 *     summary: Create a new tag
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateTagRequestBody'
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
 *         $ref: '#/components/responses/TagDuplicateResponse'
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Admin"),
    validateCreateTag,
    createTagController
);

/**
 * @swagger
 * /api/tags/{id}:
 *   patch:
 *     tags: [Tag]
 *     summary: Update tag by id
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
 *       $ref: '#/components/requestBodies/UpdateTagRequestBody'
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
 *         $ref: '#/components/responses/TagDuplicateResponse'
 */
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateTagIdParam,
    validateUpdateTag,
    updateTagController
);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     tags: [Tag]
 *     summary: Delete tag by id
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
 *         $ref: '#/components/responses/TagInUseResponse'
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateTagIdParam,
    deleteTagController
);

export default router;
