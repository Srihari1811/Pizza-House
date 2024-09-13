const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require('razorpay');

// Initialize environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

// Create Express app
const app = express(); 
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Category model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  available: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model('Product', productSchema);

// Order model
const orderSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  totalAmount: Number,
  products: Array,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Undelivered' },
  tableNumber: { type: Number, required: true } // Add tableNumber field
});

const Order = mongoose.model('Order', orderSchema);


// Admin model
const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

// Function to validate admin credentials
async function validateAdminCredentials(adminId, password) {
  try {
    const admin = await Admin.findOne({ adminId, password });
    return !!admin;
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return false;
  }
}

// Routes
app.post('/validate-admin', async (req, res) => {
  const { adminId, password } = req.body;
  const isValid = await validateAdminCredentials(adminId, password);
  res.json({ isValid });
});

app.post('/submitOrder', async (req, res) => {
  const { name, mobile, amount, products, tableNumber } = req.body; // Include tableNumber in the request body

  try {
    const newOrder = new Order({
      name,
      mobile,
      totalAmount: amount,
      products,
      tableNumber // Save tableNumber
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save order', error });
  }
});


app.get('/',(req,res) =>{
  res.send("Hi")
});

app.get('/getOrders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});


app.post('/updateOrderStatus/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (status !== 'Delivered') {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

app.post('/addCategories', async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: 'Name and image URL are required' });
  }

  try {
    const newCategory = new Category({ name, imageUrl });
    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully', category: newCategory });
  } catch (error) {
    console.error('Failed to add category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.get('/addcategories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.put('/updateCategory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, imageUrl },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

app.delete('/deleteCategory/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category removed successfully' });
  } catch (error) {
    console.error('Error removing category:', error);
    res.status(500).json({ message: 'Failed to remove category' });
  }
});

// Route to add a new product
app.post('/addProducts', async (req, res) => {
  try {
    const { name, price, category, imageUrl, available } = req.body;

    // Find the category by ID to ensure it exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create a new product with the provided data
    const newProduct = new Product({
      name,
      price,
      imageUrl,
      category, // Associate the product with the category
      available
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Route to fetch all products
app.get('/addproducts', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.status(200).json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/addproducts/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  // Validate categoryId format (assuming it’s an ObjectId)
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID format' });
  }

  try {
    // Find products by category ID
    const products = await Product.find({ category: categoryId });

    // Check if any products were found
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/addproducts', async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};

    if (category) {
      filter.categoryId = category;
    }

    if (available) {
      filter.available = available === 'true';
    }

    const products = await Product.find(filter).populate('categoryId', 'name');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.put('/addproducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { available, name, price,imageUrl } = req.body;

    // Find the product by ID and update its availability, name, and price
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { available, name, price,imageUrl },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});


app.delete('/addproducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


const razorpayInstance = new Razorpay({
   key_id: 'rzp_live_eHl1IKa1mogqyP',
  key_secret: '59ZVbFLT54EgMi9n7EtJh7cD'
});

app.post('/pay', async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `${Date.now()}`,
      payment_capture: 1
    });

    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
