
import Article from "../models/Article.js";

const parseTags = (tags) => {
  if (!tags) return [];

  let parsedTags = tags;

  if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch {
      parsedTags = tags.split(",");
    }
  }

  if (!Array.isArray(parsedTags)) return [];

  return [
    ...new Set(
      parsedTags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .map((tag) => tag.replace(/^#/, ""))
    ),
  ];
};

const parseContent = (content) => {
  if (!content) return [];

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(content) ? content : [];
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  return value === "true";
};

const getScheduledDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return null;
  }

  return date;
};

// Get uploaded files from Multer
const getUploadedFiles = (req) => ({
  thumbnail: req.files?.thumbnail?.[0] || req.file || null,
  contentImages: req.files?.contentImages || [],
});

// Prepare article content and map uploaded images correctly.
const prepareContent = (content, uploadedImages = []) => {
  const blocks = parseContent(content);
  const usedImageIndexes = new Set();

  const preparedBlocks = blocks.map((block) => {
    if (!block || typeof block !== "object" || block.type !== "image") {
      return block;
    }

    const {
      imageIndex,
      uploadIndex,
      ...cleanBlock
    } = block;

    let selectedIndex = null;

    const requestedIndex =
      imageIndex !== undefined && imageIndex !== null && imageIndex !== ""
        ? Number(imageIndex)
        : uploadIndex !== undefined && uploadIndex !== null && uploadIndex !== ""
          ? Number(uploadIndex)
          : null;

    // Use the exact upload index supplied by the frontend.
    if (
      requestedIndex !== null &&
      Number.isInteger(requestedIndex) &&
      requestedIndex >= 0 &&
      requestedIndex < uploadedImages.length &&
      !usedImageIndexes.has(requestedIndex)
    ) {
      selectedIndex = requestedIndex;
    }

    // If no valid index exists, use the next unused uploaded image.
    if (selectedIndex === null && !cleanBlock.src && !cleanBlock.url) {
      selectedIndex = uploadedImages.findIndex(
        (_, index) => !usedImageIndexes.has(index)
      );

      if (selectedIndex === -1) {
        selectedIndex = null;
      }
    }

    if (selectedIndex !== null) {
      usedImageIndexes.add(selectedIndex);

      const uploadedImage = uploadedImages[selectedIndex];

      return {
        ...cleanBlock,
        type: "image",
        src: `/uploads/articles/${uploadedImage.filename}`,
      };
    }

    // Keep previously uploaded images unchanged.
    return cleanBlock;
  });

  // Do not lose any uploaded files if a placeholder is missing.
  uploadedImages.forEach((file, index) => {
    if (!usedImageIndexes.has(index)) {
      preparedBlocks.push({
        type: "image",
        src: `/uploads/articles/${file.filename}`,
        alt: "",
        caption: "",
      });
    }
  });

  return preparedBlocks;
};

// Get all admin articles
export const getAdminArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    const totalArticles = await Article.countDocuments();

    const publishedArticles = await Article.countDocuments({
      status: "PUBLISHED",
    });

    const draftArticles = await Article.countDocuments({
      status: "DRAFT",
    });

    const scheduledArticles = await Article.countDocuments({
      status: "SCHEDULED",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        scheduledArticles,
      },
      count: articles.length,
      articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create article
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      slug: customSlug,
      description,
      content,
      thumbnail,
      author,
      category,
      status,
      scheduledAt,
      featured,
      trending,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !description || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, description and author are required",
      });
    }

    const articleStatus = status || "DRAFT";

    if (!["DRAFT", "PUBLISHED", "SCHEDULED"].includes(articleStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article status",
      });
    }

    let scheduleDate = null;

    if (articleStatus === "SCHEDULED") {
      scheduleDate = getScheduledDate(scheduledAt);

      if (!scheduleDate) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid future schedule date and time",
        });
      }
    }

    const slug = (customSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid article slug",
      });
    }

    const existingArticle = await Article.findOne({ slug });

    if (existingArticle) {
      return res.status(409).json({
        success: false,
        message: "This article slug already exists",
      });
    }

    const { thumbnail: thumbnailFile, contentImages } =
      getUploadedFiles(req);

    const thumbnailPath = thumbnailFile
      ? `/uploads/articles/${thumbnailFile.filename}`
      : thumbnail || "";

    const articleContent = prepareContent(content, contentImages);

    const article = await Article.create({
      title,
      slug,
      description,
      content: articleContent,
      thumbnail: thumbnailPath,
      author,
      category: category || undefined,
      status: articleStatus,
      scheduledAt: scheduleDate,
      featured: parseBoolean(featured),
      trending: parseBoolean(trending),
      publishedAt:
        articleStatus === "PUBLISHED" ? new Date() : null,
      tags: parseTags(tags),
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
    });

    res.status(201).json({
      success: true,
      message:
        articleStatus === "SCHEDULED"
          ? "Article scheduled successfully"
          : "Article created successfully",
      article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const updates = { ...req.body };

    const existingArticle = await Article.findById(req.params.id);

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const { thumbnail: thumbnailFile, contentImages } =
      getUploadedFiles(req);

    // Preserve the old thumbnail unless a new one is uploaded.
    if (thumbnailFile) {
      updates.thumbnail = `/uploads/articles/${thumbnailFile.filename}`;
    } else {
      delete updates.thumbnail;
    }

    // Preserve old content and update it only when content is submitted
    // or new content images are uploaded.
    if (updates.content !== undefined || contentImages.length > 0) {
      const contentToUpdate =
        updates.content !== undefined
          ? updates.content
          : existingArticle.content;

      updates.content = prepareContent(contentToUpdate, contentImages);
    }

    if (updates.tags !== undefined) {
      updates.tags = parseTags(updates.tags);
    }

    if (updates.category === "") {
      updates.category = null;
    }

    if (updates.featured !== undefined) {
      updates.featured = parseBoolean(updates.featured);
    }

    if (updates.trending !== undefined) {
      updates.trending = parseBoolean(updates.trending);
    }

    // Generate and validate slug.
    if (updates.title || updates.slug) {
      updates.slug = (updates.slug || updates.title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!updates.slug) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid article slug",
        });
      }

      const duplicateArticle = await Article.findOne({
        slug: updates.slug,
        _id: { $ne: req.params.id },
      });

      if (duplicateArticle) {
        return res.status(409).json({
          success: false,
          message: "This article slug already exists",
        });
      }
    }

    // SEO fallback.
    if (updates.metaTitle === "") {
      updates.metaTitle = updates.title || existingArticle.title;
    }

    if (updates.metaDescription === "") {
      updates.metaDescription =
        updates.description || existingArticle.description;
    }

    // Scheduled publishing.
    if (updates.status === "SCHEDULED") {
      const scheduleDate = getScheduledDate(updates.scheduledAt);

      if (!scheduleDate) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid future schedule date and time",
        });
      }

      updates.scheduledAt = scheduleDate;
      updates.publishedAt = null;
    }

    // Publish immediately.
    if (updates.status === "PUBLISHED") {
      updates.publishedAt = new Date();
      updates.scheduledAt = null;
    }

    // Save as draft.
    if (updates.status === "DRAFT") {
      updates.publishedAt = null;
      updates.scheduledAt = null;
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      message:
        article.status === "SCHEDULED"
          ? "Article schedule updated successfully"
          : "Article updated successfully",
      article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
