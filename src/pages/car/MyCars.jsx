import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Provider/AuthProvider';
import axios from 'axios';
import { CiEdit } from "react-icons/ci";
import { FaTrashRestore, FaEye } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const MyCars = () => {
  const [selfCars, setSelfCars] = useState([]);
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  // Fetch user's cars
  // useEffect(() => {
  //   axiosSecure.get(`/myCars?userEmail=${user.email}`)
  //     .then(res => {
  //       setSelfCars(res.data);
  //     })
  //     .catch(error => console.log(error));
  // }, [user.email, axiosSecure]);
  useEffect(() => {
    if (user?.email) {
      axiosSecure.get('/myCars',{ withCredentials: true})
        .then(res => {
          setSelfCars(res.data);
        })
        .catch(error => {
          console.error('Failed to fetch user cars:', error.response?.data || error.message);
        });
    }
  }, [user?.email, axiosSecure]);
  
  // Handle car deletion
  const handleDelete = (_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/cars/${_id}`)
          .then(res => {
            if (res.data.deletedCount > 0) {
              setSelfCars(selfCars.filter(car => car._id !== _id));
              Swal.fire({
                title: "Deleted!",
                text: "Your car has been deleted.",
                icon: "success"
              });
            }
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "Car not found or already deleted.",
              icon: "error"
            });
          });
      }
    });
  };

  // Sort by price
  const handleSortByPrice = () => {
    const sortedCars = [...selfCars].sort((a, b) => a.price - b.price);
    setSelfCars(sortedCars);
  };

  // Sort by date added
  const handleSortByDate = () => {
    const sortedCars = [...selfCars].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    setSelfCars(sortedCars);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-4 text-center flex flex-col lg:flex-row">
        <div className="max-w-7xl mx-auto w-full">
          {/* Title and Sort Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900">My Cars</h1>
            {selfCars.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <button className="btn btn-primary w-full md:w-auto" onClick={handleSortByPrice}>Sort by Price</button>
                <button className="btn btn-warning w-full md:w-auto" onClick={handleSortByDate}>Sort by Date</button>
              </div>
            )}
          </div>

          {/* No Cars Found Message */}
          {selfCars.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">You haven't added any cars yet!</h2>
              <Link to="/addCar">
                <button className="btn btn-success text-white px-4 py-2 rounded-md w-full sm:w-auto">
                  Add Your First Car
                </button>
              </Link>
            </div>
          ) : (
            // Cars Table
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <tr>
                    <th className="py-3 px-4 text-center">Car Image</th>
                    <th className="py-3 px-4 text-center">Car Model</th>
                    <th className="py-3 px-4 text-center">Daily Rental Price</th>
                    <th className="py-3 px-4 text-center">Booking Count</th>
                    <th className="py-3 px-4 text-center">Availability</th>
                    <th className="py-3 px-4 text-center">Date Added</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {selfCars.map((car) => (
                    <tr key={car._id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-4 text-center">
                        <img src={car.imageUrl} alt={car.model} className="w-16 h-16 object-cover rounded-md mx-auto" />
                      </td>
                      <td className="py-3 px-4 text-center">{car.model}</td>
                      <td className="py-3 px-4 text-center">${car.price}</td>
                      <td className="py-3 px-4 text-center">{car.bookingCount}</td>
                      <td className="py-3 px-4 text-center">{car.availability}</td>
                      <td className="py-3 px-4 text-center">{new Date(car.dateAdded).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center flex flex-wrap gap-2 justify-center">
                        <Link to={`/viewDetails/${car._id}`}>
                          <button className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">
                            <FaEye />
                          </button>
                        </Link>
                        <Link to={`/updateCarInfo/${car._id}`}>
                          <button className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700">
                            <CiEdit />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(car._id)} className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700">
                          <FaTrashRestore />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyCars;
