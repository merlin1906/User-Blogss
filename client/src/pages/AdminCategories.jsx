
import { useEffect, useState } from "react";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "../services/adminService";

import "./AdminCategories.css";

const emptyForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message || "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a category name");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateAdminCategory(editingId, form);
        setMessage("Category updated successfully!");
      } else {
        await createAdminCategory(form);
        setMessage("Category created successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadCategories();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteAdminCategory(id);

      setMessage("Category deleted successfully!");

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to delete category");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  return (
    <div className="categories-page">

      {/* Header */}
      <div className="categories-header">
        <div>
          <h1>Category Management</h1>
          <p>
            Create, edit and manage your blog categories.
          </p>
        </div>

        <div className="category-count">
          <span>Total Categories</span>
          <strong>{categories.length}</strong>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="category-alert error-alert">
          {error}
        </div>
      )}

      {message && (
        <div className="category-alert success-alert">
          {message}
        </div>
      )}

      {/* Category Form */}
      <div className="category-form-card">
        <div className="category-card-header">
          <h2>
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>
          <p>
            Fill in the details below to manage a category.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="category-form-grid">

            <div className="category-field">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter category name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="category-field full-width">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Enter category description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

          </div>

          <label className="category-checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>Active Category</span>
          </label>

          <div className="category-form-actions">
            <button
              type="submit"
              className="category-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Category"
                  : "Create Category"}
            </button>

            {editingId && (
              <button
                type="button"
                className="category-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="category-list-card">

        <div className="category-card-header">
          <h2>All Categories</h2>
          <p>Manage all your existing blog categories.</p>
        </div>

        {loading ? (
          <div className="category-empty">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="category-empty">
            <h3>No categories found</h3>
            <p>Create your first category to get started!</p>
          </div>
        ) : (
          <>
            {/* Desktop and Tablet Table */}
            <div className="category-table-wrapper">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category._id}>
                      <td>{index + 1}</td>

                      <td className="category-name-cell">
                        {category.name}
                      </td>

                      <td>{category.slug}</td>

                      <td className="category-description">
                        {category.description || "-"}
                      </td>

                      <td>
                        <span
                          className={`category-status ${
                            category.isActive
                              ? "active-status"
                              : "inactive-status"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="category-action-buttons">
                          <button
                            type="button"
                            className="category-edit-btn"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="category-delete-btn"
                            onClick={() => handleDelete(category._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="category-mobile-list">
              {categories.map((category, index) => (
                <div
                  className="category-mobile-card"
                  key={category._id}
                >
                  <div className="mobile-category-top">
                    <div>
                      <span className="mobile-category-number">
                        CATEGORY {index + 1}
                      </span>
                      <h3>{category.name}</h3>
                    </div>

                    <span
                      className={`category-status ${
                        category.isActive
                          ? "active-status"
                          : "inactive-status"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mobile-category-details">
                    <div>
                      <span>Slug</span>
                      <p>{category.slug || "-"}</p>
                    </div>

                    <div>
                      <span>Description</span>
                      <p>
                        {category.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="category-action-buttons mobile-actions">
                    <button
                      type="button"
                      className="category-edit-btn"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="category-delete-btn"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
