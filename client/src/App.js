import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Admin from './Admin';
import CategoryProducts from './CategoryProducts';
import CartPage from './Cartpage';
import PaymentPage from './PaymentPage';
import MyOrders from './MyOrders';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* <Route path="/" element={<ProductPage />} /> */}
      </Routes>
    </Router>
    
  );
}

export default App;
