import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RAZORPAY_KEY } from '../../util/constants';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const {foodList, quantities, setQuantities, token} = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    state: '',
    city: '',
    zip: ''
  });

  const onChangeHandler = (event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({...data, [name]: value}));
  }

  const onSubmitHandler = async (event) =>{
    event.preventDefault(); //prevent reloading of the entire webpage
    const orderData = {
      userAddress: `${data.firstName} ${data.lastName} ${data.address} ${data.city}, ${data.state}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map(item => ({
        foodId: item.foodId,
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name
      })),
      amount: total.toFixed(2),
      orderStatus: "Preparing"
    };
    try{
      const response = await axios.post('http://localhost:8080/api/orders/create', orderData, {headers: {'Authorization' : `Bearer ${token}`}});
      if(response.status === 201 && response.data.razorpayOrderId){
        //now we will initiate the payment
        initiateRazorpayPayment(response.data);
      }else{
        toast.error("Unable to place the order. Please try again.")
      }
    }catch(error){
      toast.error("Unable to place the order. Please try again.")
    }
  };

  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Food Land",
      description: "Food order payment",
      order_id: order.razorpayOrderId,
      handler: async function(razorpayResponse){
        await verifyPayment(razorpayResponse);
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phoneNumber
      },
      theme: {color: "#3399cc"},
      modal: {
        ondismiss: async function(){
          toast.error("Payment cancelled");
          await deleteOrder(order.id);
        }
      }
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    };

    try{
      const response = await axios.post('http://localhost:8080/api/orders/verify', paymentData, {headers: {'Authorization': `Bearer ${token}`}});
      if(response.status === 200){
        toast.success('Payment Successful.');
        await clearCart();
        navigate('/myorders');
      } else {
        toast.error('Payment failed. Please try again');
        navigate('/');
      }
    } catch (error){
        toast.error('Payment failed. Please try again')
    };
}

const deleteOrder = async (orderId) => {
  try{
    await axios.delete("http://localhost:8080/api/orders/" + orderId, {headers: {'Authorization' : `Bearer ${token}`}});
  } catch (error) {
      toast.error('Unable to remove the order');
  }
}

const clearCart = async () => {
  try{
    await axios.delete("http://localhost:8080/api/cart", {headers: {Authorization : `Bearer ${token}`}});
    setQuantities({});
  } catch(error){
      toast.error("Error while clearing the cart.");
  }
};

   const cartItems = foodList.filter(food => quantities[food.id] > 0);

    const subtotal = cartItems.reduce((acc, food) => acc + food.price * quantities[food.id], 0);
    const shipping = subtotal === 0?0.0: 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

  return (
   <div className="placeorder-container">

    
      
      {/* Billing Form */}
      <div className="form-section">
        <h2>Billing address</h2>
        <form onSubmit={onSubmitHandler}>
          {/* First and Last name */}
          <div className="form-row">
            <input type="text" placeholder="First name" name="firstName" onChange={onChangeHandler} value={data.firstName} />
            <input type="text" placeholder="Last name" name="lastName" onChange={onChangeHandler} value={data.lastName}/>
          </div>

          <div className="col-12 " style={{ marginBottom: "16px" }}>
            
            <div className="input-group has-validation">
                <span className="input-group-text">@</span>
                <input 
                    type="text"
                    className="form-control"
                    id="email"
                    placeholder="Email"
                    required
                    name="email" onChange={onChangeHandler} value={data.email}
                />
            </div>
          </div>

          <div className="form-row single" style={{ marginBottom: "16px" }}>
            <input
              type="tel"
              placeholder="Phone Number"
              pattern="[0-9]{10}"
              required
              name="phoneNumber" onChange={onChangeHandler} value={data.phoneNumber}
            />
          </div>

          
          {/* Address */}
          <div className="form-row single">
            <input type="text" placeholder="Address i.e 1234 Main Street" name="address" onChange={onChangeHandler} value={data.address} />
          </div>

          {/*<div className="form-row single"> //this is for landmark, not so required.
            <input type="text" placeholder="Landmark or any nearby famous place" />
          </div>*/}

          {/* Country / State / Zip */}
          
          <div className="form-row" >
            <select name="state" onChange={onChangeHandler} value={data.state}>
              
              <option value="">Choose State...</option>
              <option>Karnataka</option>
            </select>
            <select name="city" onChange={onChangeHandler} value={data.city}>
              
              <option value="">Choose City...</option>
              <option>Bengaluru</option>
              <option>Mangaluru</option>
              <option>Udupi</option>
              <option>Bidar</option>
              <option>Raichur</option>
              <option>Chikkamagaluru</option>
              <option>Hosapete</option>
              <option>Mysuru</option>
              <option>Kolar</option>

            </select>
            <input type="text" placeholder="Zip" name="zip" onChange={onChangeHandler} value={data.zip} />
          </div>
        </form>
        <div>
            <button type="button" className="checkout-btn" disabled={cartItems.length === 0} onClick={onSubmitHandler}>
            Continue to checkout
          </button>
        </div>
      </div>

      {/* Cart Section */}
      <div className="cart-section">
        <h3>
          Your cart <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
        </h3>
        <ul>
          {cartItems.map((item) => (
            <li>
            <div>
              <p>{item.name}</p>
              <small>Qty: {quantities[item.id]}</small>
            </div>
            <span>&#8377;{item.price * quantities[item.id]}</span>
          </li>
           ))}
          <li>
            <div>
              <p>Shipping</p>
              
            </div>
            <span>&#8377;{subtotal === 0 ? 0.0 : shipping.toFixed(2)}</span>
          </li>
          <li>
            <div>
              <p>Tax (10%)</p>
              
            </div>
            <span>&#8377;{tax.toFixed(2)}</span>
          </li>
          
          <li className="total">
            <strong>Total (INR)</strong>
            <strong>&#8377;{total.toFixed(2)}</strong>
          </li>
        </ul>
        
      </div>

    </div>
  )
}

export default PlaceOrder;