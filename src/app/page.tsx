"use client";

import { useEffect, useState } from "react";
import DialogflowChatbot from "../components/DialogflowChatbot";
import HSBCHomePage from "../components/HSBCHomePage";
import Image from 'next/image';

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

  // Get credentials from environment variables
  // Note: In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
  const TEST_USERNAME = process.env.NEXT_PUBLIC_TEST_USERNAME || "qucy";
  const TEST_PASSWORD = process.env.NEXT_PUBLIC_TEST_PASSWORD || "123";

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle login form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check credentials against test account
    if (username === TEST_USERNAME && password === TEST_PASSWORD) {
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
            // Login form
            <div className="login-container" style={{
              width: "33.33vw",  // 1/3 of viewport width
              height: "33.33vh", // 1/3 of viewport height
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
              justifyContent: "center"
            }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                  <Image 
                    src="/hongkong-hsbc-logo-en.svg" 
                    alt="HSBC Logo" 
                    width={210} 
                    height={70}
                    priority
                  />
                </div>
                <h2 style={{ color: "gray", marginBottom: "5px" }}>Welcome to HSBC PWS Chatbot PoC</h2>
                <p style={{ color: "gray", marginBottom: "10px" }}>Please login to access the application.</p>
              </div>
              
              <form onSubmit={handleLogin}>
                {errorMessage && (
                  <div style={{ 
                    color: "#000000", 
                    backgroundColor: "#ffeeee", 
                    padding: "10px", 
                    borderRadius: "4px", 
                    marginBottom: "15px" 
                  }}>
                    {errorMessage}
                  </div>
                )}
                
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="username" style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000000" }}>
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
                      color: "#000000"  // Added black color for text
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000000" }}>
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
                      color: "#000000"  // Added black color for text
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
                    fontSize: "16px"
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
