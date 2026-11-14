
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

function ArticleCard({ article }) {
  const imagePath = article.thumbnail || article.image || "";

  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${SERVER_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
    : "";

  const categoryName =
    typeof article.category === "object"
      ? article.category?.name || "Uncategorized"
      : article.category || "Uncategorized";

  const articleDate =
    article.date || article.publishedAt || article.createdAt;

  return (
    <article className="article-card">
      <Link to={`/blogs/${article.slug}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title || "Blog article"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="article-image-placeholder">
            No Image Available
          </div>
        )}
      </Link>

      <div className="article-content">
        <span className="article-category">
          {categoryName}
        </span>

        <h3>
          <Link to={`/blogs/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        <p>{article.description}</p>

        <div className="article-meta">
          <span>{article.author}</span>

          <span>
            {articleDate
              ? new Date(articleDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : ""}
          </span>
        </div>

        <Link
          to={`/blogs/${article.slug}`}
          className="read-more"
        >
          Read Article →
        </Link>
      </div>
    </article>
  );
}

export default ArticleCard;
