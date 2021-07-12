import React from 'react';
import {Text, View} from 'react-native';
import { AuthProvider } from './src/provider/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
        <View>
          <Text>App</Text>
        </View>
    </AuthProvider>
  );
};

export default App;
