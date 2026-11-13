
import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminCategoryController.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAdminCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
