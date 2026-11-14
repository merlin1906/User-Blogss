
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SocialShare from "../components/SocialShare";
import RelatedArticles from "../components/RelatedArticles";
import ArticleNavigation from "../components/ArticleNavigation";

import useArticles from "../hooks/useArticles";
import { calculateReadingTime } from "../utils/readingTime";
import { formatDate } from "../utils/formatDate";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  const value = image.trim();

  if (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  if (value.startsWith("//")) return "";

  return `${SERVER_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getSafeUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url, window.location.origin);

    if (["http:", "https:"].includes(parsedUrl.protocol)) {
      return url;
    }

    return "";
  } catch {
    return "";
  }
};

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";

  if (typeof category === "object") {
    return category.name || "Uncategorized";
  }

  return category;
};

const getAuthorName = (author) => {
  if (!author) return "USER-BLOGSS";

  if (typeof author === "object") {
    return author.name || "USER-BLOGSS";
  }

  return author;
};

const normalizeContent = (content) => {
  if (typeof content === "string") {
    return content
      .split(/\n+/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({
        type: "paragraph",
        text,
      }));
  }

  if (!Array.isArray(content)) return [];

  return content
    .map((block) => {
      if (typeof block === "string") {
        return {
          type: "paragraph",
          text: block,
        };
      }

      if (!block || typeof block !== "object") return null;

      if (!block.type) {
        return {
          ...block,
          type: "paragraph",
          text: block.text || block.content || "",
        };
      }

      return block;
    })
    .filter(Boolean);
};

function BlogDetail() {
  const { slug } = useParams();
  const { articles = [], loading, error } = useArticles();

  const safeArticles = Array.isArray(articles)
    ? articles
    : [];

  const article = useMemo(
    () => safeArticles.find((item) => item?.slug === slug),
    [safeArticles, slug]
  );

  const contentBlocks = useMemo(
    () => normalizeContent(article?.content),
    [article]
  );

  const tocItems = useMemo(
    () =>
      contentBlocks
        .map((block, index) => ({
          ...block,
          index,
        }))
        .filter((block) => block.type === "heading"),
    [contentBlocks]
  );

  const currentIndex = useMemo(
    () => safeArticles.findIndex((item) => item?.slug === slug),
    [safeArticles, slug]
  );

  const previous =
    currentIndex > 0
      ? safeArticles[currentIndex - 1]
      : null;

  const next =
    currentIndex >= 0
      ? safeArticles[currentIndex + 1] || null
      : null;

  const categoryName = getCategoryName(article?.category);
  const authorName = getAuthorName(article?.author);

  const imageUrl = getImageUrl(
    article?.thumbnail || article?.image
  );

  // Dynamic SEO metadata
  useEffect(() => {
    if (!article) return;

    const previousTitle = document.title;
    const changes = [];

    const updateMeta = (selector, attribute, value, createTag) => {
      let element = document.querySelector(selector);
      const existed = Boolean(element);

      if (!element) {
        element = document.createElement("meta");
        createTag(element);
        document.head.appendChild(element);
      }

      changes.push({
        element,
        existed,
        attribute,
        previousValue: element.getAttribute(attribute),
      });

      element.setAttribute(attribute, value || "");
    };

    const seoTitle =
      article.metaTitle?.trim() || article.title;

    const seoDescription =
      article.metaDescription?.trim() ||
      article.description ||
      "";

    const canonicalUrl =
      `${window.location.origin}${window.location.pathname}`;

    document.title = seoTitle;

    updateMeta(
      'meta[name="description"]',
      "content",
      seoDescription,
      (element) => element.setAttribute("name", "description")
    );

    updateMeta(
      'meta[property="og:title"]',
      "content",
      seoTitle,
      (element) => element.setAttribute("property", "og:title")
    );

    updateMeta(
      'meta[property="og:description"]',
      "content",
      seoDescription,
      (element) => element.setAttribute("property", "og:description")
    );

    updateMeta(
      'meta[property="og:type"]',
      "content",
      "article",
      (element) => element.setAttribute("property", "og:type")
    );

    updateMeta(
      'meta[property="og:url"]',
      "content",
      canonicalUrl,
      (element) => element.setAttribute("property", "og:url")
    );

    updateMeta(
      'meta[property="og:site_name"]',
      "content",
      "USER-BLOGSS Blog",
      (element) => element.setAttribute("property", "og:site_name")
    );

    updateMeta(
      'meta[name="twitter:card"]',
      "content",
      imageUrl ? "summary_large_image" : "summary",
      (element) => element.setAttribute("name", "twitter:card")
    );

    updateMeta(
      'meta[name="twitter:title"]',
      "content",
      seoTitle,
      (element) => element.setAttribute("name", "twitter:title")
    );

    updateMeta(
      'meta[name="twitter:description"]',
      "content",
      seoDescription,
      (element) => element.setAttribute("name", "twitter:description")
    );

    if (imageUrl) {
      updateMeta(
        'meta[property="og:image"]',
        "content",
        imageUrl,
        (element) => element.setAttribute("property", "og:image")
      );

      updateMeta(
        'meta[name="twitter:image"]',
        "content",
        imageUrl,
        (element) => element.setAttribute("name", "twitter:image")
      );
    }

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    );

    const canonicalExisted = Boolean(canonical);

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    const previousCanonical = canonical.getAttribute("href");

    canonical.setAttribute("href", canonicalUrl);

    return () => {
      document.title = previousTitle;

      changes.forEach(
        ({ element, existed, attribute, previousValue }) => {
          if (existed) {
            if (previousValue === null) {
              element.removeAttribute(attribute);
            } else {
              element.setAttribute(attribute, previousValue);
            }
          } else {
            element.remove();
          }
        }
      );

      if (canonicalExisted) {
        if (previousCanonical === null) {
          canonical.removeAttribute("href");
        } else {
          canonical.setAttribute("href", previousCanonical);
        }
      } else {
        canonical.remove();
      }
    };
  }, [article, imageUrl]);

  // Google BlogPosting Structured Data
  useEffect(() => {
    if (!article) return;

    const articleUrl =
      `${window.location.origin}/blogs/${article.slug}`;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description:
        article.metaDescription?.trim() ||
        article.description ||
        "",
      url: articleUrl,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: "USER-BLOGSS",
      },
      datePublished:
        article.publishedAt || article.createdAt,
      dateModified:
        article.updatedAt ||
        article.publishedAt ||
        article.createdAt,
    };

    if (imageUrl) {
      schema.image = [imageUrl];
    }

    if (Array.isArray(article.tags) && article.tags.length) {
      schema.keywords = article.tags.join(", ");
    }

    const script = document.createElement("script");

    script.type = "application/ld+json";
    script.id = "blog-posting-schema";
    script.textContent = JSON.stringify(schema);

    document.getElementById("blog-posting-schema")?.remove();

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [article, authorName, imageUrl]);

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <p className="status-message" role="status">
          Loading article...
        </p>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <p className="status-message" role="alert">
          {error}
        </p>
        <Footer />
      </>
    );
  }

  // Article not found
  if (!article) {
    return (
      <>
        <Navbar />

        <div className="not-found">
          <h1>Article Not Found</h1>

          <p>
            The article you are looking for is unavailable.
          </p>

          <Link to="/blogs">Back to Articles</Link>
        </div>

        <Footer />
      </>
    );
  }

  // Render article content blocks
  const renderContent = (block, index) => {
    switch (block.type) {
      case "heading":
        return (
          <h2
            id={`article-heading-${index}`}
            key={index}
          >
            {block.text || block.content}
          </h2>
        );

      case "paragraph":
        return (
          <p key={index}>
            {block.text || block.content}
          </p>
        );

      case "image": {
        const imageSource = getImageUrl(
          block.src || block.url
        );

        if (!imageSource) return null;

        return (
          <figure
            className="article-content-image"
            key={index}
          >
            <img
              src={imageSource}
              alt={block.alt || article.title}
              loading="lazy"
              decoding="async"
            />

            {block.caption && (
              <figcaption>{block.caption}</figcaption>
            )}
          </figure>
        );
      }

      case "video": {
        const videoUrl = getSafeUrl(block.url);

        if (!videoUrl) return null;

        return (
          <div className="article-video" key={index}>
            <iframe
              src={videoUrl}
              title={block.title || "Article video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        );
      }

      case "link": {
        const safeUrl = getSafeUrl(block.url);

        if (!safeUrl) return null;

        return (
          <p key={index}>
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.text || block.url}
            </a>
          </p>
        );
      }

      case "code":
        return (
          <pre key={index}>
            <code>{block.text || block.content}</code>
          </pre>
        );

      case "list":
        return (
          <ul key={index}>
            {(Array.isArray(block.items) ? block.items : []).map(
              (item, i) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        );

      case "table":
        return (
          <div className="table-wrapper" key={index}>
            <table>
              <thead>
                <tr>
                  {(Array.isArray(block.headers)
                    ? block.headers
                    : []
                  ).map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {(Array.isArray(block.rows) ? block.rows : []).map(
                  (row, i) => (
                    <tr key={i}>
                      {(Array.isArray(row) ? row : []).map(
                        (cell, j) => (
                          <td key={j}>{cell}</td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />

      <main className="main-container detail-page">
        <div className="breadcrumb detail-breadcrumb">
          <Link to="/">Home</Link>
          {" / "}
          <Link to="/blogs">Articles</Link>
          {" / "}
          <span>{categoryName}</span>
        </div>

        <article className="detail-layout">
          <div className="article-main">
            <section className="detail-intro-grid">
              {imageUrl && (
                <div className="detail-intro-image">
                  <img
                    src={imageUrl}
                    alt={article.title}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              )}

              <header className="detail-header detail-intro-content">
                <span className="detail-category">
                  {categoryName}
                </span>

                <h1 className="detail-title">
                  {article.title}
                </h1>

                <p className="detail-description">
                  {article.description}
                </p>

                <div className="detail-meta">
                  <span>By {authorName}</span>

                  <span>
                    {formatDate(
                      article.publishedAt ||
                      article.createdAt ||
                      article.date
                    )}
                  </span>

                  <span>
                    {calculateReadingTime(article)} min read
                  </span>
                </div>
              </header>
            </section>

            {/* Automatic Table of Contents */}
            {tocItems.length > 0 && (
              <nav
                className="article-toc"
                aria-label="Table of contents"
              >
                <h2>Table of Contents</h2>

                <ul>
                  {tocItems.map((item) => (
                    <li key={item.index}>
                      <a href={`#article-heading-${item.index}`}>
                        {item.text || item.content}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Full Article Content */}
            <div className="article-body">
              {contentBlocks.map(renderContent)}
            </div>

            <SocialShare title={article.title} />

            <ArticleNavigation
              previous={previous}
              next={next}
            />
          </div>
        </article>

        <RelatedArticles
          articles={safeArticles}
          currentArticle={article}
        />
      </main>

      <Footer />
    </>
  );
}

export default BlogDetail;
