import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.includes(product._id) || false
  );
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageError
    ? `https://placehold.co/400x400/1c1c27/6c63ff?text=${encodeURIComponent(product.title.charAt(0))}`
    : product.images?.[0]?.url || `https://placehold.co/400x400/1c1c27/6c63ff?text=${encodeURIComponent(product.title.charAt(0))}`;

  const discount =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist');
      return;
    }
    try {
      await authService.toggleWishlist(product._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist! ❤️');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
        size={12}
      />
    ));
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        {/* Image */}
        <div className="product-image-wrapper">
          <img
            src={imageUrl}
            alt={product.title}
            className="product-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* Badges */}
          <div className="product-badges">
            {discount && <span className="badge-discount">-{discount}%</span>}
            {product.stock === 0 && <span className="badge-out">Out of Stock</span>}
            {product.featured && <span className="badge-featured">⭐ Featured</span>}
          </div>

          {/* Quick actions overlay */}
          <div className="product-overlay">
            <button
              className={`action-btn wishlist-btn ${wishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              id={`wishlist-${product._id}`}
            >
              <FiHeart />
            </button>
            <Link
              to={`/products/${product._id}`}
              className="action-btn"
              aria-label="View product"
              id={`view-${product._id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="product-content">
          <span className="product-category">{product.category}</span>
          <h3 className="product-title">{product.title}</h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="product-rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="rating-count">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="product-price">
            <span className="price-current">
              ${(product.discountPrice || product.price).toFixed(2)}
            </span>
            {discount && (
              <span className="price-original">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="product-actions">
        <button
          className={`btn btn-primary btn-full add-cart-btn ${adding ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          id={`add-cart-${product._id}`}
        >
          {adding ? (
            <span className="spinner spinner-sm" />
          ) : (
            <>
              <FiShoppingCart size={16} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
