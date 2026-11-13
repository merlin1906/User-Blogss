
import { Link } from "react-router-dom";

function ArticleNavigation({ previous, next }) {
  const hasPrevious = Boolean(previous?.slug);
  const hasNext = Boolean(next?.slug);

  if (!hasPrevious && !hasNext) {
    return null;
  }

  return (
    <nav
      className="article-navigation"
      aria-label="Article navigation"
    >
      <div className="article-nav-item previous-article">
        {hasPrevious ? (
          <Link
            to={`/blogs/${previous.slug}`}
            rel="prev"
            aria-label={`Previous article: ${previous.title}`}
          >
            <span>← Previous Article</span>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <span className="article-nav-empty">
            No previous article
          </span>
        )}
      </div>

      <div className="article-nav-item next-article">
        {hasNext ? (
          <Link
            to={`/blogs/${next.slug}`}
            rel="next"
            aria-label={`Next article: ${next.title}`}
          >
            <span>Next Article →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <span className="article-nav-empty">
            No next article
          </span>
        )}
      </div>
    </nav>
  );
}

export default ArticleNavigation;
