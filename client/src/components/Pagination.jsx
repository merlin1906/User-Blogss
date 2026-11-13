
function Pagination({
  visibleCount = 0,
  totalCount = 0,
  onLoadMore,
  loading = false,
}) {
  const visible = Math.max(0, Number(visibleCount) || 0);
  const total = Math.max(0, Number(totalCount) || 0);

  if (visible >= total || total === 0) {
    return null;
  }

  return (
    <div className="pagination">
      <p aria-live="polite">
        Showing {visible} of {total} articles
      </p>

      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading || typeof onLoadMore !== "function"}
      >
        {loading ? "Loading..." : "Load More Articles"}
      </button>
    </div>
  );
}

export default Pagination;
