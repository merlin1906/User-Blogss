
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminArticles,
  createAdminArticle,
  updateAdminArticle,
} from "../services/adminService";

import "../Admin.css";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_IMAGES = 10;

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${SERVER_URL}${image}`;
};

const createBlockKey = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toLocalDateTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const offset = parsedDate.getTimezoneOffset() * 60000;

  return new Date(parsedDate.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const getCurrentLocalDateTime = () => {
  const offset = new Date().getTimezoneOffset() * 60000;

  return new Date(Date.now() - offset)
    .toISOString()
    .slice(0, 16);
};

// Convert saved article content into editable blocks.
// Existing image blocks are retained.
const normalizeContent = (content) => {
  if (typeof content === "string") {
    return content
      .split(/\n+/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({
        _key: createBlockKey(),
        type: "paragraph",
        text,
      }));
  }

  if (!Array.isArray(content)) {
    return [
      {
        _key: createBlockKey(),
        type: "paragraph",
        text: "",
      },
    ];
  }

  const blocks = content.map((item) => {
    if (typeof item === "string") {
      return {
        _key: createBlockKey(),
        type: "paragraph",
        text: item,
      };
    }

    return {
      ...item,
      _key: createBlockKey(),
      type: item.type || "paragraph",
    };
  });

  return blocks.length
    ? blocks
    : [
        {
          _key: createBlockKey(),
          type: "paragraph",
          text: "",
        },
      ];
};

function AddArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    author: "",
    category: "",
    status: "DRAFT",
    scheduledAt: "",
    featured: false,
    trending: false,
    metaTitle: "",
    metaDescription: "",
  });

  const [contentBlocks, setContentBlocks] = useState([
    {
      _key: createBlockKey(),
      type: "paragraph",
      text: "",
    },
  ]);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const contentBlocksRef = useRef(contentBlocks);

  useEffect(() => {
    contentBlocksRef.current = contentBlocks;
  }, [contentBlocks]);

  // Clean up temporary image preview URLs.
  useEffect(() => {
    return () => {
      contentBlocksRef.current.forEach((block) => {
        if (block.preview && block.file) {
          URL.revokeObjectURL(block.preview);
        }
      });
    };
  }, []);

  // Load categories and existing article.
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [categoryResponse, articleResponse] = await Promise.all([
          fetch(`${API_URL}/categories`),
          isEditing ? getAdminArticles() : Promise.resolve(null),
        ]);

        const categoryData = await categoryResponse.json();

        if (!categoryResponse.ok) {
          throw new Error(
            categoryData.message || "Unable to load categories"
          );
        }

        setCategories(
          categoryData.categories ||
          categoryData.data ||
          []
        );

        if (isEditing) {
          const article = articleResponse.articles?.find(
            (item) => item._id === id
          );

          if (!article) {
            throw new Error("Article not found");
          }

          setForm({
            title: article.title || "",
            slug: article.slug || "",
            description: article.description || "",
            author: article.author || "",
            category: article.category?._id || article.category || "",
            status: article.status || "DRAFT",
            scheduledAt: toLocalDateTime(article.scheduledAt),
            featured: Boolean(article.featured),
            trending: Boolean(article.trending),
            metaTitle: article.metaTitle || "",
            metaDescription: article.metaDescription || "",
          });

          setContentBlocks(normalizeContent(article.content));

          setTags(Array.isArray(article.tags) ? article.tags : []);

          setPreview(getImageUrl(article.thumbnail));
        }
      } catch (err) {
        setError(err.message || "Unable to load article");
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [id, isEditing]);

  // Thumbnail preview.
  useEffect(() => {
    if (!selectedImage) return;

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Content block helpers.
  const updateContentBlock = (key, field, value) => {
    setContentBlocks((previous) =>
      previous.map((block) =>
        block._key === key
          ? { ...block, [field]: value }
          : block
      )
    );
  };

  const addParagraph = () => {
    setContentBlocks((previous) => [
      ...previous,
      {
        _key: createBlockKey(),
        type: "paragraph",
        text: "",
      },
    ]);
  };

  const removeContentBlock = (key) => {
    const block = contentBlocks.find((item) => item._key === key);

    if (block?.preview && block.file) {
      URL.revokeObjectURL(block.preview);
    }

    setContentBlocks((previous) =>
      previous.filter((item) => item._key !== key)
    );
  };

  // Add multiple images to article content.
  const handleContentImages = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setError("");

    const currentUploadCount = contentBlocks.filter(
      (block) => block.file
    ).length;

    if (currentUploadCount + files.length > MAX_CONTENT_IMAGES) {
      setError(`You can upload a maximum of ${MAX_CONTENT_IMAGES} new content images.`);
      e.target.value = "";
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, WEBP and GIF images are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError("Each content image must be below 5 MB.");
        e.target.value = "";
        return;
      }
    }

    const newBlocks = files.map((file) => ({
      _key: createBlockKey(),
      type: "image",
      file,
      preview: URL.createObjectURL(file),
      alt: "",
      caption: "",
    }));

    setContentBlocks((previous) => [
      ...previous,
      ...newBlocks,
    ]);

    e.target.value = "";
  };

  // Add and remove tags.
  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/^#/, "");

    if (!newTag) return;

    const alreadyExists = tags.some(
      (tag) => tag.toLowerCase() === newTag.toLowerCase()
    );

    if (!alreadyExists) {
      setTags((previous) => [...previous, newTag]);
    }

    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((previous) =>
      previous.filter((tag) => tag !== tagToRemove)
    );
  };

  // Thumbnail validation.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, WEBP or GIF thumbnail.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Thumbnail size must be below 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
  };

  // Submit article.
  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setError("");

    const hasTextContent = contentBlocks.some(
      (block) =>
        block.type === "paragraph" &&
        String(block.text || "").trim()
    );

    const hasImageContent = contentBlocks.some(
      (block) =>
        block.type === "image" &&
        (block.file || block.src || block.url)
    );

    if (!hasTextContent && !hasImageContent) {
      setError("Please add article text or at least one content image.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.author.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    let scheduleISO = "";

    if (status === "SCHEDULED") {
      if (!form.scheduledAt) {
        setError("Please select a schedule date and time.");
        return;
      }

      const selectedDate = new Date(form.scheduledAt);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate.getTime() <= Date.now()
      ) {
        setError("Schedule date and time must be in the future.");
        return;
      }

      scheduleISO = selectedDate.toISOString();
    }

    const finalTags = [...tags];
    const pendingTag = tagInput.trim().replace(/^#/, "");

    if (
      pendingTag &&
      !finalTags.some(
        (tag) => tag.toLowerCase() === pendingTag.toLowerCase()
      )
    ) {
      finalTags.push(pendingTag);
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("description", form.description);

      // Convert ordered editor blocks into backend content.
      let imageIndex = 0;

      const finalContent = [];

      contentBlocks.forEach((block) => {
        if (block.type === "paragraph") {
          const text = String(block.text || "").trim();

          if (text) {
            finalContent.push({
              type: "paragraph",
              text,
            });
          }

          return;
        }

        if (block.type === "image") {
          const imageBlock = {
            type: "image",
            alt: block.alt || "",
            caption: block.caption || "",
          };

          if (block.file) {
            imageBlock.imageIndex = imageIndex;

            formData.append("contentImages", block.file);

            imageIndex += 1;
          } else {
            imageBlock.src = block.src || block.url;
          }

          finalContent.push(imageBlock);
          return;
        }

        // Preserve any other existing content block types.
        const {
          _key,
          preview: ignoredPreview,
          file: ignoredFile,
          ...savedBlock
        } = block;

        finalContent.push(savedBlock);
      });

      formData.append("content", JSON.stringify(finalContent));

      formData.append("author", form.author);
      formData.append("category", form.category);
      formData.append("status", status);
      formData.append("scheduledAt", scheduleISO);
      formData.append("featured", String(form.featured));
      formData.append("trending", String(form.trending));

      formData.append("tags", JSON.stringify(finalTags));

      formData.append("metaTitle", form.metaTitle);
      formData.append("metaDescription", form.metaDescription);

      // Thumbnail.
      if (selectedImage) {
        formData.append("thumbnail", selectedImage);
      }

      if (isEditing) {
        await updateAdminArticle(id, formData);
      } else {
        await createAdminArticle(formData);
      }

      alert(
        status === "SCHEDULED"
          ? "Article scheduled successfully!"
          : status === "PUBLISHED"
            ? isEditing
              ? "Article updated and published successfully!"
              : "Article published successfully!"
            : "Article saved as draft!"
      );

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Unable to save article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading article...</div>;
  }

  const existingImageCount = contentBlocks.filter(
    (block) =>
      block.type === "image" &&
      !block.file &&
      (block.src || block.url)
  ).length;

  const newImageCount = contentBlocks.filter(
    (block) => block.file
  ).length;

  return (
    <div className="admin-article-page">
      <div className="admin-article-form-card">

        <div className="admin-form-header">
          <div>
            <p className="admin-form-eyebrow">SOFTRATE BLOG ADMIN</p>
            <h1>{isEditing ? "Edit Article" : "Add New Article"}</h1>
            <p>
              {isEditing
                ? "Update your article details below."
                : "Create and publish a new blog article."}
            </p>
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="admin-form-error">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, "PUBLISHED")}>

          {/* Article Title */}
          <div className="admin-form-group">
            <label htmlFor="title">Article Title *</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter article title"
              required
            />
          </div>

          {/* Custom Slug */}
          <div className="admin-form-group">
            <label htmlFor="slug">Custom URL Slug</label>
            <input
              id="slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="example-blog-article"
            />

            <small>
              Leave empty to automatically generate the URL from the article title.
            </small>

            {form.slug && (
              <small style={{ display: "block", marginTop: "6px" }}>
                URL Preview: /blogs/{form.slug}
              </small>
            )}
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label htmlFor="description">Short Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          {/* Article Content Editor */}
          <div className="admin-form-group">
            <label>Article Content *</label>

            <div style={contentStyles.editor}>
              <div style={contentStyles.editorHeader}>
                <div>
                  <strong>Content Blocks</strong>
                  <p style={contentStyles.helper}>
                    Write paragraphs and insert images into your article.
                  </p>
                </div>

                <span style={contentStyles.counter}>
                  {contentBlocks.length} blocks
                </span>
              </div>

              {contentBlocks.map((block, index) => (
                <div
                  key={block._key}
                  style={contentStyles.block}
                >
                  <div style={contentStyles.blockHeader}>
                    <strong>
                      {block.type === "image"
                        ? `Image ${index + 1}`
                        : `Paragraph ${index + 1}`}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeContentBlock(block._key)}
                      style={contentStyles.removeButton}
                    >
                      Remove
                    </button>
                  </div>

                  {block.type === "paragraph" && (
                    <textarea
                      value={block.text || ""}
                      onChange={(e) =>
                        updateContentBlock(
                          block._key,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="Write your paragraph here..."
                      rows="5"
                      style={contentStyles.paragraphInput}
                    />
                  )}

                  {block.type === "image" && (
                    <div>
                      <img
                        src={
                          block.file
                            ? block.preview
                            : getImageUrl(block.src || block.url)
                        }
                        alt={block.alt || "Article content"}
                        style={contentStyles.contentImagePreview}
                      />

                      <div style={{ marginTop: "14px" }}>
                        <label style={contentStyles.fieldLabel}>
                          Image Alt Text
                        </label>

                        <input
                          type="text"
                          value={block.alt || ""}
                          onChange={(e) =>
                            updateContentBlock(
                              block._key,
                              "alt",
                              e.target.value
                            )
                          }
                          placeholder="Describe the image"
                        />
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <label style={contentStyles.fieldLabel}>
                          Image Caption
                        </label>

                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateContentBlock(
                              block._key,
                              "caption",
                              e.target.value
                            )
                          }
                          placeholder="Enter image caption (optional)"
                        />
                      </div>

                      {block.file && (
                        <small style={contentStyles.newImageLabel}>
                          New image — will be uploaded when you save.
                        </small>
                      )}

                      {!block.file && (
                        <small style={contentStyles.existingImageLabel}>
                          Existing saved image
                        </small>
                      )}
                    </div>
                  )}

                  {block.type !== "paragraph" &&
                    block.type !== "image" && (
                      <div style={contentStyles.unknownBlock}>
                        Existing {block.type || "content"} block preserved.
                      </div>
                    )}
                </div>
              ))}

              <div style={contentStyles.toolbar}>
                <button
                  type="button"
                  onClick={addParagraph}
                  style={contentStyles.addParagraphButton}
                >
                  + Add Paragraph
                </button>

                <label
                  htmlFor="contentImages"
                  style={contentStyles.addImageButton}
                >
                  + Add Images
                </label>

                <input
                  id="contentImages"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleContentImages}
                  style={{ display: "none" }}
                />
              </div>

              <div style={contentStyles.imageInfo}>
                <span>
                  Existing images: {existingImageCount}
                </span>

                <span>
                  New images: {newImageCount}/{MAX_CONTENT_IMAGES}
                </span>
              </div>

              <small style={contentStyles.helper}>
                JPG, PNG, WEBP and GIF. Maximum 5 MB per image.
                Up to 10 new images per save.
              </small>
            </div>
          </div>

          {/* Tags */}
          <div className="admin-form-group">
            <label htmlFor="tagInput">Article Tags</label>

            <div style={tagStyles.inputWrapper}>
              <input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                style={tagStyles.input}
              />

              <button
                type="button"
                onClick={handleAddTag}
                style={tagStyles.addButton}
              >
                + Add Tag
              </button>
            </div>

            <small style={{ color: "#64748b" }}>
              Press Enter or comma to add multiple tags.
            </small>

            <div style={tagStyles.tagList}>
              {tags.map((tag) => (
                <span key={tag} style={tagStyles.tag}>
                  #{tag}

                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={tagStyles.removeButton}
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div style={seoStyles.section}>
            <h2 style={seoStyles.heading}>SEO Settings</h2>

            <p style={seoStyles.description}>
              Add search engine details to help your article appear in search results.
            </p>

            <div className="admin-form-group">
              <label htmlFor="metaTitle">SEO Meta Title</label>

              <input
                id="metaTitle"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                placeholder="Enter SEO title"
                maxLength={60}
              />

              <small>
                Recommended: Up to 60 characters. {form.metaTitle.length}/60
              </small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="metaDescription">SEO Meta Description</label>

              <textarea
                id="metaDescription"
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                placeholder="Write a short description for search engines"
                rows="3"
                maxLength={160}
              />

              <small>
                Recommended: Up to 160 characters. {form.metaDescription.length}/160
              </small>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="admin-form-group">
            <label htmlFor="thumbnail">Upload Thumbnail Image</label>

            <input
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />

            <small>
              JPG, PNG, WEBP or GIF. Maximum size: 5 MB.
            </small>

            {preview && (
              <div style={{ marginTop: "15px" }}>
                <img
                  src={preview}
                  alt="Thumbnail preview"
                  style={{
                    width: "220px",
                    maxHeight: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview("");
                  }}
                  style={{ display: "block", marginTop: "8px" }}
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          {/* Author and Category */}
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="author">Author Name *</label>

              <input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="category">Category</label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured and Trending */}
          <div className="admin-form-options">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
              Featured Article
            </label>

            <label>
              <input
                type="checkbox"
                name="trending"
                checked={form.trending}
                onChange={handleChange}
              />
              Trending Article
            </label>
          </div>

          {/* Schedule Publishing */}
          <div style={scheduleStyles.section}>
            <h2 style={scheduleStyles.heading}>
              Schedule Publishing
            </h2>

            <p style={scheduleStyles.description}>
              Choose a future date and time to automatically publish this article.
            </p>

            <div className="admin-form-group">
              <label htmlFor="scheduledAt">
                Schedule Date & Time
              </label>

              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                min={getCurrentLocalDateTime()}
                onChange={handleChange}
              />

              <small>
                Select a future date and time. The article will remain hidden
                until it is published.
              </small>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-save-draft"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "DRAFT")}
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "SCHEDULED")}
              style={scheduleStyles.button}
            >
              {saving ? "Saving..." : "Schedule Publish"}
            </button>

            <button
              type="submit"
              className="admin-publish-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update & Publish"
                  : "Publish Article"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const contentStyles = {
  editor: {
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    padding: "18px",
    background: "#f8fafc",
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "18px",
  },
  helper: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    marginTop: "6px",
  },
  counter: {
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
  },
  block: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "15px",
    marginBottom: "14px",
  },
  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    color: "#334155",
  },
  removeButton: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "6px",
    padding: "6px 11px",
    cursor: "pointer",
  },
  paragraphInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    resize: "vertical",
    lineHeight: 1.6,
  },
  contentImagePreview: {
    display: "block",
    width: "100%",
    maxWidth: "420px",
    maxHeight: "280px",
    objectFit: "contain",
    borderRadius: "8px",
    background: "#f1f5f9",
    marginBottom: "12px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "7px",
  },
  newImageLabel: {
    display: "block",
    marginTop: "12px",
    color: "#15803d",
    fontWeight: 600,
  },
  existingImageLabel: {
    display: "block",
    marginTop: "12px",
    color: "#64748b",
  },
  unknownBlock: {
    padding: "12px",
    background: "#f1f5f9",
    color: "#64748b",
    borderRadius: "6px",
    fontSize: "13px",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },
  addParagraphButton: {
    padding: "11px 16px",
    background: "#e0e7ff",
    color: "#3730a3",
    border: "none",
    borderRadius: "7px",
    fontWeight: 600,
    cursor: "pointer",
  },
  addImageButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 16px",
    background: "#3730a3",
    color: "#fff",
    borderRadius: "7px",
    fontWeight: 600,
    cursor: "pointer",
  },
  imageInfo: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "16px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
  },
};

const tagStyles = {
  inputWrapper: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    flex: "1",
    minWidth: "180px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
  },
  addButton: {
    padding: "12px 18px",
    background: "#3730a3",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  removeButton: {
    background: "transparent",
    border: "none",
    color: "#3730a3",
    fontSize: "19px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  },
};

const seoStyles = {
  section: {
    margin: "25px 0",
    padding: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc",
  },
  heading: {
    margin: "0 0 8px",
    fontSize: "20px",
    color: "#1e293b",
  },
  description: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "20px",
  },
};

const scheduleStyles = {
  section: {
    margin: "25px 0",
    padding: "22px",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#eef2ff",
  },
  heading: {
    margin: "0 0 8px",
    fontSize: "20px",
    color: "#312e81",
  },
  description: {
    color: "#475569",
    fontSize: "14px",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 20px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AddArticle;
