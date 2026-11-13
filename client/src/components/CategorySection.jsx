
function CategorySection({
  categories,
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <section id="categories" className="section">
      <div className="section-heading">
        <h2>Explore Categories</h2>
        <p>Discover technology based on your interests.</p>
      </div>

      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "category-btn active"
                : "category-btn"
            }
            onClick={() => {
              setSelectedCategory(category);
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
