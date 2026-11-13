
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const getCategories = async (options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}/categories`, {
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
    throw new Error(
      `Category API failed: ${response.status}`
    );
  }

  const data = await response.json();

  const categories = Array.isArray(data)
    ? data
    : data?.categories || [];

  const categoryNames = categories
    .map((category) =>
      typeof category === "string"
        ? category
        : category?.name
    )
    .filter(Boolean);

  return [
    "All",
    ...new Set(categoryNames),
  ];
};
