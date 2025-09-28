import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null); // start with null instead of {}
  const {increaseQty} = useContext(StoreContext);
  const navigate = useNavigate();
  const fetchFoodDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/foods/${id}`);
      if (response.status === 200) {
        return response.data; // return the fetched data
      }
      return null;
    } catch (error) {
      toast.error('Error fetching the food details.');
      return null;
    }
  };

  useEffect(() => {
    const loadFoodDetails = async () => {
      const foodData = await fetchFoodDetails(id);
      if (foodData) {
        setData(foodData);
      }
    };
    loadFoodDetails();
  }, [id]);

  // Show loading state until data is fetched
  if (!data) {
    return (
      <section className="py-5 text-center">
        <h3>Loading food details...</h3>
      </section>
    );
  }

  const addToCart = () => {
    increaseQty(data.id);
    navigate("/cart");
  }

  return (
    <section className="py-5">
      <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">
          <div className="col-md-6">
            <img
              className="card-img-top mb-5 mb-md-0"
              src={data?.imageURL}
              alt={data?.name || "Food"}
            />
          </div>
          <div className="col-md-6">
            <div className="small mb-1">
              Category:{" "}
              <span className="badge text-bg-warning">{data?.category}</span>
            </div>
            <h1 className="display-5 fw-bolder">{data?.name}</h1>
            <div className="fs-5 mb-5">
              <span>&#8377;{data?.price}.00</span>
            </div>
            <p className="lead">{data?.description}</p>
            <div className="d-flex">
              <button className="btn btn-outline-dark flex-shrink-0" type="button" onClick={addToCart}>
                <i className="bi-cart-fill me-1"></i>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
