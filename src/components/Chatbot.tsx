import React, { useState } from 'react';
import ChatWidget from './ChatWidget';
import ChatWindow from './ChatWindow';

const Chatbot: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleMinimizeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {!isChatOpen && <ChatWidget onClick={handleOpenChat} />}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        onMinimize={handleMinimizeChat} 
      />
    </>
  );
};

export default Chatbot;
