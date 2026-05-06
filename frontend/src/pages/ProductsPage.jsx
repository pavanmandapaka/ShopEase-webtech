import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import { productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import './ProductsPage.css';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Automotive', 'Other'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-numReviews', label: 'Most Reviewed' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedMinPrice = useDebounce(minPrice, 600);
  const debouncedMaxPrice = useDebounce(maxPrice, 600);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category !== 'All' && { category }),
        ...(debouncedMinPrice && { minPrice: debouncedMinPrice }),
        ...(debouncedMaxPrice && { maxPrice: debouncedMaxPrice }),
        ...(minRating && { rating: minRating }),
        ...(searchParams.get('featured') === 'true' && { featured: 'true' }),
      };
      const { data } = await productService.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, category, debouncedMinPrice, debouncedMaxPrice, minRating, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sort, debouncedMinPrice, debouncedMaxPrice, minRating]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('-createdAt');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    search || category !== 'All' || minPrice || maxPrice || minRating;

  return (
    <div className="products-page page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div className="products-page-header">
          <div>
            <h1>
              {category !== 'All' ? category : 'All Products'}
            </h1>
            <p>{loading ? 'Loading...' : `${pagination.total} products found`}</p>
          </div>

          {/* Controls */}
          <div className="products-controls">
            <div className="search-bar">
              <FiSearch className="search-bar-icon" />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                id="products-search-input"
                style={{ paddingLeft: '40px', borderRadius: 'var(--radius-full)' }}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-input form-select"
              style={{ width: 'auto', minWidth: 180 }}
              id="sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              className={`btn btn-secondary ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              id="filter-btn"
            >
              <FiFilter size={16} /> Filters
              {hasActiveFilters && <span className="filter-badge" />}
            </button>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                id="grid-view-btn"
              >
                <FiGrid size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                id="list-view-btn"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="filters-panel glass animate-fade-in">
            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="category-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`category-pill ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                    id={`cat-pill-${cat.toLowerCase().replace(' ', '-')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Min Price ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input"
                  min={0}
                  id="min-price-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Max Price ($)</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input"
                  min={0}
                  id="max-price-input"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="form-input form-select"
                  id="rating-select"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
                <FiX size={14} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="active-filters">
            {category !== 'All' && (
              <span className="filter-tag">
                {category} <button onClick={() => setCategory('All')}><FiX size={12} /></button>
              </span>
            )}
            {minPrice && (
              <span className="filter-tag">
                Min ${minPrice} <button onClick={() => setMinPrice('')}><FiX size={12} /></button>
              </span>
            )}
            {maxPrice && (
              <span className="filter-tag">
                Max ${maxPrice} <button onClick={() => setMaxPrice('')}><FiX size={12} /></button>
              </span>
            )}
            {minRating && (
              <span className="filter-tag">
                {minRating}+ Stars <button onClick={() => setMinRating('')}><FiX size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card product-card-skeleton">
                <div className="skeleton" style={{ aspectRatio: '1' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 18, width: '85%', borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 22, width: '45%', borderRadius: 4 }} />
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                  <div className="skeleton" style={{ height: 40, borderRadius: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <FiSearch size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" onClick={clearFilters} id="reset-filters-btn">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              id="prev-page-btn"
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`page-num ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                    id={`page-${pageNum}-btn`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              id="next-page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
