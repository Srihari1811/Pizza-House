import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css'; // Import your custom CSS file
import { FaArrowLeft, FaHome } from 'react-icons/fa'; // Importing icons

function CartPage() {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userId] = useState('user123'); // Define a static user ID for testing
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
      calculateTotalPrice(cartData);
    } else {
      fetchCartData();
    }
  }, [userId]);

  const fetchCartData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      const cartData = response.data;
      setCart(cartData);
      calculateTotalPrice(cartData);
      localStorage.setItem('cartItems', JSON.stringify(cartData)); // Store cart items in localStorage
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const calculateTotalPrice = (cart) => {
    let total = 0;
    cart.forEach(item => {
      total += item.price * (item.quantity || 1);
    });
    setTotalPrice(total);
  };

  const updateQuantity = async (id, change) => {
    try {
      const updatedCart = cart.map(item => {
        if (item._id === id) {
          item.quantity = (item.quantity || 1) + change;
          if (item.quantity <= 0) {
            item.quantity = 1; // Prevent quantity from being zero or negative
          }
        }
        return item;
      });

      setCart(updatedCart);
      calculateTotalPrice(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      // Update the cart on the server-side
      await axios.post(`http://localhost:5000/cart/${userId}`, { cart: updatedCart });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (id) => {
    try {
      const updatedCart = cart.filter(item => item._id !== id);

      setCart(updatedCart);
      calculateTotalPrice(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      // Update the cart on the server-side
      await axios.post(`http://localhost:5000/cart/${userId}`, { cart: updatedCart });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const payNow = () => {
    const totalAmount = totalPrice;
    navigate(`/payment?amount=${encodeURIComponent(totalAmount)}`);
  };

  const addMoreProducts = () => {
    navigate('/'); // Redirects to the home page
  };

  const goBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container mt-4 cart-container">
      <div className="d-flex align-items-center mb-4 header">
        <button className="btn btn-link me-3" onClick={goBack}>
          <FaArrowLeft size={30} color="#007bff" /> {/* Set color here */}
        </button>
        <h3 className="flex-grow-1 text-center custom-cart-title">Cart List</h3>
        <button className="btn btn-link ms-3" onClick={() => navigate('/')}>
          <FaHome size={30} color="#007bff" /> {/* Set color here */}
        </button>
      </div>
      <div className="row justify-content-center">
        {cart.length > 0 ? (
          cart.map(item => (
            <div key={item._id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card custom-card">
                <img src={item.imageUrl} className="card-img-top custom-card-img" alt={item.name} />
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title custom-card-title">{item.name}</h5>
                    <div className="d-flex align-items-center">
                      <button className="btn custom-quantity-button" onClick={() => updateQuantity(item._id, -1)}>-</button>
                      <span className="custom-quantity-display">{item.quantity || 1}</span>
                      <button className="btn custom-quantity-button" onClick={() => updateQuantity(item._id, 1)}>+</button>
                    </div>
                  </div>
                  <p className="card-text custom-card-text">Price: ₹{item.price}</p>
                  <button className="btn custom-remove-button mt-2" onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <h4>Your cart is empty</h4>
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="mt-4 text-center">
          <h4 className="custom-total-price">Total Price: ₹{totalPrice}</h4>
          <button className="btn custom-pay-button me-2" onClick={payNow}>Order Now</button>
          <button className="btn custom-add-more-button" onClick={addMoreProducts}>Add More Products</button>
        </div>
      )}
    </div>
  );
}

export default CartPage;
