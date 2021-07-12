import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from '../provider/ChatProvider';
import ChatScreen from '../screen/ChatScreen';
import { AuthContext } from '../provider/AuthProvider';

const Stack = createStackNavigator();

const ChatStack = ({navigation}) => {
  const { user } = useContext(AuthContext)
    return(
          <ChatProvider navigation={navigation} user={user}>
            <Stack.Navigator>
                <Stack.Screen name='ChatScreen' component={ChatScreen} options={{ 
                    title: 'Chat'
                  }}/>
            </Stack.Navigator>
          </ChatProvider>
      )
}

export default ChatStack