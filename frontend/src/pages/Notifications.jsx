import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/"); 
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition"
          >
            StackIt
          </h1>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-500 border-none px-4 py-1 rounded-full hover:bg-red-600 transition text-sm sm:text-base"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
          Notifications coming soon...
        </p>
      </main>
    </div>
  );
};

export default Notifications;
