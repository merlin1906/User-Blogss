
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Admin Login
export const adminLogin = async (credentials) => {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Admin login failed");
  }

  return data;
};

// Verify Admin
export const verifyAdmin = async () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`${API_URL}/admin/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    throw new Error(data.message || "Admin verification failed");
  }

  return data.admin;
};

// Admin Logout
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
};

// Get All Admin Articles
export const getAdminArticles = async () => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}/admin/articles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch articles");
  }

  return data;
};

// Create Admin Article
export const createAdminArticle = async (articleData) => {
  const token = localStorage.getItem("adminToken");

  const isFormData = articleData instanceof FormData;

  const response = await fetch(`${API_URL}/admin/articles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : {
        "Content-Type": "application/json",
      }),
    },
    body: isFormData
      ? articleData
      : JSON.stringify(articleData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create article");
  }

  return data;
};

// Update Admin Article
export const updateAdminArticle = async (articleId, articleData) => {
  const token = localStorage.getItem("adminToken");

  const isFormData = articleData instanceof FormData;

  const response = await fetch(
    `${API_URL}/admin/articles/${articleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : {
          "Content-Type": "application/json",
        }),
      },
      body: isFormData
        ? articleData
        : JSON.stringify(articleData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update article");
  }

  return data;
};

// Delete Admin Article
export const deleteAdminArticle = async (articleId) => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(
    `${API_URL}/admin/articles/${articleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete article");
  }

  return data;
};

export const getAdminCategories = async () => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}/admin/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data;
};

export const createAdminCategory = async (categoryData) => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}/admin/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create category");
  }

  return data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update category");
  }

  return data;
};

export const deleteAdminCategory = async (id) => {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return data;
};
