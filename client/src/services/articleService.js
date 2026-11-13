
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Convert backend article format into frontend format
const formatArticle = (article) => {
  if (!article) return null;

  const category =
    typeof article.category === "object"
      ? article.category?.name || "Uncategorized"
      : article.category || "Uncategorized";

  return {
    ...article,
    image: article.thumbnail || article.image || "",
    date: article.publishedAt || article.createdAt || article.date,
    category,
    views: Number(article.views) || 0,
  };
};

// Common API request handler
const fetchAPI = async (endpoint, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

// Get all published articles
export const getArticles = async (options = {}) => {
  const data = await fetchAPI("/articles", options);

  const articles = Array.isArray(data)
    ? data
    : data?.articles || [];

  return articles
    .map(formatArticle)
    .filter(Boolean);
};

// Get published articles
export const getPublishedArticles = async (options = {}) => {
  return getArticles(options);
};

// Get single article using slug
export const getArticleBySlug = async (slug, options = {}) => {
  if (!slug) return null;

  const data = await fetchAPI(
    `/articles/${encodeURIComponent(slug)}`,
    options
  );

  return data?.article
    ? formatArticle(data.article)
    : null;
};

// Get featured articles
export const getFeaturedArticles = async () => {
  const articles = await getArticles();

  return articles.filter((article) => article.featured);
};

// Get trending articles
export const getTrendingArticles = async () => {
  const articles = await getArticles();

  return articles
    .filter((article) => article.trending)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.date || 0).getTime();
      const dateB = new Date(b.publishedAt || b.date || 0).getTime();

      return (
        (Number.isNaN(dateB) ? 0 : dateB) -
        (Number.isNaN(dateA) ? 0 : dateA)
      );
    });
};
