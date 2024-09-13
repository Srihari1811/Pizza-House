import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { storage, ref, uploadBytes, getDownloadURL } from './firebase'; // Import from firebase.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function AddCategory({ onCategoryAdded, onNextClick }) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState(''); // URL for the existing image
  const [categories, setCategories] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // 'success' or 'error'
  const [editMode, setEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/addcategories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setAlertMessage('Failed to fetch categories');
      setAlertType('error');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage('');
        fetchCategories();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode) {
      // If editing an existing category
      try {
        let imageUrl = categoryImageUrl; // Use existing image URL by default

        if (categoryImage) {
          const imageRef = ref(storage, `categories/${categoryImage.name}`);
          await uploadBytes(imageRef, categoryImage);
          imageUrl = await getDownloadURL(imageRef);
        }

        const formData = { name: categoryName, imageUrl };

        const response = await axios.put(`http://localhost:5000/updateCategory/${editCategoryId}`, formData);

        if (response.status === 200) {
          setAlertMessage('Category updated successfully');
          setAlertType('success');
          resetForm();
        } else {
          setAlertMessage('Unexpected response status');
          setAlertType('error');
        }
      } catch (error) {
        console.error('Error updating category:', error);
        setAlertMessage(error.response?.data?.error || 'Failed to update category');
        setAlertType('error');
      }
    } else {
      // If adding a new category
      if (!categoryImage) {
        setAlertMessage('Please upload an image.');
        setAlertType('error');
        return;
      }

      try {
        const imageRef = ref(storage, `categories/${categoryImage.name}`);
        await uploadBytes(imageRef, categoryImage);
        const imageUrl = await getDownloadURL(imageRef);

        const formData = { name: categoryName, imageUrl };

        const response = await axios.post('http://localhost:5000/addCategories', formData);

        if (response.status === 201) {
          setAlertMessage(response.data.message);
          setAlertType('success');
          resetForm();
        } else {
          setAlertMessage('Unexpected response status');
          setAlertType('error');
        }
      } catch (error) {
        console.error('Error adding category:', error);
        setAlertMessage(error.response?.data?.error || 'Failed to add category');
        setAlertType('error');
      }
    }
  };

  const handleEdit = (categoryId) => {
    const categoryToEdit = categories.find((category) => category._id === categoryId);
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name);
      setCategoryImageUrl(categoryToEdit.imageUrl); // Set the existing image URL
      setEditMode(true);
      setEditCategoryId(categoryId);
      
      // Scroll to the top of the page
      window.scrollTo(0, 0);
    }
  };

  const handleRemove = async (categoryId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/deleteCategory/${categoryId}`);
      if (response.status === 200) {
        setAlertMessage('Category removed successfully');
        setAlertType('success');
        fetchCategories();
      } else {
        setAlertMessage('Failed to remove category');
        setAlertType('error');
      }
    } catch (error) {
      console.error('Error removing category:', error);
      setAlertMessage('Failed to remove category');
      setAlertType('error');
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryImage('');
    setCategoryImageUrl('');
    setEditMode(false);
    setEditCategoryId(null);
    fileInputRef.current.value = ''; // Clear the file input
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-6 mx-auto">
          <div className="card p-4 shadow-lg">
            <h2 className="text-center mb-4" style={{color:"skyblue"}}>{editMode ? 'Update Category' : 'Add New Category'}</h2>
            {alertMessage && (
              <div className={`alert alert-${alertType}`} role="alert">
                {alertMessage}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="categoryName" style={{color:"skyblue"}} className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="categoryImage"style={{color:"skyblue"}} className="form-label">Category Image</label>
                {categoryImageUrl && !categoryImage && (
                  <img src={categoryImageUrl} alt="Category" className="img-thumbnail mb-3" style={{ maxHeight: '150px' }} />
                )}
                <input
                  type="file"
                  className="form-control"
                  id="categoryImage"
                  accept="image/*"
                  onChange={(e) => setCategoryImage(e.target.files[0])}
                  ref={fileInputRef} // Attach the ref to the input field
                  required={!editMode} // Required only when adding a new category
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">{editMode ? 'Update Category' : 'Add Category'}</button>
            </form>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <h3 className="text-center mb-4">Existing Categories</h3>
        <div className="col-lg-12">
          <div className="row">
            {categories.map((category) => (
              <div className="col-lg-4 col-md-6 mb-4" key={category._id}>
                <div className="card h-100 shadow-sm">
                  <img src={category.imageUrl} className="card-img-top" alt={category.name} style={{ height: '200px', objectFit: 'cover' }} />
                  <div className="card-body text-center">
                    <h5 className="card-title" style={{color:'white'}}>{category.name}</h5>
                    <button className="btn btn-warning me-2" onClick={() => handleEdit(category._id)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleRemove(category._id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCategory;
