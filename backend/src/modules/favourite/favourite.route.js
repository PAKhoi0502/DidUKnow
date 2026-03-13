import express from "express";
import {
    checkFavouriteByFactIdController,
    createFavouriteController,
    deleteFavouriteByFactIdController,
    getFavouritesController
} from "./favourite.controller.js";
import {
    validateCreateFavourite,
    validateFactIdParam
} from "./favourite.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/favourites:
 *   get:
 *     tags: [Favourite]
 *     summary: Get my favourite facts
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
 *               $ref: '#/components/schemas/FavouriteListApiResponse'
 *       401:
 *         description: unauthorized
 */
router.get("/", authenticate, getFavouritesController);

/**
 * @swagger
 * /api/favourites:
 *   post:
 *     tags: [Favourite]
 *     summary: Add favourite fact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateFavouriteRequestBody'
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavouriteItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         $ref: '#/components/responses/FavouriteDuplicateResponse'
 */
router.post("/", authenticate, validateCreateFavourite, createFavouriteController);

/**
 * @swagger
 * /api/favourites/{fact_id}:
 *   delete:
 *     tags: [Favourite]
 *     summary: Remove favourite by fact id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fact_id
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
 *               $ref: '#/components/schemas/FavouriteItemApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete("/:fact_id", authenticate, validateFactIdParam, deleteFavouriteByFactIdController);

/**
 * @swagger
 * /api/favourites/check/{fact_id}:
 *   get:
 *     tags: [Favourite]
 *     summary: Check favourite status by fact id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fact_id
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
 *               $ref: '#/components/schemas/FavouriteCheckApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 */
router.get("/check/:fact_id", authenticate, validateFactIdParam, checkFavouriteByFactIdController);

export default router;
