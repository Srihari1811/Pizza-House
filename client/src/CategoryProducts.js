import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CategoryProducts.css';

function CategoryProducts() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState('');
  const [addedItemsCount, setAddedItemsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/addproducts/${categoryId}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();

    const existingCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const storedCount = existingCart.length;
    if (storedCount > 0) {
      setAddedItemsCount(storedCount);
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [categoryId]);

  const addToCart = (product) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const productInCart = existingCart.find(item => item._id === product._id);

      if (productInCart) {
        setNotification(`Product "${product.name}" already added, Check in My Cart Page.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          setNotification('');
        }, 3000);
      } else {
        const updatedCart = [...existingCart, { ...product, quantity: 1 }];
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        const newCount = updatedCart.length;
        setAddedItemsCount(newCount);
        setNotification(`Product "${product.name}" added to cart!`);
        setShowAlert(true);

        localStorage.setItem('addedItemsCount', newCount);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="navigation-container d-flex justify-content-between align-items-center mb-4">
        <Link to="/" className="text-white" style={{ fontSize: '1.5rem' }}>
          <FaArrowLeft />
        </Link>

        <h2 className="products-title" style={{
              fontFamily: "'Pacifico', cursive",
              color: "#ffffff",
              fontSize: "2.5rem",
              textShadow: "2px 2px 5px rgba(0,0,0,0.5)",
              textDecoration: "none",
              fontWeight: 'bold',}}>Items</h2>

        <Link to="/cart" className="text-white" style={{ fontSize: '1.5rem' }}>
          <FaShoppingCart />
        </Link>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          className="form-control search-input" 
          placeholder="Search products..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {notification && (
  <div className="alert notification-alert" role="alert">
    {notification}
  </div>
)}

      <div className="row justify-content-center">
        {filteredProducts.map(product => (
          <div key={product._id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className={`card shadow-sm w-100 ${product.available ? 'bg-dark text-white' : 'bg-secondary text-white'}`} style={{ padding: '0.5rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">₹{product.price}</p>
                </div>
                <div className="text-end d-flex flex-column align-items-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-image" 
                  />
                  {!product.available && (
                    <div className="unavailable-overlay">
                      Currently Unavailable
                    </div>
                  )}
                  {product.available && (
                    <button 
                      className="btn btn-primary btn-sm mt-2 w-100" 
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAlert && (
        <div className="fixed-bottom d-flex justify-content-center" >
          <div 
            className="alert mb-3 d-flex align-items-center" 
            role="alert"
          >
            <span>{`${addedItemsCount} item${addedItemsCount > 1 ? 's' : ''} added to cart.`}</span>
            <Link to="/cart" className="text-black font-weight-bold ml-2" style={{marginLeft:"40px"}}>
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryProducts;
