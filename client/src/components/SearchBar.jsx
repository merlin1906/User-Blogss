
function SearchBar({ search = "", setSearch }) {
  const handleChange = (event) => {
    setSearch?.(event.target.value);
  };

  const clearSearch = () => {
    setSearch?.("");
  };

  return (
    <div className="search-container">
      <input
        type="search"
        placeholder="Search technology articles..."
        value={search}
        onChange={handleChange}
        aria-label="Search articles by title, description, category or author"
        autoComplete="off"
      />

      <span aria-hidden="true">⌕</span>

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          className="search-clear-button"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;
