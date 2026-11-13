
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";

  if (typeof category === "object") {
    return category.name || "Uncategorized";
  }

  return category;
};

function TrendingArticles({ articles }) {
  if (!Array.isArray(articles) || articles.length === 0) {
    return null;
  }

  return (
    <section id="trending" className="section">
      <div className="section-heading">
        <h2>Trending Articles</h2>
        <p>Popular technology stories.</p>
      </div>

      <div className="trending-list">
        {articles.map((article, index) => {
          if (!article) return null;

          const imageUrl = getImageUrl(
            article.thumbnail || article.image
          );

          const categoryName = getCategoryName(
            article.category
          );

          return (
            <Link
              to={`/blogs/${article.slug}`}
              className="trending-item"
              key={article._id || article.id || article.slug}
              aria-label={`Read ${article.title}`}
            >
              <span className="trending-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={article.title || "Trending article image"}
                  width="120"
                  height="90"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="trending-image-placeholder">
                  No Image
                </div>
              )}

              <div>
                <span className="article-category">
                  {categoryName}
                </span>

                <h3>{article.title}</h3>

                <small>
                  {Number(article.views) || 0} views
                </small>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default TrendingArticles;
