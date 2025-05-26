import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { getDrugRecommendation } from '../api/openrouter';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  height: 80vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: #4a90e2;
  color: white;
  border-radius: 15px 15px 0 0;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8f9fa;
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 70%;
  padding: 1rem 1.2rem;
  border-radius: 15px;
  background: ${props => props.isUser ? '#4a90e2' : '#ffffff'};
  color: ${props => props.isUser ? 'white' : '#333'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;

  p {
    margin: 0.5rem 0;
  }

  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.3rem 0;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  display: flex;
  gap: 1rem;
  background: #ffffff;
  border-radius: 0 0 15px 15px;
  border-top: 1px solid #e1e4e8;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 1px solid #e1e4e8;
  border-radius: 20px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #357abd;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background: #fff;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const TypingIndicator = styled(motion.div)`
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  background: #f0f2f5;
  border-radius: 15px;
  align-self: flex-start;
  margin: 0.5rem 0;

  span {
    width: 8px;
    height: 8px;
    background: #4a90e2;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  span:nth-of-type(1) { animation-delay: -0.32s; }
  span:nth-of-type(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const BoldText = styled.span`
  font-weight: bold;
  color: #1a365d;
`;

const Heading = styled.h3`
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const TypingText = styled.div`
  display: inline;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: currentColor;
  margin-left: 2px;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 1rem;
  background: #ffffff;
  border-top: 1px solid #e1e4e8;
  border-radius: 0 0 15px 15px;
  color: #666;
  font-size: 0.9rem;
`;

const CopyrightText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Heart = styled.span`
  color: #e25555;
  animation: heartbeat 1.5s ease-in-out infinite;

  @keyframes heartbeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
  }
`;

const formatMessage = (text: string, isTyping: boolean = false) => {
  // First split by headings
  const parts = text.split(/(###.*?\n)/g);
  
  return parts.map((part, index) => {
    // If it's a heading (starts with ###)
    if (part.startsWith('###')) {
      const headingText = part.slice(3).trim();
      // Process bold text within heading
      const headingParts = headingText.split(/(\*\*.*?\*\*)/g);
      return (
        <Heading key={`heading-${index}`}>
          {headingParts.map((headingPart, headingIndex) => {
            if (headingPart.startsWith('**') && headingPart.endsWith('**')) {
              return <BoldText key={`heading-bold-${headingIndex}`}>{headingPart.slice(2, -2)}</BoldText>;
            }
            return headingPart;
          })}
        </Heading>
      );
    }
    
    // Process bold text within non-heading parts
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return <BoldText key={`bold-${index}-${boldIndex}`}>{boldPart.slice(2, -2)}</BoldText>;
      }
      return boldPart;
    });
  });
};

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I am your drug recommendation assistant. Please describe your symptoms.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, typingMessage]);

  const typeMessage = (text: string) => {
    let index = 0;
    setIsTyping(true);
    setTypingMessage('');

    const typeNextChar = () => {
      if (index < text.length) {
        setTypingMessage(prev => prev + text[index]);
        index++;
        setTimeout(typeNextChar, 30); // Adjust typing speed here (lower = faster)
      } else {
        setIsTyping(false);
        setTypingMessage('');
        setMessages(prev => [...prev, { id: prev.length + 1, text, sender: 'bot' }]);
      }
    };

    typeNextChar();
  };

  const handleSend = async () => {
    if (input.trim() === '' || loading) return;
    setError(null);

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = [
        ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: input }
      ];
      const botReply = await getDrugRecommendation(chatHistory);
      setLoading(false);
      typeMessage(botReply);
    } catch (err) {
      console.error('Error in handleSend:', err);
      setError(err instanceof Error ? err.message : 'Sorry, there was a problem getting a response.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>Drug Recommendation Assistant</ChatHeader>
      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              isUser={message.sender === 'user'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {formatMessage(message.text)}
            </MessageBubble>
          ))}
          {isTyping && (
            <MessageBubble
              isUser={false}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TypingText>
                {formatMessage(typingMessage)}
                <Cursor />
              </TypingText>
            </MessageBubble>
          )}
          {loading && !isTyping && (
            <TypingIndicator
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <span></span>
              <span></span>
              <span></span>
            </TypingIndicator>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your symptoms..."
          disabled={loading || isTyping}
        />
        <SendButton onClick={handleSend} disabled={loading || isTyping}>
          Send
        </SendButton>
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Footer>
        <CopyrightText>
          Made with <Heart>♥</Heart> by Suhaib Mansour
          <br />
          © {new Date().getFullYear()} All rights reserved
        </CopyrightText>
      </Footer>
    </ChatContainer>
  );
};

export default ChatBot; 