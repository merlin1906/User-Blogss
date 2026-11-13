
import Article from "../models/Article.js";

// Get all published articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "PUBLISHED" })
      .populate("category", "name slug")
      .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
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

// Get single published article by slug
export const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: "PUBLISHED",
    }).populate("category", "name slug");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
