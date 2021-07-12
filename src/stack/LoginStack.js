import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screen/login/LoginScreen';
import PhoneLoginScreen from '../screen/login/PhoneLoginScreen';

const Stack = createStackNavigator();

const LoginStack = () => {
    return(
          <Stack.Navigator>
              <Stack.Screen name='LoginScreen' component={LoginScreen} options={{headerShown: false}}/>
              <Stack.Screen name='PhoneLoginScreen' component={PhoneLoginScreen} options={{title : 'Log-In'}}/>
          </Stack.Navigator>
      )
}

export default LoginStack