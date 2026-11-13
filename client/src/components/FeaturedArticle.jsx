
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

const getAuthorName = (author) => {
  if (!author) return "Softrate";

  if (typeof author === "object") {
    return author.name || "Softrate";
  }

  return author;
};

const getFormattedDate = (article) => {
  const date =
    article.publishedAt ||
    article.createdAt ||
    article.date;

  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function FeaturedArticle({ article }) {
  if (!article) return null;

  const imageUrl = getImageUrl(
    article.thumbnail || article.image
  );

  const categoryName = getCategoryName(article.category);
  const authorName = getAuthorName(article.author);
  const formattedDate = getFormattedDate(article);

  return (
    <article className="featured-article">
      <Link
        to={`/blogs/${article.slug}`}
        className="featured-image-link"
        aria-label={`Read ${article.title}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title || "Featured article image"}
            className="featured-image"
            width="800"
            height="450"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="featured-image">
            No Image Available
          </div>
        )}
      </Link>

      <div className="featured-content">
        <span className="featured-tag">
          Featured Article
        </span>

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
          <span>{authorName}</span>

          {formattedDate && (
            <span>{formattedDate}</span>
          )}
        </div>

        <Link
          to={`/blogs/${article.slug}`}
          className="read-more"
        >
          Read Featured Article →
        </Link>
      </div>
    </article>
  );
}

export default FeaturedArticle;
