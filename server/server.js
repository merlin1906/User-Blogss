
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db.js";

import articleRoutes from "./routes/articleRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminArticleRoutes from "./routes/adminArticleRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";

import startScheduledPublisher from "./jobs/publishScheduledArticles.js";
import Article from "./models/Article.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Softrate Blog API is running!",
  });
});

// Dynamic XML Sitemap
app.get("/sitemap.xml", async (req, res) => {
  try {
    const siteUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const articles = await Article.find({
      status: "PUBLISHED",
    })
      .select("slug updatedAt publishedAt")
      .sort({ publishedAt: -1 });

    const escapeXml = (value) =>
      String(value).replace(/[<>&'"]/g, (char) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char]);

    const urls = [
      {
        loc: `${siteUrl}/`,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `${siteUrl}/blogs`,
        lastmod: new Date().toISOString(),
      },
      ...articles.map((article) => ({
        loc: `${siteUrl}/blogs/${encodeURIComponent(article.slug)}`,
        lastmod: (
          article.updatedAt ||
          article.publishedAt ||
          new Date()
        ).toISOString(),
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `
  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error.message);
    res.status(500).send("Unable to generate sitemap");
  }
});


// Public APIs
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);

// Admin APIs
app.use("/api/admin", adminRoutes);
app.use("/api/admin/articles", adminArticleRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Start scheduler only after database connection.
    startScheduledPublisher();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
