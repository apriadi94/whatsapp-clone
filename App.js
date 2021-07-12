import React from 'react';
import { AuthProvider } from './src/provider/AuthProvider';
import MainStack from './src/stack/MainStack';

const App = () => {
  return (
    <AuthProvider>
      <MainStack/>
    </AuthProvider>
  );
};

export default App;
