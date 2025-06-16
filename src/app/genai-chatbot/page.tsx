'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Send, User, Bot, ThumbsUp, ThumbsDown, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  messageType?: 'thinking' | 'final'; // thinking messages from chat API, final messages from summarization API
}

interface ContentData {
  content?: Array<{
    source_url: string;
    content: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export default function GenAIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your HSBC AI Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      messageType: 'final'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasReceivedFirstResponse, setHasReceivedFirstResponse] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [collapsedThinkingMessages, setCollapsedThinkingMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Clears the chat history and resets to initial state
   */
  const clearChatHistory = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your HSBC AI Assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
        messageType: 'final'
      }
    ]);
    setHasReceivedFirstResponse(false);
    setIsStreaming(false);
    setCollapsedThinkingMessages(new Set());
  };

  /**
   * Toggles the collapsed state of a thinking message
   */
  const toggleThinkingMessage = (messageId: string) => {
    setCollapsedThinkingMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  /**
   * Formats thinking message JSON content into user-friendly plain text
   * @param jsonText - The JSON text containing rationale and relevant_paths
   * @returns Formatted plain text string
   */
  const formatThinkingMessage = (jsonText: string): string => {
    try {
      // Check if this is a progress update (contains step indicators)
      if (jsonText.includes('✓') || jsonText.includes('Step 1:') || jsonText.includes('Step 2:') || jsonText.includes('Step 3:')) {
        return jsonText; // Return as-is for progress updates
      }
      
      // Try to extract JSON from the text - improved regex to handle nested structures
      const jsonMatch = jsonText.match(/\{[\s\S]*?"rationale"[\s\S]*?\}/);
      if (!jsonMatch) {
        return jsonText; // Return original text if no JSON found
      }
      
      // Find the complete JSON object by counting braces
       let jsonStr = '';
       let braceCount = 0;
       const startIndex = jsonText.indexOf('{');
      
      if (startIndex === -1) {
        return jsonText; // No opening brace found
      }
      
      for (let i = startIndex; i < jsonText.length; i++) {
        const char = jsonText[i];
        jsonStr += char;
        
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            break; // Found complete JSON object
          }
        }
      }
      
      if (braceCount !== 0) {
        return jsonText; // Incomplete JSON object
      }
      
      const jsonData = JSON.parse(jsonStr);
      
      let formattedText = '';
      
      // Add step 1 header
      formattedText += 'Step 1: Analyze your question\n';
      
      // Add rationale if available
      if (jsonData.rationale) {
        formattedText += jsonData.rationale;
      }
      
      // Add relevant paths if available
      if (jsonData.relevant_paths && Array.isArray(jsonData.relevant_paths) && jsonData.relevant_paths.length > 0) {
        formattedText += '\n\nI need to search the following links: ';
        formattedText += jsonData.relevant_paths.join(', ');
      }
      
      return formattedText || jsonText; // Return original if formatting fails
    } catch (error) {
      console.error('Error formatting thinking message:', error);
      return jsonText; // Return original text if parsing fails
    }
  };

  /**
   * Creates a new thinking step message
   * @param stepNumber - Step number (1, 2, or 3)
   * @param stepTitle - Title of the step
   * @param stepContent - Content of the step
   */
  const createThinkingStepMessage = (stepNumber: number, stepTitle: string, stepContent: string) => {
    const stepMessageId = `${Date.now()}-step-${stepNumber}`;
    const stepMessage: Message = {
      id: stepMessageId,
      text: `Step ${stepNumber}: ${stepTitle}\n${stepContent}`,
      isUser: false,
      timestamp: new Date(),
      messageType: 'thinking'
    };
    
    setMessages(prev => [...prev, stepMessage]);
    return stepMessageId;
  };

  /**
   * Updates the thinking message with progress information
   * @param aiMessageId - ID of the thinking message to update
   * @param progressText - Text to append to the thinking message
   */
  const updateThinkingProgress = (aiMessageId: string, progressText: string) => {
    // Check if this is a step 2 or step 3 update
    if (progressText.includes('Step 2: Retrieving content from the identified sources')) {
      const stepContent = progressText.replace(/\n*Step 2: Retrieving content from the identified sources\n/, '').trim();
      createThinkingStepMessage(2, 'Retrieving content from the identified sources', stepContent);
    } else if (progressText.includes('Step 2: No specific content sources identified')) {
      const stepContent = progressText.replace(/\n*Step 2: No specific content sources identified\n/, '').trim();
      createThinkingStepMessage(2, 'No specific content sources identified', stepContent);
    } else if (progressText.includes('Step 3: Generating comprehensive response')) {
      const stepContent = progressText.replace(/\n*Step 3: Generating comprehensive response\n/, '').trim();
      createThinkingStepMessage(3, 'Generating comprehensive response', stepContent);
    } else {
      // For other updates, use the original behavior
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId && msg.messageType === 'thinking') {
          return { ...msg, text: msg.text + progressText };
        }
        return msg;
      }));
    }
  };

  /**
   * Scrolls the chat to the bottom to show latest messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Extracts relevant paths from the AI response text
   * @param text - The accumulated AI response text
   * @returns Array of extracted paths or empty array if none found
   */
  const extractRelevantPaths = (text: string): string[] => {
    try {
      const jsonMatch = text.match(/\{[^}]*"relevant_paths"[^}]*\}/);
      if (!jsonMatch) return [];
      
      const jsonData = JSON.parse(jsonMatch[0]);
      if (!jsonData.relevant_paths || !Array.isArray(jsonData.relevant_paths)) {
        return [];
      }
      
      return jsonData.relevant_paths
        .map((path: string) => path.trim().replace(/^\s*`|`\s*$/g, ''))
        .filter((path: string) => path.length > 0);
    } catch (error) {
      console.error('Error extracting relevant paths:', error);
      return [];
    }
  };

  /**
   * Fetches content from database using extracted paths
   * @param paths - Array of source URLs/paths to fetch content for
   * @returns Promise resolving to content data or null if failed
   */
  const fetchContentFromDatabase = async (paths: string[]) => {
    try {
      console.log('Extracted relevant paths:', paths);
      
      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_urls: paths }),
      });
      
      if (!contentResponse.ok) {
        console.error('Failed to retrieve content:', await contentResponse.text());
        return null;
      }
      
      const contentData = await contentResponse.json();
      console.log('Retrieved content data:', contentData);
      return contentData;
    } catch (error) {
      console.error('Error fetching content from database:', error);
      return null;
    }
  };

  /**
   * Calls the summarization API with conversation history and retrieved content
   * @param conversationHistory - Array of previous messages
   * @param userMessage - Current user message
   * @param contentData - Retrieved content from database
   */
  const callSummarizationAPI = async (
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
    userMessage: Message,
    contentData: ContentData
  ) => {
    try {
      // Prepare conversation history for summarization API
      const summaryConversationHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: userMessage.text }
      ];
      
      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: summaryConversationHistory,
          userQuery: userMessage.text,
          rawContent: contentData.content || []
        }),
      });
      
      if (!summarizeResponse.ok || !summarizeResponse.body) {
        console.error('Failed to get summarization:', await summarizeResponse.text());
        return;
      }
      
      // Handle streaming response from summarization API
      await handleSummarizationStream(summarizeResponse.body);
      
    } catch (error) {
      console.error('Error calling summarization API:', error);
    }
  };

  /**
   * Handles the streaming response from the summarization API
   * @param responseBody - ReadableStream from the summarization API
   */
  const handleSummarizationStream = async (responseBody: ReadableStream) => {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let summarizedText = '';
    
    // Create a new final message for summarization API response
    const finalMessageId = (Date.now() + 2).toString();
    const finalMessage: Message = {
      id: finalMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      messageType: 'final'
    };
    
    // Add the new final message after the thinking message
    setMessages(prev => [...prev, finalMessage]);
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const data = line.slice(6).trim();
          
          // Check for completion signal
          if (data === '[DONE]') {
            console.log('Summarization completed');
            setIsStreaming(false);
            setIsLoading(false);
            return;
          }
          
          // Parse and update message with new content
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              summarizedText += parsed.content;
              
              // Update the final message with summarized content
              setMessages(prev => prev.map(msg => 
                msg.id === finalMessageId ? { ...msg, text: summarizedText } : msg
              ));
            }
          } catch (parseError) {
            console.error('Error parsing summarization data:', parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * Handles the streaming response from the initial chat API
   * @param responseBody - ReadableStream from the chat API
   * @param aiMessageId - ID of the AI message to update
   * @param conversationHistory - Conversation history for potential follow-up calls
   * @param userMessage - Current user message
   */
  const handleChatStream = async (
    responseBody: ReadableStream,
    aiMessageId: string,
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
    userMessage: Message
  ) => {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const data = line.slice(6);
          
          // Check for completion and process relevant paths
          if (data === '[DONE]') {
            setIsLoading(false);
            setIsStreaming(false);
            
            // Mark step 1 as completed
            // Step 1 completed - no need for completion message
            
            // Extract and process relevant paths for additional content
            const paths = extractRelevantPaths(accumulatedText);
            if (paths.length > 0) {
              await processRelevantPaths(paths, conversationHistory, userMessage, aiMessageId);
            } else {
              // No relevant paths found, proceed directly to summarization with original question
              updateThinkingProgress(aiMessageId, '\n\nStep 1: No specific content sources identified\n' + 
                'Proceeding with general knowledge response...');
              
              updateThinkingProgress(aiMessageId, '\n\nStep 2: Generating comprehensive response\n' + 
                'Processing your question and preparing final answer...');
              
              // Call summarization API with empty content but original question
              await callSummarizationAPI(conversationHistory, userMessage, { content: [] });
            }
            return;
          }
          
          // Parse and accumulate streaming content
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedText += parsed.content;
              
              // Mark streaming as started
              if (!isStreaming) {
                setIsStreaming(true);
              }
              
              // Update the AI message with accumulated text
              setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
              ));
              
              // Mark first response received
              if (!hasReceivedFirstResponse) {
                setHasReceivedFirstResponse(true);
              }
            }
          } catch {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * Processes relevant paths by fetching content and calling summarization
   * This is the orchestrator for the 2nd and 3rd API calls
   * @param paths - Array of relevant paths extracted from initial response
   * @param conversationHistory - Conversation history
   * @param userMessage - Current user message
   * @param aiMessageId - ID of the thinking message to update with progress
   */
  const processRelevantPaths = async (
    paths: string[],
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
    userMessage: Message,
    aiMessageId: string
  ) => {
    // Step 2: Fetch content from database using extracted paths
    updateThinkingProgress(aiMessageId, '\n\nStep 2: Retrieving content from the identified sources\n' + 
      'Searching: ' + paths.join(', '));
    
    const contentData = await fetchContentFromDatabase(paths);
    
    if (!contentData) {
      console.error('Failed to retrieve content data');
      updateThinkingProgress(aiMessageId, '\n\n❌ Step 2 failed - Could not retrieve content');
      return;
    }
    
    // Step 2 completed - no need for completion message
    
    // Step 3: Call summarization API with retrieved content
    updateThinkingProgress(aiMessageId, '\n\nStep 3: Generating comprehensive response\n' + 
      ', processing retrieved content and preparing final answer...');
    
    await callSummarizationAPI(conversationHistory, userMessage, contentData);
  };

  /**
   * Main function to handle sending a message and orchestrating the 3 API calls:
   * 1. Initial chat API call
   * 2. Content retrieval API call (if relevant paths found)
   * 3. Summarization API call (with retrieved content)
   */
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Create and add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsStreaming(false);

    try {
      // Prepare conversation history for initial API call (exclude thinking messages and initial greeting)
      const conversationHistory = messages
        .filter(msg => 
          !msg.text.includes('Hello! I\'m your HSBC AI Assistant') && // Exclude initial greeting
          msg.messageType !== 'thinking' // Exclude thinking messages from API calls
        )
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));
      
      // Add current user message to history
      conversationHistory.push({
        role: 'user' as const,
        content: userMessage.text
      });

      // API Call #1: Initial chat API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: conversationHistory,
          userContext: 'HSBC banking customer inquiry'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Create initial AI message for streaming updates (thinking message from chat API)
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = {
        id: aiMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        messageType: 'thinking'
      };
      
      setMessages(prev => [...prev, initialAiMessage]);

      // Handle the streaming response and potential follow-up API calls
      if (response.body) {
        await handleChatStream(response.body, aiMessageId, conversationHistory, userMessage);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Display error message to user
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact HSBC customer service for assistance.',
        isUser: false,
        timestamp: new Date(),
        messageType: 'final'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  /**
   * Handles Enter key press for sending messages
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputText.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Adjusts textarea height based on content
   */
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-2 md:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4 flex-1">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 text-sm md:text-base">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 mr-1" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="h-4 md:h-6 w-px bg-gray-300"></div>
          <Image 
            src="/hongkong-hsbc-logo-en.svg" 
            alt="HSBC Logo" 
            width={60} 
            height={20}
            className="md:w-20 md:h-7"
            priority
          />
        </div>
        <div className="flex items-center space-x-2 md:space-x-3 text-right flex-shrink-0">
          <Image 
            src="/star.png" 
            alt="Star" 
            width={24} 
            height={24} 
            className="w-5 h-5 md:w-6 md:h-6"
          />
          <h1 className="text-sm md:text-xl font-semibold text-gray-800">Your AI Assistant</h1>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 md:py-6">
        <div className="w-full max-w-none mx-auto space-y-4" style={{maxWidth: '80%'}}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 md:space-x-3 ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.isUser ? (
                <>
                  {/* Message Bubble */}
                  <div
                    className="w-[80%] px-3 md:px-4 py-2 md:py-3 rounded-lg bg-blue-100 text-gray-800 border border-blue-200 rounded-br-sm"
                  >
                    <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-1 text-blue-600">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-blue-500 text-white ml-2 md:ml-3">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </>
              ) : (
                <>
                  {/* Avatar - Show for first thinking message (Step 1) and final messages */}
                  {((message.messageType === 'thinking' && message.text.includes('Analyze your question')) || message.messageType === 'final') && (
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-600 text-white">
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`w-[80%] ${
                    message.messageType === 'thinking' && !message.text.includes('Analyze your question') ? 'ml-11 md:ml-13' : ''
                  }`}>
                    <div className={`px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                      message.messageType === 'thinking' 
                        ? 'bg-gray-50 text-gray-500' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}>
                      {/* Collapsible header for thinking messages */}
                      {message.messageType === 'thinking' && (
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2 hover:bg-gray-100 rounded p-1 -m-1"
                          onClick={() => toggleThinkingMessage(message.id)}
                        >
                          <span className="text-base md:text-lg font-semibold text-gray-700">
            {message.text.includes('Analyze your question') ? 'Step 1: Analyzing your question' :
             message.text.includes('Step 2: Retrieving content from the identified sources') ? 'Step 2: Retrieving content from identified sources' :
             message.text.includes('Step 2: No specific content sources identified') ? 'Step 2: No specific content sources identified' :
             message.text.includes('Step 3: Generating comprehensive response') ? 'Step 3: Generating comprehensive response' :
             message.text.startsWith('Step 1:') ? 'Step 1: Analyzing your question' :
             message.text.startsWith('Step 2:') ? 'Step 2: Processing content' :
             message.text.startsWith('Step 3:') ? 'Step 3: Generating response' :
             'Step 1: Analyzing your question'}
          </span>
                          {collapsedThinkingMessages.has(message.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      )}
                      
                      {/* Message content - collapsible for thinking messages */}
                      {(!message.messageType || message.messageType !== 'thinking' || !collapsedThinkingMessages.has(message.id)) && (
                        <div className={`text-xs md:text-sm leading-relaxed prose prose-sm max-w-none ${
                          message.messageType === 'thinking' ? 'prose-gray' : 'text-sm md:text-base'
                        } prose-table:table-auto prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.messageType === 'thinking' ? formatThinkingMessage(message.text).replace(/^Step \d+:\s*/, '') : message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      <p className="text-xs mt-1 text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.messageType === 'thinking' && <span className="ml-2 italic">(thinking process)</span>}
                      </p>
                    </div>
                    {/* AI Disclaimer and Feedback - Only show for final messages (not hello or thinking messages) */}
                    {!message.text.includes('Hello! I\'m your HSBC AI Assistant') && 
                     message.messageType === 'final' && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-400 italic">*AI-generated message, verify important details independently*</p>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                            <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                            <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isLoading && !isStreaming && (
            <div className="flex items-start space-x-2 md:space-x-3 justify-start">
              {/* AI Avatar */}
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              
              {/* Typing Indicator */}
              <div className="bg-white text-gray-800 border border-gray-200 px-3 md:px-4 py-2 md:py-3 rounded-lg rounded-bl-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-2 md:px-4 py-3 md:py-4">
        <div className="w-full mx-auto" style={{maxWidth: '80%'}}>
          <div className="flex items-start space-x-2 md:space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm md:text-base text-black placeholder-gray-400"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1 px-1">This is a demo chatbot. Press Enter to send, Shift+Enter for new line.</p>
            </div>
            <div className="flex space-x-2 items-center">
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-red-600 text-white p-2 md:p-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={clearChatHistory}
                className="bg-gray-500 text-white p-2 md:p-3 rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0 cursor-pointer"
                title="Clear chat history"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
 }