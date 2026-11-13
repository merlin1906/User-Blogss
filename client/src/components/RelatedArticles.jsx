
import { useMemo } from "react";
import ArticleCard from "./ArticleCard";

function getArticleId(article) {
  return article?._id || article?.id || article?.slug || "";
}

function getCategoryId(article) {
  const category = article?.category;

  if (!category) return "";

  if (typeof category === "object") {
    return String(
      category._id ||
      category.id ||
      category.slug ||
      category.name ||
      ""
    ).toLowerCase();
  }

  return String(category).toLowerCase();
}

function RelatedArticles({ articles = [], currentArticle }) {
  const related = useMemo(() => {
    if (!currentArticle || !Array.isArray(articles)) {
      return [];
    }

    const currentId = getArticleId(currentArticle);
    const currentCategory = getCategoryId(currentArticle);

    const otherArticles = articles.filter(
      (article) =>
        article &&
        getArticleId(article) !== currentId
    );

    const sameCategoryArticles = otherArticles.filter(
      (article) =>
        currentCategory &&
        getCategoryId(article) === currentCategory
    );

    // Prefer same-category articles.
    // If fewer than 3 exist, fill remaining slots with other articles.
    const remainingArticles = otherArticles.filter(
      (article) =>
        !sameCategoryArticles.includes(article)
    );

    return [
      ...sameCategoryArticles,
      ...remainingArticles,
    ].slice(0, 3);
  }, [articles, currentArticle]);

  if (!related.length) return null;

  return (
    <section className="section related-articles-section">
      <div className="section-heading">
        <h2>Related Articles</h2>
        <p>Continue exploring similar topics.</p>
      </div>

      <div className="article-grid">
        {related.map((article) => (
          <ArticleCard
            key={getArticleId(article)}
            article={article}
          />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
