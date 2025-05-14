"use client";

import React, { useEffect } from 'react';

// This component integrates the Google Agent Builder (Dialogflow) chatbot
const DialogflowChatbot: React.FC = () => {
  useEffect(() => {
    // Add stylesheet if it doesn't exist
    if (!document.querySelector('link[href*="df-messenger-default.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css';
      document.head.appendChild(link);
    }

    // Add script if it doesn't exist
    if (!document.querySelector('script[src*="df-messenger.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Add style if it doesn't exist
    if (!document.querySelector('style#dialogflow-style')) {
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
            --df-messenger-chat-window-height: 80vh;
            --df-messenger-chat-window-width: 90vw;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          df-messenger {
            --df-messenger-chat-window-height: 70vh;
            --df-messenger-chat-window-width: 85vw;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          df-messenger {
            --df-messenger-chat-window-height: 65vh;
            --df-messenger-chat-window-width: 450px;
          }
        }
        
        @media (min-width: 1025px) {
          df-messenger {
            --df-messenger-chat-window-height: 600px;
            --df-messenger-chat-window-width: 500px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Function to add Dialogflow elements
    const addDialogflowElements = () => {
      if (!document.querySelector('df-messenger')) {
        const dfMessenger = document.createElement('df-messenger');
        dfMessenger.setAttribute('project-id', 'hsbc-1044360-ihubasp-sandbox');
        dfMessenger.setAttribute('agent-id', '5771f2b8-e0b8-408b-a52a-328ca1534bb2');
        dfMessenger.setAttribute('language-code', 'en');
        dfMessenger.setAttribute('max-query-length', '-1');
        dfMessenger.setAttribute('allow-feedback', 'all');

        const dfChatBubble = document.createElement('df-messenger-chat-bubble');
        dfChatBubble.setAttribute('chat-icon', './genai-chat-icon.svg');
        dfChatBubble.setAttribute('chat-title', 'Chat with us');
        dfChatBubble.setAttribute('chat-title-icon', './star.png');

        dfMessenger.appendChild(dfChatBubble);
        document.body.appendChild(dfMessenger);
      }
    };

    // Check if the script is already loaded
    if (window.customElements && window.customElements.get('df-messenger')) {
      addDialogflowElements();
    } else {
      // Wait for the script to load
      const scriptElement = document.querySelector('script[src*="df-messenger.js"]');
      if (scriptElement) {
        scriptElement.addEventListener('load', addDialogflowElements);
      }
    }

    // Cleanup function
    return () => {
      const scriptElement = document.querySelector('script[src*="df-messenger.js"]');
      if (scriptElement) {
        scriptElement.removeEventListener('load', addDialogflowElements);
      }
    };
  }, []);

  return null;
};

export default DialogflowChatbot;
