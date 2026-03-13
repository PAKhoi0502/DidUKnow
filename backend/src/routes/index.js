import express from "express";
import userRoutes from "../modules/user/user.route.js";
import roleRoutes from "../modules/role/role.route.js";
import factRoutes from "../modules/fact/fact.route.js";
import categoryRoutes from "../modules/category/category.route.js";
import tagRoutes from "../modules/tag/tag.route.js";
import favouriteRoutes from "../modules/favourite/favourite.route.js";
import factViewRoutes from "../modules/factView/factView.route.js";
import reportFactRoutes from "../modules/reportFact/reportFact.route.js";
import commentRoutes from "../modules/comment/comment.route.js";
import languageRoutes from "../modules/language/language.route.js";
import mediaRoutes from "../modules/media/media.route.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/facts", factRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
router.use("/favourites", favouriteRoutes);
router.use("/fact-views", factViewRoutes);
router.use("/report-facts", reportFactRoutes);
router.use("/comments", commentRoutes);
router.use("/languages", languageRoutes);
router.use("/media", mediaRoutes);

export default router;