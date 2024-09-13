// HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomePage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0); // State to hold cart count
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://pizza-house-api.vercel.app/addcategories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      const totalItems = cartData.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(totalItems);
    }
  }, []); // Load cart count on component mount

  const handleAdminLogin = async () => {
    try {
      const response = await axios.post('https://pizza-house-api.vercel.app/validate-admin', {
        adminId,
        password,
      });

      if (response.data.isValid) {
        setIsLoggedIn(true);
        setShowModal(false);
        navigate('/admin');
      } else {
        alert('Incorrect Admin ID or Password!');
      }
    } catch (error) {
      console.error('Error validating admin credentials:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentMonth = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    return monthNames[currentDate.getMonth()];
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="homepage-container bg-dark text-light">
    
      {/* Admin Login Modal */}
      {showModal && (
        <div className="modal show" style={{ display: 'block' }} >
          <div className="modal-dialog">
          <div className="modal-content" style={{ 
  backgroundImage: `url('https://img.freepik.com/free-vector/blue-curve-background_53876-113112.jpg')`, 
  backgroundSize: 'cover', 
  backgroundPosition: 'center' 
}}>
              <div className="modal-header" >
                <h5 className="modal-title" style={{color:'black'}}>Admin Login</h5>
                <button type="button" className="close" style={{marginLeft:'20px'}} onClick={() => setShowModal(false)}>
                  &times;
                </button>
              </div>
              <div className="modal-body" >
                <input
                  type="text"
                  placeholder="Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="form-control mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control mb-2"
                />
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button type="button" className="btn btn-primary" onClick={handleAdminLogin}>Login</button>
                {/* <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid text-center">
        
          <Link
            className="navbar-brand mt-3 mb-3 "
            to="/"
            style={{
              fontFamily: "'Pacifico', cursive",
              color: "#ffffff",
              fontSize: "2.5rem",
              textShadow: "2px 2px 5px rgba(0,0,0,0.5)",
              textDecoration: "none",
              fontWeight: 'bold',
              textAlign:"center",
            }}
          >
            Pizza House
          </Link>
      </div>

      <div className="container mt-3">
        <div className="search-bar mb-4">
          <input
            type="text"
            placeholder="What do you want to order?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control search-input"
          />
        </div>

        <h3 className="mt-4 text-center">Special Deals for {getCurrentMonth()}</h3>
        <div className="special-deal text-center mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Special Deal</h5>
              <p className="card-text">Grab your favorite items at amazing prices!</p>
              <Link to="/" className="btn" style={{ backgroundColor: 'black', color: 'yellow' }}>
  Buy Now
</Link>
            </div>
          </div>
        </div>

        <h3 className="mt-4 mb-4 text-center">The Dish Collection</h3>
        <div className="row">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <div key={category._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                <Link to={`/category/${category._id}`} className="text-decoration-none">
                  <div className="card restaurant-card">
                    <img src={category.imageUrl} className="card-img-top" alt={category.name}style={{height:'250px'}} />
                    <div className="card-body">
                      <h5 className="card-title text-center category-name">{category.name}</h5>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="no-results text-center">No categories found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav fixed-bottom" style={{ bottom: "-10px" }}>
        <ul className="navbar-nav flex-row w-100 justify-content-around align-items-center">
          <li className="nav-item">
            <Link className={`nav-link text-light text-center ${getActiveClass('/')}`} to="/">
              <i className="fas fa-home"></i>
              <div>Home</div>
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link text-light text-center ${getActiveClass('/special-deals')}`} to="/">
              <i className="fas fa-gift"></i>
              <div>Deals</div>
            </Link>
          </li>
          <li className="nav-item">
  <Link className={`nav-link text-light text-center ${getActiveClass('/cart')}`} to="/cart">
    <div className="cart-icon-container">
      <i className="fas fa-shopping-cart"></i>
      {cartCount > 0 && (
        <span className="badge rounded-pill bg-danger">{cartCount}</span>
      )}
    </div>
    <div>My Cart</div>
  </Link>
</li>
<li className="nav-item">
      <div
        className="nav-link text-light text-center"
        onClick={() => {
          if (isLoggedIn) {
            alert('You are already logged in.');
          } else {
            setShowModal(true);
          }
        }}
      >
        <i className="fas fa-user-shield"></i>
        <div>Admin</div>
      </div>
    </li>
        </ul>
      </nav>
    </div>
  );
}

export default HomePage;
