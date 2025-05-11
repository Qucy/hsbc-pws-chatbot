import React from 'react';
import Image from 'next/image';

interface ChatWidgetProps {
  onClick: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClick }) => {
  return (
    <button 
      className="hsbc-chat-widget"
      onClick={onClick}
      aria-label="Open chat assistant"
    >
      <Image 
        src="/chat-icon.svg" 
        alt="Chat" 
        width={24} 
        height={24}
        className="hsbc-chat-widget-icon"
      />
    </button>
  );
};

export default ChatWidget;
