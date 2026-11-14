
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  adminLogout,
  verifyAdmin,
  getAdminArticles,
  deleteAdminArticle,
} from "../services/adminService";

const ITEMS_PER_PAGE = 5;

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);
  const [articles, setArticles] = useState([]);

  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
  });

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadDashboard = async () => {
    try {
      setError("");

      const [adminData, articleData] = await Promise.all([
        verifyAdmin(),
        getAdminArticles(),
      ]);

      setAdmin(adminData);
      setArticles(articleData.articles || []);

      setStats(
        articleData.stats || {
          totalArticles: 0,
          publishedArticles: 0,
          draftArticles: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm, categoryFilter]);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleDelete = async (articleId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(articleId);

      await deleteAdminArticle(articleId);
      await loadDashboard();

      alert("Article deleted successfully!");
    } catch (err) {
      alert(err.message || "Unable to delete article");
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [
    ...new Set(
      articles
        .map((article) => article.category?.name)
        .filter(Boolean)
    ),
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesStatus =
      selectedFilter === "ALL" ||
      article.status === selectedFilter;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (article.title || "").toLowerCase().includes(search) ||
      (article.author || "").toLowerCase().includes(search) ||
      (article.category?.name || "").toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "ALL" ||
      article.category?.name === categoryFilter;

    return matchesStatus && matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(
    filteredArticles.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const sectionTitle = {
    ALL: "All Articles",
    PUBLISHED: "Published Articles",
    DRAFT: "Draft Articles",
    SCHEDULED: "Scheduled Articles",
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-loading">
        <p>{error}</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">S</div>
          <div>
            <h2>Softrate</h2>
            <p>ADMIN CONSOLE</p>
          </div>
        </div>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav>
          <Link
            to="/admin/dashboard"
            className={
              location.pathname === "/admin/dashboard"
                ? "active"
                : ""
            }
          >
            <span className="admin-nav-icon"></span>
            Dashboard
          </Link>

          <Link
            to="/admin/categories"
            className={
              location.pathname === "/admin/categories"
                ? "active"
                : ""
            }
          >
            <span className="admin-nav-icon"></span>
            Categories
          </Link>

          <Link to="/blogs">
            <span className="admin-nav-icon"></span>
            View Website
          </Link>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-note">
            <span></span>
            <p>Manage your content and grow your blog.</p>
          </div>

          <button className="admin-logout" onClick={handleLogout}>
            <span>⇥</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        {/* Header */}
        <header className="admin-header">
          <div>
            <span className="admin-breadcrumb">
              Workspace / Dashboard
            </span>
            <h1>Dashboard</h1>
            <p>Here's what's happening with your blog today.</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>
                {admin?.admin?.email || admin?.email || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Welcome */}
        <section className="admin-welcome">
          <div className="admin-welcome-content">
            <span className="admin-welcome-tag">SOFTRATE BLOG</span>
            <h2>Welcome back, Admin!</h2>
            <p>
              Your content hub is ready. Create, manage and publish
              articles to keep your audience engaged.
            </p>

            <button
              className="admin-welcome-button"
              onClick={() => navigate("/admin/articles/new")}
            >
              Create New Article <span>→</span>
            </button>
          </div>

          <div className="admin-welcome-decoration">
            <div className="admin-decoration-circle">
              <span>✦</span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="admin-stats">

          <button
            type="button"
            className={`admin-stat-card ${
              selectedFilter === "ALL" ? "selected" : ""
            }`}
            onClick={() => setSelectedFilter("ALL")}
          >
            <div className="admin-stat-top">
              <span>Total Articles</span>
              <span className="admin-stat-icon violet"></span>
            </div>
            <p className="admin-stat-number">
              {stats.totalArticles}
            </p>
            <span className="admin-stat-caption">
              All blog articles
            </span>
          </button>

          <button
            type="button"
            className={`admin-stat-card ${
              selectedFilter === "PUBLISHED" ? "selected" : ""
            }`}
            onClick={() => setSelectedFilter("PUBLISHED")}
          >
            <div className="admin-stat-top">
              <span>Published Articles</span>
              <span className="admin-stat-icon green"></span>
            </div>
            <p className="admin-stat-number">
              {stats.publishedArticles}
            </p>
            <span className="admin-stat-caption">
              Live on website
            </span>
          </button>

          <button
            type="button"
            className={`admin-stat-card ${
              selectedFilter === "DRAFT" ? "selected" : ""
            }`}
            onClick={() => setSelectedFilter("DRAFT")}
          >
            <div className="admin-stat-top">
              <span>Draft Articles</span>
              <span className="admin-stat-icon orange"></span>
            </div>
            <p className="admin-stat-number">
              {stats.draftArticles}
            </p>
            <span className="admin-stat-caption">
              Not yet published
            </span>
          </button>

        </section>

        {/* Articles */}
        <section className="admin-articles-section">

          <div className="admin-section-heading">
            <div>
              <span className="admin-section-eyebrow">
                CONTENT MANAGEMENT
              </span>
              <h2>{sectionTitle[selectedFilter]}</h2>
              <p>
                Manage and organize your blog articles.
              </p>
            </div>

            <button
              className="admin-add-button"
              onClick={() => navigate("/admin/articles/new")}
            >
              <span>＋</span> Add Article
            </button>
          </div>

          {/* Filters */}
          <div className="admin-filters">

            <div className="admin-search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search title, author or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-clear-button"
              onClick={() => {
                setSearchTerm("");
                setSelectedFilter("ALL");
                setCategoryFilter("ALL");
              }}
            >
              Clear
            </button>
          </div>

          {/* Table heading */}
          <div className="admin-table-heading">
            <span>ARTICLE LIST</span>
            <span>{filteredArticles.length} article(s)</span>
          </div>

          {/* Article Table */}
          {filteredArticles.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"></div>
              <h3>No articles found</h3>
              <p>
                Try changing your filters or create a new article.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("ALL");
                  setCategoryFilter("ALL");
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedArticles.map((article) => (
                      <tr key={article._id}>
                        <td className="admin-article-title">
                          <strong>{article.title}</strong>
                        </td>

                        <td>
                          <span className="admin-category-label">
                            {article.category?.name || "Uncategorized"}
                          </span>
                        </td>

                        <td>{article.author || "-"}</td>

                        <td>
                          <span
                            className={`admin-status ${
                              article.status?.toLowerCase() || "draft"
                            }`}
                          >
                            <span className="admin-status-dot"></span>
                            {article.status || "Draft"}
                          </span>
                        </td>

                        <td>
                          {article.createdAt
                            ? new Date(
                                article.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>

                        <td>
                          <div className="admin-action-buttons">
                            <button
                              className="admin-edit-button"
                              onClick={() =>
                                navigate(
                                  `/admin/articles/edit/${article._id}`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="admin-delete-button"
                              disabled={deletingId === article._id}
                              onClick={() =>
                                handleDelete(
                                  article._id,
                                  article.title
                                )
                              }
                            >
                              {deletingId === article._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="admin-pagination">
                <p>
                  Showing{" "}
                  {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredArticles.length
                  )}{" "}
                  of {filteredArticles.length} articles
                </p>

                <div className="admin-pagination-controls">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;
