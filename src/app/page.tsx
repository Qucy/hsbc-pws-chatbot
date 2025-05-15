"use client";

import { useEffect, useState } from "react";
import DialogflowChatbot from "../components/DialogflowChatbot";
import HSBCHomePage from "../components/HSBCHomePage";
import Image from 'next/image';
import { validateUser } from "../utils/userAccounts";

export default function Home() {
  // State to handle client-side rendering
  const [isClient, setIsClient] = useState(false);
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // States for username and password inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Error message state
  const [errorMessage, setErrorMessage] = useState("");

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle login form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Use the validateUser function from userAccounts.ts
    if (validateUser(username, password)) {
      setIsLoggedIn(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="hsbc-app-container">
      {/* Only render content on the client side */}
      {isClient && (
        <>
          {!isLoggedIn ? (
            // Login form with responsive styling
            <div className="login-container" style={{
              width: "90%",  // Use percentage instead of viewport width
              maxWidth: "450px", // Maximum width for larger screens
              minHeight: "320px", // Minimum height to ensure content fits
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              borderRadius: "5px",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              margin: "0 auto" // Center horizontally
            }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                  <Image 
                    src="/hongkong-hsbc-logo-en.svg" 
                    alt="HSBC Logo" 
                    width={210} 
                    height={70}
                    style={{ maxWidth: "100%", height: "auto" }} // Make image responsive
                    priority
                  />
                </div>
                <h2 style={{ 
                  color: "gray", 
                  marginBottom: "5px",
                  fontSize: "calc(1rem + 0.5vw)" // Responsive font size
                }}>
                  Welcome to HSBC PWS Chatbot PoC
                </h2>
                <p style={{ 
                  color: "gray", 
                  marginBottom: "10px",
                  fontSize: "calc(0.8rem + 0.2vw)" // Responsive font size
                }}>
                  Please login to access the application.
                </p>
              </div>
              
              <form onSubmit={handleLogin}>
                {errorMessage && (
                  <div style={{ 
                    color: "#000000", 
                    backgroundColor: "#ffeeee", 
                    padding: "10px", 
                    borderRadius: "4px", 
                    marginBottom: "15px",
                    fontSize: "14px", // Smaller font size for error
                    wordBreak: "break-word" // Prevent text overflow
                  }}>
                    {errorMessage}
                  </div>
                )}
                
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="username" style={{ 
                    display: "block", 
                    marginBottom: "5px", 
                    fontWeight: "bold", 
                    color: "#000000",
                    fontSize: "16px" // Consistent font size
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      color: "#000000",
                      boxSizing: "border-box" // Include padding in width calculation
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="password" style={{ 
                    display: "block", 
                    marginBottom: "5px", 
                    fontWeight: "bold", 
                    color: "#000000",
                    fontSize: "16px" // Consistent font size
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      color: "#000000",
                      boxSizing: "border-box" // Include padding in width calculation
                    }}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#000000",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold" // Make button text more visible
                  }}
                >
                  Login
                </button>
              </form>
            </div>
          ) : (
            // Show content only after successful login
            <>
              {/* HSBC Home page */}
              <HSBCHomePage />
              
              {/* HSBC Chatbot - Google Agent Builder */}
              <DialogflowChatbot />
            </>
          )}
        </>
      )}
    </div>
  );
}
