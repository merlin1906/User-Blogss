
import express from "express";

import { protectAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/adminArticleController.js";

const router = express.Router();

// All admin article routes require authentication
router.use(protectAdmin);

// Get all articles
router.get("/", getAdminArticles);

// Thumbnail + multiple content images
const articleUploads = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "contentImages", maxCount: 10 },
]);

// Create article
router.post("/", articleUploads, createArticle);

// Update article
router.put("/:id", articleUploads, updateArticle);

// Delete article
router.delete("/:id", deleteArticle);

export default router;
