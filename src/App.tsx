import React from 'react';
import styled from '@emotion/styled';
import ChatBot from './components/ChatBot';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <ChatBot />
    </AppContainer>
  );
};

export default App;
