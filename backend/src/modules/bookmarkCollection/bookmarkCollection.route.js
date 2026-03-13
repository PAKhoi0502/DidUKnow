import express from "express";
import {
    createBookmarkCollectionController,
    deleteMyBookmarkCollectionController,
    getMyBookmarkCollectionByIdController,
    getMyBookmarkCollectionsController,
    updateMyBookmarkCollectionController
} from "./bookmarkCollection.controller.js";
import {
    validateCollectionIdParam,
    validateCreateBookmarkCollection,
    validateUpdateBookmarkCollection
} from "./bookmarkCollection.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/bookmark-collections:
 *   get:
 *     tags: [BookmarkCollection]
 *     summary: Get my bookmark collections
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
 *               $ref: '#/components/schemas/BookmarkCollectionListApiResponse'
 *       401:
 *         description: unauthorized
 */
router.get("/", authenticate, getMyBookmarkCollectionsController);

/**
 * @swagger
 * /api/bookmark-collections/{id}:
 *   get:
 *     tags: [BookmarkCollection]
 *     summary: Get my bookmark collection by id
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
 *               $ref: '#/components/schemas/BookmarkCollectionItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.get("/:id", authenticate, validateCollectionIdParam, getMyBookmarkCollectionByIdController);

/**
 * @swagger
 * /api/bookmark-collections:
 *   post:
 *     tags: [BookmarkCollection]
 *     summary: Create bookmark collection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateBookmarkCollectionRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookmarkCollectionItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       409:
 *         $ref: '#/components/responses/BookmarkCollectionDuplicateResponse'
 */
router.post("/", authenticate, validateCreateBookmarkCollection, createBookmarkCollectionController);

/**
 * @swagger
 * /api/bookmark-collections/{id}:
 *   patch:
 *     tags: [BookmarkCollection]
 *     summary: Update bookmark collection by id
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
 *       $ref: '#/components/requestBodies/UpdateBookmarkCollectionRequestBody'
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookmarkCollectionItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/BookmarkCollectionDuplicateResponse'
 */
router.patch(
    "/:id",
    authenticate,
    validateCollectionIdParam,
    validateUpdateBookmarkCollection,
    updateMyBookmarkCollectionController
);

/**
 * @swagger
 * /api/bookmark-collections/{id}:
 *   delete:
 *     tags: [BookmarkCollection]
 *     summary: Delete bookmark collection by id
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
 *               $ref: '#/components/schemas/BookmarkCollectionItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete("/:id", authenticate, validateCollectionIdParam, deleteMyBookmarkCollectionController);

export default router;
