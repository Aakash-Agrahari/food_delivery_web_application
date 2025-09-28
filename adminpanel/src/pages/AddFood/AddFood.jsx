import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddFood = () => {
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name:'',
        description: '',
        price: '',
        category: 'Biryani'
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({...data, [name]:value}));
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if(!image) {
            toast.error('Please select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('food', JSON.stringify(data));
        formData.append('file', image);

        try{
            const response = await axios.post('http://localhost:8080/api/foods', formData, {headers : {"Content-Type":"multipart/form-data"}});
            if (response.status === 200){
                toast.success('Food added successfully.');
                setData({name: '', description: '', category: 'Biryani', price: ''});
                setImage(null);
            }
        } catch (error){
            console.log('Error', error);
            toast.error('Error adding food');
        }
    }

    
  return (
    <div className="container mt-2">
        <div className="row justify-content-center">
            <div className="card col-md-4">
            <div className="card-body">
                <h2 className="mb-4">Add Food</h2>
                <form onSubmit={onSubmitHandler}>
                 <div className="mb-3">
                    <label htmlFor="image" className="form-label">
                        <img src={image ? URL.createObjectURL(image) : assets.upload} alt="" width={111}></img>
                    </label>
                    <input type="file" className="form-control" id="image" hidden onChange={(e) => setImage(e.target.files[0])}/>
                </div>    

                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Food Name</label>
                    <input type="text" placeholder='Enter the food name' className="form-control" id="name" required name="name" onChange={onChangeHandler} value={data.name}/>
                </div>
                
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Food Description</label>
                    <textarea className="form-control" placeholder='Write the food description here......' id="description" rows="5" required name="description" onChange={onChangeHandler} value={data.description} style={{resize:'none'}}></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Food Category</label>
                    <select name="category" id="category" className="form-control" onChange={onChangeHandler} value={data.category}>
                        <option value="Biryani">Biryani</option>
                        <option value="Burger">Burger</option>
                        <option value="Cake">Cake</option>
                        <option value="Ice-cream">Ice-cream</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Salad">Salad</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="price" className="form-label">Food Price</label>
                    <input type="number" placeholder='&#8377;0' className="form-control" id="price" name="price" required onChange={onChangeHandler} value={data.price}/>
                </div>
                <button type="submit" className="btn btn-primary">Save</button>
                </form>
            </div>
            </div>
        </div>
        </div>
  )
}

export default AddFood;