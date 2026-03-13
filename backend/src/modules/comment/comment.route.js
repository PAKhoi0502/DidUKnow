import express from "express";
import {
    createCommentController,
    deleteCommentController,
    getCommentsByFactIdController,
    getMyCommentsController,
    updateCommentController
} from "./comment.controller.js";
import {
    validateCommentIdParam,
    validateCreateComment,
    validateFactIdParam,
    validateUpdateComment
} from "./comment.validator.js";
import { authenticate, authenticateOptional } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/comments/facts/{fact_id}:
 *   get:
 *     tags: [Comment]
 *     summary: Get comments by fact id
 *     parameters:
 *       - in: path
 *         name: fact_id
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
 *               $ref: '#/components/schemas/CommentListApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/facts/:fact_id", authenticateOptional, validateFactIdParam, getCommentsByFactIdController);

/**
 * @swagger
 * /api/comments/me:
 *   get:
 *     tags: [Comment]
 *     summary: Get my comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               $ref: '#/components/schemas/CommentListApiResponse'
 *       401:
 *         description: unauthorized
 */
router.get("/me", authenticate, getMyCommentsController);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comment]
 *     summary: Create comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateCommentRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.post("/", authenticate, validateCreateComment, createCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     tags: [Comment]
 *     summary: Update comment by id
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
 *       $ref: '#/components/requestBodies/UpdateCommentRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.patch("/:id", authenticate, validateCommentIdParam, validateUpdateComment, updateCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comment]
 *     summary: Delete comment by id
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
 *               $ref: '#/components/schemas/CommentItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete("/:id", authenticate, validateCommentIdParam, deleteCommentController);

export default router;
