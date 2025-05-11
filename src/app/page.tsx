"use client";

import { useEffect, useState } from "react";
// Removed HSBCIframe import
import DialogflowChatbot from "../components/DialogflowChatbot";
import HSBCHomePage from "../components/HSBCHomePage"; // Import HSBCHomePage

export default function Home() {
  // State to handle client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Removed hsbcUrl constant

  return (
    <div className="hsbc-app-container">
      {/* Only render the chatbot on the client side */}
      {isClient && (
        <>
          {/* HSBC Home page */}
          <HSBCHomePage />
          
          {/* HSBC Chatbot - Google Agent Builder */}
          <DialogflowChatbot />
        </>
      )}
    </div>
  );
}
