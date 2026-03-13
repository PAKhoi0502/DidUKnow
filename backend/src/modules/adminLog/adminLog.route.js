import express from "express";
import { getAdminLogsController } from "./adminLog.controller.js";
import { validateAdminLogListQuery } from "./adminLog.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin-logs:
 *   get:
 *     tags: [AdminLog]
 *     summary: Get admin logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: admin_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         required: false
 *         schema:
 *           type: string
 *           enum: [create, update, delete, status_update]
 *       - in: query
 *         name: target_type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [fact, tag, category, report_fact, user, role, comment, bookmark_collection]
 *       - in: query
 *         name: target_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
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
 *           example: 20
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLogListApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
router.get("/", authenticate, authorizeRoles("Admin"), validateAdminLogListQuery, getAdminLogsController);

export default router;
