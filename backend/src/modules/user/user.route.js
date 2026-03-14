import express from "express";
import {
    createUserController,
    deleteUserController,
    getMyProfileController,
    getUsersController,
    loginUserController,
    logoutUserController,
    refreshUserTokenController,
    updateMyProfileController,
    updateUserController,
    updateUserRoleController,
    updateMyLanguageController
} from "./user.controller.js";
import {
    validateCreateUser,
    validateGetUsersQuery,
    validateLoginUser,
    validateLogout,
    validateRefreshToken,
    validateUpdateLanguage,
    validateUpdateMyProfile,
    validateUpdateUserRole,
    validateUpdateUser,
    validateUserIdParam
} from "./user.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import {
    createUserRateLimit,
    loginAccountRateLimit,
    loginIpRateLimit,
    refreshTokenRateLimit
} from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [User]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: success
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.get("/", authenticate, authorizeRoles("Admin"), validateGetUsersQuery, getUsersController);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [User]
 *     summary: Create a new user
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateUserRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CreatedResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       409:
 *         $ref: '#/components/responses/UserDuplicateResponse'
 */
router.post("/", createUserRateLimit, validateCreateUser, createUserController);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Login]
 *     summary: Login user
 *     requestBody:
 *       $ref: '#/components/requestBodies/LoginUserRequestBody'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: invalid credentials
 */
router.post("/login", loginIpRateLimit, loginAccountRateLimit, validateLoginUser, loginUserController);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     tags: [Login]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: invalid refresh token
 */
router.post("/refresh-token", refreshTokenRateLimit, validateRefreshToken, refreshUserTokenController);

router.post("/logout", validateLogout, logoutUserController);

/**
 * @swagger
 * /api/users/me/language:
 *   patch:
 *     tags: [Language]
 *     summary: Update my language
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateLanguageRequestBody'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 */
router.patch("/me/language", authenticate, validateUpdateLanguage, updateMyLanguageController);
router.get("/me", authenticate, getMyProfileController);
router.patch("/me", authenticate, validateUpdateMyProfile, updateMyProfileController);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     tags: [User]
 *     summary: Update user role by id
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
 *       $ref: '#/components/requestBodies/UpdateUserRoleRequestBody'
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
 */
router.patch(
    "/:id/role",
    authenticate,
    authorizeRoles("Admin"),
    validateUserIdParam,
    validateUpdateUserRole,
    updateUserRoleController
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags: [User]
 *     summary: Update user by id
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
 *       $ref: '#/components/requestBodies/UpdateUserRequestBody'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       409:
 *         description: duplicate email or username
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateUserIdParam,
    validateUpdateUser,
    updateUserController
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Delete user by id
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
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.delete("/:id", authenticate, authorizeRoles("Admin"), validateUserIdParam, deleteUserController);

export default router;