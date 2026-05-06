import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiArrowLeft, FiStar, FiMinus, FiPlus,
  FiTruck, FiShield, FiRefreshCw, FiShare2, FiCheck, FiPackage
} from 'react-icons/fi';
import { productService, authService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await productService.getProduct(id);
        setProduct(data.product);
        setWishlisted(user?.wishlist?.includes(id) || false);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, user]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    setAdding(true);
    const success = await addToCart(product._id, quantity);
    setAdding(false);
    if (success) navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      await authService.toggleWishlist(product._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setReviewLoading(true);
    try {
      const { data } = await productService.addReview(product._id, reviewForm);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const discount = product?.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const renderStars = (rating, interactive = false, onSet) => (
    <div className={`star-row ${interactive ? 'interactive' : ''}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          size={interactive ? 22 : 14}
          className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
          onClick={interactive && onSet ? () => onSet(i + 1) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="product-detail-page page-wrapper">
        <div className="container">
          <div className="detail-skeleton">
            <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="skeleton" style={{ height: 32, width: '70%' }} />
              <div className="skeleton" style={{ height: 20, width: '40%' }} />
              <div className="skeleton" style={{ height: 50, width: '50%' }} />
              <div className="skeleton" style={{ height: 100 }} />
              <div className="skeleton" style={{ height: 52 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const effectivePrice = product.discountPrice || product.price;

  return (
    <div className="product-detail-page page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="breadcrumb-current">{product.title}</span>
        </div>

        {/* Main Grid */}
        <div className="detail-grid">
          {/* Images */}
          <div className="detail-images">
            <div className="main-image-wrapper">
              <img
                src={product.images[selectedImage]?.url || 'https://placehold.co/600x600/1c1c27/6c63ff?text=Product'}
                alt={product.title}
                className="main-image"
                onError={(e) => { e.target.src = 'https://placehold.co/600x600/1c1c27/6c63ff?text=Product'; }}
              />
              {discount && <div className="detail-discount-badge">-{discount}%</div>}
              {product.stock === 0 && (
                <div className="out-of-stock-overlay">Out of Stock</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="thumbnail-row">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                    id={`thumb-${i}`}
                  >
                    <img src={img.url} alt={`View ${i + 1}`}
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80/1c1c27/6c63ff?text=?'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-meta">
              <span className="detail-category">{product.category}</span>
              {product.featured && (
                <span className="badge badge-warning">Featured</span>
              )}
            </div>
            <h1 className="detail-title">{product.title}</h1>

            {/* Rating */}
            <div className="detail-rating">
              {renderStars(product.rating)}
              <span className="rating-score">{product.rating}</span>
              <span className="rating-count">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="detail-price-block">
              <span className="detail-price">${effectivePrice.toFixed(2)}</span>
              {discount && (
                <>
                  <span className="detail-original">${product.price.toFixed(2)}</span>
                  <span className="detail-save">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? (
                <><FiCheck size={14} /> In Stock ({product.stock} available)</>
              ) : (
                <><FiPackage size={14} /> Out of Stock</>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="quantity-block">
                <span className="qty-label">Quantity</span>
                <div className="qty-controls" style={{ gap: 12 }}>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    id="qty-dec"
                  >
                    <FiMinus />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    id="qty-inc"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                id="add-to-cart-btn"
              >
                {adding ? <span className="spinner spinner-sm" /> : <><FiShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button
                className="btn btn-accent btn-lg"
                style={{ flex: 1 }}
                onClick={handleBuyNow}
                disabled={adding || product.stock === 0}
                id="buy-now-btn"
              >
                Buy Now
              </button>
              <button
                className={`btn btn-secondary detail-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
                id="wishlist-btn"
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <FiShield size={16} /> Secure Checkout
              </div>
              <div className="trust-badge">
                <FiTruck size={16} /> Free over $50
              </div>
              <div className="trust-badge">
                <FiRefreshCw size={16} /> 30-Day Returns
              </div>
            </div>

            {/* Seller */}
            <div className="detail-seller">
              <span>Sold by</span>
              <strong>{product.seller?.name}</strong>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tab-buttons">
            {['description', 'reviews'].map((t) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
                id={`tab-${t}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'reviews' && ` (${product.numReviews})`}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {tab === 'description' && (
            <div className="tab-content animate-fade-in">
              <p className="product-description">{product.description}</p>
              {product.tags?.length > 0 && (
                <div className="product-tags">
                  {product.tags.map((tag) => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {tab === 'reviews' && (
            <div className="tab-content animate-fade-in">
              {/* Add Review */}
              {isAuthenticated && !product.reviews?.find((r) => r.user === user?._id) && (
                <div className="review-prompt">
                  {!showReviewForm ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowReviewForm(true)}
                      id="write-review-btn"
                    >
                      <FiStar /> Write a Review
                    </button>
                  ) : (
                    <form className="review-form glass" onSubmit={handleReview}>
                      <h3>Write Your Review</h3>
                      <div className="form-group">
                        <label className="form-label">Your Rating</label>
                        {renderStars(reviewForm.rating, true, (r) =>
                          setReviewForm((p) => ({ ...p, rating: r }))
                        )}
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="review-comment">Comment</label>
                        <textarea
                          id="review-comment"
                          className="form-input"
                          rows={4}
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="btn btn-primary" disabled={reviewLoading} id="submit-review-btn">
                          {reviewLoading ? <span className="spinner spinner-sm" /> : 'Submit Review'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowReviewForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews List */}
              {product.reviews?.length === 0 ? (
                <div className="no-reviews">
                  <FiStar size={32} style={{ opacity: 0.3 }} />
                  <p>No reviews yet. Be the first to review this product.</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-avatar">
                          {review.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{review.name}</strong>
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
