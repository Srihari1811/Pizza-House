import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { storage, ref, uploadBytes, getDownloadURL } from './firebase'; // Import from firebase.js
import './AddProduct.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function AddProduct() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductAvailable, setEditProductAvailable] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/addcategories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/addproducts');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by search term
  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add new product
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!productImage) {
      setAlertMessage('Please upload an image.');
      return;
    }

    try {
      const imageRef = ref(storage, `products/${productImage.name}`);
      await uploadBytes(imageRef, productImage);
      const imageUrl = await getDownloadURL(imageRef);

      const formData = {
        name: productName,
        price: productPrice,
        imageUrl: imageUrl,
        category: categoryId,
        available: true, // Default to available
      };

      const response = await axios.post('http://localhost:5000/addProducts', formData);

      setProducts((prevProducts) => [...prevProducts, response.data]);
      setProductName('');
      setProductPrice('');
      setProductImage(null);
      setCategoryId('');
      setAlertMessage('Product added successfully. Click Continue to redirect to HomePage.');
    } catch (error) {
      console.error('Failed to add product:', error);
      setAlertMessage('Failed to add product');
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setEditProductName(product.name);
    setProductImage(product.imageUrl)
    setEditProductPrice(product.price);
    setEditProductAvailable(product.available);
    setShowEditForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
  
    let imageUrl = productImage; // Default to current image URL
  
    // If a new image is selected, upload it to Firebase
    if (productImage && productImage instanceof File) {
      try {
        const imageRef = ref(storage, `products/${productImage.name}`);
        await uploadBytes(imageRef, productImage);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error('Failed to upload image:', error);
        setAlertMessage('Failed to upload image');
        return;
      }
    }
  
    try {
      const response = await axios.put(`http://localhost:5000/addproducts/${editingProductId}`, {
        name: editProductName,
        imageUrl: imageUrl,
        price: editProductPrice,
        available: editProductAvailable,
      });
  
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editingProductId ? response.data : product
        )
      );
      setEditingProductId(null);
      setEditProductName('');
      setEditProductPrice('');
      setEditProductAvailable(true);
      setProductImage(null); // Clear selected image
      setShowEditForm(false);
      setAlertMessage('Product updated successfully');
    } catch (error) {
      console.error('Failed to update product:', error);
      setAlertMessage('Failed to update product');
    }
  };
  
  // Remove product
  const handleRemoveProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/addproducts/${productId}`);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error('Failed to remove product:', error);
      setAlertMessage('Failed to remove product');
    }
  };

  // Toggle product availability
  const handleToggleAvailability = async (productId, currentAvailability) => {
    try {
      const newAvailability = !currentAvailability;
      const response = await axios.put(`http://localhost:5000/addproducts/${productId}`, {
        available: newAvailability
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? response.data : product
        )
      );
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  // Handle alert continuation
  const handleContinue = () => {
    navigate('/');
  };

  // Handle alert back
  const handleBack = () => {
    setAlertMessage(null);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Auto-hide alert messages after a delay
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      {alertMessage ? (
        <div className="alert alert-success w-100 text-center" role="alert" style={{ maxWidth: '600px' }}>
          {alertMessage}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-primary mx-2"
              onClick={handleContinue}
              style={{ borderRadius: '0.25rem' }}
            >
              Continue
            </button>
            <button
              className="btn btn-secondary mx-2"
              onClick={handleBack}
              style={{ borderRadius: '0.25rem' }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {showEditForm ? (
            <div className="product-form p-4 rounded shadow mb-4" style={{ maxWidth: '800px', backgroundColor: '#1f1f1f' }}>
              <h2 className="text-center mb-4">Edit Product</h2>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group mb-3">
                  <label htmlFor="editProductName" style={{color:"skyblue"}}  className="form-label">Product Name</label>
                  <input
                    id="editProductName"
                    type="text"
                    className="form-control"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="productImage" style={{color:"skyblue"}}>Product Image</label>
                  <input
                    id="productImage"
                    type="file"
                    className="form-control"
                    onChange={(e) => setProductImage(e.target.files[0])}
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editProductPrice" style={{color:"skyblue"}} className="form-label">Product Price (INR)</label>
                  <input
                    id="editProductPrice"
                    type="number"
                    className="form-control"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(e.target.value)}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="editProductAvailable" style={{color:"skyblue"}} className="form-label">Available</label>
                  <select
                    id="editProductAvailable"
                    className="form-select"
                    value={editProductAvailable}
                    onChange={(e) => setEditProductAvailable(e.target.value === 'true')}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  >
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ borderRadius: '0.25rem' }}
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="product-form p-4 rounded shadow mb-4" style={{ maxWidth: '800px', backgroundColor: '#1f1f1f' }}>
              <h2 className="text-center mb-4" style={{color:"skyblue"}} >Add New Product</h2>
              <form onSubmit={handleAddProductSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="productName" style={{color:"skyblue"}} className="form-label">Product Name</label>
                  <input
                    id="productName"
                    type="text"
                    className="form-control"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="productPrice" style={{color:"skyblue"}} className="form-label">Product Price (INR)</label>
                  <input
                    id="productPrice"
                    type="number"
                    className="form-control"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="productImage" style={{color:"skyblue"}} className="form-label">Product Image</label>
                  <input
                    id="productImage"
                    type="file"
                    className="form-control"
                    onChange={(e) => setProductImage(e.target.files[0])}
                    required
                    style={{ borderRadius: '0.25rem' }}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="categoryId" style={{color:"skyblue"}} className="form-label">Category</label>
                  <select
                    id="categoryId"
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{ borderRadius: '0.25rem', borderColor: '#ced4da' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ borderRadius: '0.25rem' }}
                  >
                    Add Product
                  </button>
                </div>
              </form>

            </div>
          )}
          <h2 className="text-center mb-4">Products</h2>
          {/* Search Bar */}
          <div className="search-bar mb-4" style={{ maxWidth: '800px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ borderRadius: '2rem', borderColor: '#ced4da' }}
            />
          </div>

          {/* Product List */}
          <div className="product-list w-100" style={{ maxWidth: '800px', backgroundColor: '#1f1f1f' }}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product._id} className="product-item d-flex justify-content-between align-items-center mb-3 p-3 rounded shadow">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem' }}
                  />
                  <div className="product-details ms-3 flex-grow-1">
                    <h5 className="product-name">{product.name}</h5>
                    <p className="product-price">₹{product.price}</p>
                    <p className={`product-availability ${product.available ? 'text-success' : 'text-danger'}`}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div className="product-actions ms-3">
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => handleEdit(product)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveProduct(product._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      className={`btn ${product.available ? 'btn-secondary' : 'btn-success'} ms-2`}
                      onClick={() => handleToggleAvailability(product._id, product.available)}
                    >
                      <FontAwesomeIcon icon={product.available ? faTimesCircle : faCheckCircle} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AddProduct;
