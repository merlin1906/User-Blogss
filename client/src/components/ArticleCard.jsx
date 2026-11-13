
import { Link } from "react-router-dom";

const SERVER_URL = "http://localhost:5000";

function ArticleCard({ article }) {
  const imagePath = article.thumbnail || article.image || "";

  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${SERVER_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
    : "";

  return (
    <article className="article-card">
      <Link to={`/blogs/${article.slug}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
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
          {article.category}
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
            {new Date(article.date || article.publishedAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric"
              }
            )}
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
