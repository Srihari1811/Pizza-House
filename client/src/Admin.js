import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCategory from './AddCategory';
import AddProduct from './AddProduct';
import './Admin.css'; // Import custom CSS file for button styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';

function Admin({ onCategoryAdded, categories, onProductAdded }) {
  const [activePage, setActivePage] = useState('category'); // Default to 'category'
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [alertMessage, setAlertMessage] = useState(''); // State to store the alert message
  const navigate = useNavigate();

  const showAddCategory = () => {
    setActivePage('category');
  };

  const showAddProduct = () => {
    setActivePage('product');
  };

  const showMyOrders = () => {
    navigate('/my-orders'); // Navigate to the My Orders page
  };

  const handleNextClick = () => {
    setActivePage('product');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setAlertMessage('Admin logged out successfully.');
    setShowModal(true); // Show the modal
    setTimeout(() => {
      setShowModal(false); // Hide the modal after 2 seconds
      navigate('/'); // Redirect to the home page
    }, 2000);
  };

  const handleHomeClick = () => {
    handleLogout(); // Log out the user and then navigate to the home page
  };

  return (
    <div className="container-fluid p-0">
      {/* Icons for Logout and Home */}
      <div className="d-flex justify-content-between align-items-center p-3">
        <FontAwesomeIcon
          icon={faSignOutAlt}
          onClick={handleLogout}
          style={{
            fontSize: '2rem',
            color: '#dc3545',
            cursor: 'pointer',
          }}
        />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
          }}>
            Admin Page
          </h1>
        </div>
        <FontAwesomeIcon
          icon={faHome}
          onClick={handleHomeClick}
          style={{
            fontSize: '2rem',
            color: '#007bff',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Buttons for Add Category, Add Product, and My Orders */}
      <div className="d-flex justify-content-around mt-4">
        <button
          className="custom-btn custom-btn-category"
          onClick={showAddCategory}
        >
          Add Category
        </button>
        <button
          className="custom-btn custom-btn-product"
          onClick={showAddProduct}
        >
          Add Product
        </button>
        <button
          className="custom-btn custom-btn-orders"
          onClick={showMyOrders}
        >
          My Orders
        </button>
      </div>

      {/* Conditional Rendering of AddCategory and AddProduct components */}
      <div className="mt-4">
        {activePage === 'category' && (
          <div>
            <AddCategory onCategoryAdded={onCategoryAdded} onNextClick={handleNextClick} />
          </div>
        )}
        {activePage === 'product' && (
          <div>
            <AddProduct categories={categories} onProductAdded={onProductAdded} />
          </div>
        )}
      </div>

      {/* Modal for Logout Alert */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)',color:'black' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-body text-center">
                <h4>{alertMessage}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
