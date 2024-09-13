import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PaymentPage.css';
import { FaHome, FaArrowLeft } from 'react-icons/fa'; // Import icons

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const amount = parseFloat(queryParams.get('amount')) || 0;
  const formattedAmount = amount.toFixed(2);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [tableNumber, setTableNumber] = useState(''); // New state for table number
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orderDate, setOrderDate] = useState(''); // New state for order date
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully.');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script.');
    };
    document.body.appendChild(script);

    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:5000/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: formattedAmount }),
      });

      const { orderId: newOrderId } = await response.json();

      if (window.Razorpay) {
        const options = {
          key: 'rzp_live_eHl1IKa1mogqyP', // Your Razorpay key
          amount: Math.round(formattedAmount * 100),
          currency: 'INR',
          name: name,
          description: 'Test Transaction',
          order_id: newOrderId,
          handler: function (response) {
            console.log(response);

            fetch('http://localhost:5000/submitOrder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name,
                mobile,
                tableNumber, // Include table number in order submission
                amount: formattedAmount,
                products: cartItems,
                orderId: newOrderId,
                orderDate, // Include date and time in order submission
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log('Order saved:', data);

                // Clear the cart from local storage
                localStorage.removeItem('cartItems');

                // Show success alert
                setShowAlert(true);

                // Redirect to home page after a short delay
                setTimeout(() => {
                  navigate('/');
                }, 3000);
              })
              .catch((error) => {
                console.error('Failed to save order:', error);
              });
          },
          prefill: {
            name: name,
            email: 'karatesrihari2745@gmail.com',
            contact: mobile,
          },
          theme: {
            color: '#3399cc',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        console.error('Razorpay script not loaded');
      }
    } catch (error) {
      console.error('Payment Error:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tableNumber.trim() === '') {
      alert('Please enter a table number.');
      return;
    }
    const currentDateTime = new Date().toLocaleString(); // Get the current date and time
    setOrderDate(currentDateTime); // Set the current date and time
    setIsSubmitted(true);
  };

  const handleNameChange = (e) => setName(e.target.value);
  const handleMobileChange = (e) => setMobile(e.target.value);
  const handleTableNumberChange = (e) => setTableNumber(e.target.value); // Handle table number change

  return (
    <div className="container mt-5 payment-container">
      <div className="d-flex justify-content-between mb-4 custom-icons">
        <FaArrowLeft className="icon" onClick={() => navigate('/cart')} />
        <h2 className="payment-heading">Payment Page</h2>
        <FaHome className="icon"  onClick={() => navigate('/')} />
      </div>

      {isSubmitted ? (
        <div className="order-summary-container text-center">
          <h5 className="mb-4" style={{color:"red",fontWeight:"bold",fontSize:"1.6rem",textDecoration:'underline'}}>Order Summary</h5>
          <div className="order-summary-details"  style={{alignContent:'center'}}>
            <p><strong>Date and Time         :      </strong> {orderDate}</p> {/* Display date and time */}
            <p><strong>Name                  :      </strong> {name}</p>
            <p><strong>Mobile                :      </strong> {mobile}</p>
            <p><strong>Table Number          :      </strong> {tableNumber}</p> {/* Display table number */}
            <p><strong>Total Price           :      </strong> ₹{formattedAmount}</p>
          </div>
          <h5 className="mt-4"style={{color:"red",fontWeight:"bold",fontSize:"1.6rem",textDecoration:'underline'}}>Cart Items</h5>
          <ul className="list-unstyled">
            {cartItems.map(item => (
              <li key={item._id}>{item.name} - ₹{item.price} x {item.quantity || 1}</li>
            ))}
          </ul>
          <button className="btn btn-primary mt-3" onClick={handlePayment}>Pay Now</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="text-center">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              className="form-control text-center"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="mobile" className="form-label">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              className="form-control text-center"
              value={mobile}
              onChange={handleMobileChange}
              required
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </div>
          <div className="mb-3 row justify-content-center table-number-container">
  <label htmlFor="tableNumber" className="form-label col-12 text-center">
    Table Number
  </label>
  <div className="col-12 col-sm-8 col-md-6 col-lg-4" style={{ maxWidth: '200px', minWidth: '200px' }}>
    <select
      id="tableNumber"
      className="form-control text-center"
      value={tableNumber}
      onChange={handleTableNumberChange}
      required
      style={{ width: '68%', height: 'auto' , textAlign:'center', marginLeft:'25px'}}  // Keeps full width within the container
    >
      <option value="">Select a table</option>
      {[...Array(10)].map((_, index) => (
        <option key={index + 1} value={index + 1}>
          {index + 1}
        </option>
      ))}
    </select>
  </div>
</div>

          <h4 className="text-center custom-total-price">Payable Amount: ₹{formattedAmount}</h4>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      )}
      {showAlert && (
        <div className="alert alert-success mt-4" role="alert">
          Your order will be delivered soon. Thanks for ordering!
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
