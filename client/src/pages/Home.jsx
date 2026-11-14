
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import ArticleCard from "../components/ArticleCard";
import FeaturedArticle from "../components/FeaturedArticle";
import CategorySection from "../components/CategorySection";
import TrendingArticles from "../components/TrendingArticles";

import useArticles from "../hooks/useArticles";

const getArticleId = (article) =>
  article?._id || article?.id || article?.slug;

const getCategoryName = (article) => {
  const category = article?.category;

  if (!category) return "Uncategorized";

  if (typeof category === "object") {
    return category.name || "Uncategorized";
  }

  return category;
};

const getArticleDate = (article) =>
  article?.publishedAt || article?.date || article?.createdAt || 0;

function Home() {
  const { articles = [], loading, error } = useArticles();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const safeArticles = Array.isArray(articles) ? articles : [];

  const keyword = search.trim().toLowerCase();

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        safeArticles.map((article) => getCategoryName(article))
      ),
    ];
  }, [safeArticles]);

  const filteredArticles = useMemo(() => {
    return safeArticles.filter((article) => {
      const title = (article.title || "").toLowerCase();
      const description = (article.description || "").toLowerCase();
      const categoryName = getCategoryName(article).toLowerCase();

      const matchesSearch =
        title.includes(keyword) ||
        description.includes(keyword) ||
        categoryName.includes(keyword);

      const matchesCategory =
        category === "All" ||
        getCategoryName(article) === category;

      return matchesSearch && matchesCategory;
    });
  }, [safeArticles, keyword, category]);

  const featured = useMemo(() => {
    return filteredArticles
      .filter((article) => article.featured === true)
      .slice(0, 2);
  }, [filteredArticles]);

  const trending = useMemo(() => {
    return [...safeArticles]
      .filter((article) => article.trending === true)
      .sort(
        (a, b) =>
          (Number(b.views) || 0) - (Number(a.views) || 0)
      )
      .slice(0, 3);
  }, [safeArticles]);

  const latest = useMemo(() => {
    return [...filteredArticles].sort(
      (a, b) =>
        new Date(getArticleDate(b)).getTime() -
        new Date(getArticleDate(a)).getTime()
    );
  }, [filteredArticles]);

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            WELCOME TO SOFTRATE
          </span>

          <h1>
            Discover. Learn. <span>Innovate.</span>
          </h1>

          <p>
            Explore the latest technology articles, industry
            insights and innovations shaping the digital world.
          </p>

          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <Link to="/blogs" className="hero-link">
            Explore All Articles →
          </Link>
        </div>
      </section>

      <main className="main-container">
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
            <section className="section" id="featured">
              <div className="section-heading">
                <h2>Featured Articles</h2>
                <p>Handpicked stories worth exploring.</p>
              </div>

              {featured.length > 0 ? (
                <div className="featured-grid">
                  {featured.map((article) => (
                    <FeaturedArticle
                      key={getArticleId(article)}
                      article={article}
                    />
                  ))}
                </div>
              ) : (
                <p className="status-message">
                  No featured articles available.
                </p>
              )}
            </section>

            <CategorySection
              categories={categories}
              selectedCategory={category}
              setSelectedCategory={setCategory}
            />

            <section className="section" id="latest">
              <div className="section-heading section-header-row">
                <div>
                  <h2>Latest Blog Posts</h2>
                  <p>Stay updated with our latest stories.</p>
                </div>

                <Link to="/blogs" className="view-all">
                  View All →
                </Link>
              </div>

              {latest.length > 0 ? (
                <div className="article-grid">
                  {latest.slice(0, 6).map((article) => (
                    <ArticleCard
                      key={getArticleId(article)}
                      article={article}
                    />
                  ))}
                </div>
              ) : (
                <p className="status-message">
                  No articles found. Try another search or category.
                </p>
              )}
            </section>

            <TrendingArticles articles={trending} />
          </>
        )}
      </main>

      {/* ADMIN ACCESS */}
      <div className="home-admin-access">
        <Link to="/admin/login">
          <span>Admin Portal</span>
          <span className="home-admin-arrow">→</span>
        </Link>
      </div>

      <Footer />
    </>
  );
}

export default Home;
