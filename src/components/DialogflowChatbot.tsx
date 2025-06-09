"use client";

import React, { useEffect, useRef } from 'react';

// This component integrates the Google Agent Builder (Dialogflow) chatbot
const DialogflowChatbot: React.FC = () => {
  // Add a ref to track initialization
  const isInitialized = useRef(false);
  
  useEffect(() => {
    console.log("DialogflowChatbot component mounted");
    
    // Add stylesheet if it doesn't exist
    if (!document.querySelector('link[href*="df-messenger-default.css"]')) {
      console.log("Adding Dialogflow CSS");
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css';
      document.head.appendChild(link);
    }

    // Add script if it doesn't exist
    if (!document.querySelector('script[src*="df-messenger.js"]')) {
      console.log("Adding Dialogflow script");
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Add style if it doesn't exist
    if (!document.querySelector('style#dialogflow-style')) {
      console.log("Adding Dialogflow custom styles");
      const style = document.createElement('style');
      style.id = 'dialogflow-style';
      style.textContent = `
        df-messenger {
          z-index: 999;
          position: fixed;
          --df-messenger-font-color: #000;
          --df-messenger-font-family: Google Sans;
          --df-messenger-chat-background: #f3f6fc;
          --df-messenger-message-user-background: #d3e3fd;
          --df-messenger-message-bot-background: #fff;
          bottom: 25px;
          right: 25px;
        }
        
        /* Responsive chat window sizing */
        @media (max-width: 480px) {
          df-messenger {
            --df-messenger-chat-window-height: 75vh;
            --df-messenger-chat-window-width: 90vw;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          df-messenger {
            --df-messenger-chat-window-height: 65vh;
            --df-messenger-chat-window-width: 85vw;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          df-messenger {
            --df-messenger-chat-window-height: 60vh;
            --df-messenger-chat-window-width: 450px;
          }
        }
        
        @media (min-width: 1025px) {
          df-messenger {
            --df-messenger-chat-window-height: 550px;
            --df-messenger-chat-window-width: 500px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Function to add Dialogflow elements
    const addDialogflowElements = () => {
      if (!document.querySelector('df-messenger') && !isInitialized.current) {
        console.log("Adding Dialogflow messenger elements");
        isInitialized.current = true;
        
        try {
          const dfMessenger = document.createElement('df-messenger');
          dfMessenger.setAttribute('project-id', process.env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID || '');
          dfMessenger.setAttribute('agent-id', process.env.NEXT_PUBLIC_DIALOGFLOW_AGENT_ID || '');
          dfMessenger.setAttribute('language-code', process.env.NEXT_PUBLIC_DIALOGFLOW_LANGUAGE_CODE || 'en');
          dfMessenger.setAttribute('max-query-length', '-1');
          dfMessenger.setAttribute('allow-feedback', 'all');
          dfMessenger.setAttribute('location', process.env.NEXT_PUBLIC_DIALOGFLOW_LOCATION || 'us');
          dfMessenger.setAttribute('storage-option', 'none');
          // Add an ID to make it easier to find and remove
          dfMessenger.id = 'hsbc-dialogflow-messenger';

          const dfChatBubble = document.createElement('df-messenger-chat-bubble');
          dfChatBubble.setAttribute('chat-icon', './genai-chat-icon.svg');
          dfChatBubble.setAttribute('chat-title', 'Your AI Assistant');
          dfChatBubble.setAttribute('chat-subtitle', '*AI-generated message, verify important details independently*');
          dfChatBubble.setAttribute('chat-title-icon', './star.png');

          dfMessenger.appendChild(dfChatBubble);
          
          // Append to the app container instead of body
          const appContainer = document.querySelector('.hsbc-app-container');
          if (appContainer) {
            console.log("Appending to app container");
            appContainer.appendChild(dfMessenger);
          } else {
            console.log("App container not found, appending to body");
            document.body.appendChild(dfMessenger);
          }
          
          console.log("Dialogflow elements added successfully");
        } catch (error) {
          console.error("Error adding Dialogflow elements:", error);
        }
      }
    };

    // Check if the script is already loaded
    if (window.customElements && window.customElements.get('df-messenger')) {
      console.log("Dialogflow script already loaded");
      addDialogflowElements();
    } else {
      // Wait for the script to load
      console.log("Waiting for Dialogflow script to load");
      const scriptElement = document.querySelector('script[src*="df-messenger.js"]');
      if (scriptElement) {
        scriptElement.addEventListener('load', () => {
          console.log("Dialogflow script loaded");
          // Add a small delay to ensure custom elements are registered
          setTimeout(addDialogflowElements, 500);
        });
      }
    }

    // Cleanup function
    return () => {
      console.log("DialogflowChatbot component unmounting");
      
      // Remove the event listener
      const scriptElement = document.querySelector('script[src*="df-messenger.js"]');
      if (scriptElement) {
        scriptElement.removeEventListener('load', addDialogflowElements);
      }
      
      // Remove the Dialogflow messenger element
      const dfMessenger = document.getElementById('hsbc-dialogflow-messenger');
      if (dfMessenger) {
        console.log("Removing Dialogflow messenger element");
        dfMessenger.remove();
      } else {
        // Try with querySelector as fallback
        const dfMessengerElement = document.querySelector('df-messenger');
        if (dfMessengerElement) {
          console.log("Removing Dialogflow messenger element (fallback)");
          dfMessengerElement.remove();
        }
      }
      
      // Reset initialization flag
      isInitialized.current = false;
    };
  }, []);

  // Return a div to ensure the component is properly mounted in the React tree
  return <div id="dialogflow-container" style={{ display: 'contents' }}></div>;
};

export default DialogflowChatbot;
