import React from 'react';

interface ChatMessageProps {
  text: string;
  sender: 'user' | 'bot';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, sender }) => {
  const messageClass = sender === 'user' ? 'hsbc-message-user' : 'hsbc-message-bot';
  
  return (
    <div className={`hsbc-message ${messageClass}`}>
      {text}
    </div>
  );
};

export default ChatMessage;
