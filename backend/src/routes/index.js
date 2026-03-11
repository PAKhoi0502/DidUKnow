import express from "express";
import userRoutes from "../modules/user/user.route.js";
import roleRoutes from "../modules/role/role.route.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/roles", roleRoutes);

export default router;