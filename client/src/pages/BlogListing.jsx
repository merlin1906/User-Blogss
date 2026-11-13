
import { useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import ArticleCard from "../components/ArticleCard";
import Pagination from "../components/Pagination";

import useArticles from "../hooks/useArticles";

const getArticleId = (article) =>
  article?._id || article?.id || article?.slug;

const getCategoryName = (article) => {
  const category = article?.category;

  if (!category) return "Uncategorized";

  if (typeof category === "object") {
    return category.name || "Uncategorized";
  }

  return String(category);
};

const getArticleDate = (article) =>
  article?.publishedAt ||
  article?.date ||
  article?.createdAt ||
  null;

const getAuthorName = (author) => {
  if (!author) return "";

  if (typeof author === "object") {
    return author.name || "";
  }

  return String(author);
};

function BlogListing() {
  const { articles = [], loading, error } = useArticles();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  const safeArticles = Array.isArray(articles)
    ? articles.filter(Boolean)
    : [];

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        safeArticles.map((article) =>
          getCategoryName(article)
        )
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [safeArticles]);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return safeArticles
      .filter((article) => {
        const title = String(article.title || "").toLowerCase();
        const description = String(
          article.description || ""
        ).toLowerCase();

        const categoryName = getCategoryName(
          article
        ).toLowerCase();

        const author = getAuthorName(
          article.author
        ).toLowerCase();

        const matchesSearch =
          !keyword ||
          title.includes(keyword) ||
          description.includes(keyword) ||
          categoryName.includes(keyword) ||
          author.includes(keyword);

        const matchesCategory =
          category === "All" ||
          getCategoryName(article) === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(
          getArticleDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getArticleDate(b) || 0
        ).getTime();

        return (
          (Number.isNaN(dateB) ? 0 : dateB) -
          (Number.isNaN(dateA) ? 0 : dateA)
        );
      });
  }, [safeArticles, search, category]);

  const displayedArticles = useMemo(
    () => filteredArticles.slice(0, visibleCount),
    [filteredArticles, visibleCount]
  );

  const changeCategory = (value) => {
    setCategory(value);
    setVisibleCount(6);
  };

  const changeSearch = (value) => {
    setSearch(value);
    setVisibleCount(6);
  };

  return (
    <>
      <Navbar />

      <section className="listing-hero">
        <div>
          <span className="hero-tag">SOFTRATE BLOG</span>

          <h1>Explore All Articles</h1>

          <p>
            Discover technology insights, tutorials and the latest trends.
          </p>
        </div>
      </section>

      <main className="main-container">
        <section className="section">
          <div className="listing-toolbar">
            <SearchBar
              search={search}
              setSearch={changeSearch}
            />
          </div>

          <div className="section-heading">
            <h2>Browse by Category</h2>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "category-btn active"
                    : "category-btn"
                }
                onClick={() => changeCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="listing-results">
            <div className="section-heading">
              <h2>All Published Articles</h2>

              <p>
                {filteredArticles.length} articles available
              </p>
            </div>

            {loading && (
              <p className="status-message" role="status">
                Loading articles...
              </p>
            )}

            {error && (
              <p className="status-message" role="alert">
                {error}
              </p>
            )}

            {!loading && !error && (
              <>
                {displayedArticles.length > 0 ? (
                  <div className="article-grid">
                    {displayedArticles.map((article) => (
                      <ArticleCard
                        key={getArticleId(article)}
                        article={article}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="status-message">
                    No articles found. Try another keyword or category.
                  </p>
                )}

                <Pagination
                  visibleCount={displayedArticles.length}
                  totalCount={filteredArticles.length}
                  onLoadMore={() =>
                    setVisibleCount((count) => count + 6)
                  }
                />
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default BlogListing;
