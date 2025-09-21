import React,{useEffect,useState} from 'react';

import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  },[]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('avatarSeed');
    setIsLoggedIn(false);
  }

  return (
    <div className="w-screen">
      <nav className="bg-gray-800 w-full px-4 py-4 mb-4">
        <div className="flex justify-between items-center w-full px-4">
          <h1 
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition"
          >
            StackIt
          </h1>
          <div className="flex gap-2 items-center">
        {isLoggedIn ? (
      <>
      <button
      onClick={handleLogout}
      className=" bg-red-500 border border-none px-4 py-1 rounded-full hover:bg-gray-700 transition"
     >
      Logout
      </button>
      <button
      onClick={() => navigate("/notifications")}
      className="border border-white px-4 py-1 rounded-full hover:bg-gray-700 transition"
     >
      <FontAwesomeIcon icon={faBell} className="text-white text-xl cursor-pointer" />
      </button>
      </>
    ) : (
  <>
    <button
      onClick={() => navigate("/login")}
      className="border border-white px-4 py-1 rounded-full hover:bg-gray-700 transition"
    >
      Login
    </button>
    <button
      onClick={() => navigate("/signup")}
      className="border border-white px-4 py-1 rounded-full hover:bg-gray-700 transition"
    >
      SignUp
    </button>
  </>
)}

  </div>
  </div>
  </nav>
  </div>
  );

};

export default Navbar;