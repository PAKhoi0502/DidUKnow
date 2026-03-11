import express from "express";
import {
    createRoleController,
    deleteRoleController,
    getRolesController,
    updateRoleController
} from "./role.controller.js";
import {
    validateCreateRole,
    validateRoleIdParam,
    validateUpdateRole
} from "./role.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Role]
 *     summary: Get all roles
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
router.get("/", authenticate, authorizeRoles("Admin"), getRolesController);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags: [Role]
 *     summary: Create a new role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateRoleRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CreatedResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       409:
 *         $ref: '#/components/responses/RoleDuplicateResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.post("/", authenticate, authorizeRoles("Admin"), validateCreateRole, createRoleController);

/**
 * @swagger
 * /api/roles/{id}:
 *   patch:
 *     tags: [Role]
 *     summary: Update role by id
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
 *       $ref: '#/components/requestBodies/UpdateRoleRequestBody'
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
 *         $ref: '#/components/responses/RoleDuplicateResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("Admin"),
    validateRoleIdParam,
    validateUpdateRole,
    updateRoleController
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags: [Role]
 *     summary: Delete role by id
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
 *       409:
 *         $ref: '#/components/responses/RoleInUseResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.delete("/:id", authenticate, authorizeRoles("Admin"), validateRoleIdParam, deleteRoleController);

export default router;
