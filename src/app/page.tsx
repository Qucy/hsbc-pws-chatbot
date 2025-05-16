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
  // Loading state for login process
  const [isLoading, setIsLoading] = useState(false);

  // Set isClient to true when component mounts and check for stored login state
  useEffect(() => {
    setIsClient(true);
    
    // Check if user is already logged in from localStorage
    const storedLoginState = localStorage.getItem('hsbc_user_logged_in');
    const storedUsername = localStorage.getItem('hsbc_username');
    
    if (storedLoginState === 'true' && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (isLoggedIn) {
      let logoutTimer: NodeJS.Timeout;
      
      // Function to reset the timer
      const resetTimer = () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
          handleLogout();
        }, 30 * 60 * 1000); // 30 minutes in milliseconds
      };
      
      // Set initial timer
      resetTimer();
      
      // Reset timer on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      // Add event listeners to reset timer on user activity
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      
      // Cleanup function
      return () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        events.forEach(event => {
          window.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [isLoggedIn]);

  // Handle login form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set loading state to true
    setIsLoading(true);
    
    // Simulate loading time (1 second)
    setTimeout(() => {
      // Use the validateUser function from userAccounts.ts
      if (validateUser(username, password)) {
        setIsLoggedIn(true);
        setErrorMessage("");
        
        // Store login state in localStorage
        localStorage.setItem('hsbc_user_logged_in', 'true');
        localStorage.setItem('hsbc_username', username);
      } else {
        setErrorMessage("Invalid username or password. Please try again.");
      }
      // Set loading state back to false
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Clear login state
    setIsLoggedIn(false);
    
    // Remove from localStorage
    localStorage.removeItem('hsbc_user_logged_in');
    localStorage.removeItem('hsbc_username');
    
    // Force a re-render to ensure components update
    setIsClient(false);
    setTimeout(() => setIsClient(true), 0);
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
                
                {/* Loading bar that appears during login process */}
                {isLoading && (
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{
                      width: "100%",
                      height: "4px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "2px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: "30%",
                        height: "100%",
                        backgroundColor: "#db0011", // HSBC red color
                        borderRadius: "2px",
                        animation: "loading 1s infinite linear"
                      }}></div>
                    </div>
                    <style jsx>{`
                      @keyframes loading {
                        0% {
                          transform: translateX(-100%);
                        }
                        100% {
                          transform: translateX(400%);
                        }
                      }
                    `}</style>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: isLoading ? "#666666" : "#000000",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "bold", // Make button text more visible
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          ) : (
            // Show content only after successful login
            <>
              {/* HSBC Home page */}
              <HSBCHomePage onLogout={handleLogout} />
              
              {/* HSBC Chatbot - Google Agent Builder */}
              <DialogflowChatbot />
            </>
          )}
        </>
      )}
    </div>
  );
}
