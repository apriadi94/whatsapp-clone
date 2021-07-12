import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from '../provider/ChatProvider';
import ChatScreen from '../screen/chat/ChatScreen';
import ChatContactScreen from '../screen/chat/ChatContactScreen';
import ChatContentScreen from '../screen/chat/ChatContentScreen';
import ViewImageScreen from '../screen/chat/ViewImageScreen';
import { AuthContext } from '../provider/AuthProvider';

const Stack = createStackNavigator();

const ChatStack = ({navigation}) => {
  const { user, loadingAuth } = useContext(AuthContext)

    return(
          loadingAuth ? null :
          <ChatProvider navigation={navigation} user={user}>
            <Stack.Navigator>
                <Stack.Screen name='ChatScreen' component={ChatScreen} options={{ 
                    title: 'Chat'
                  }}/>

                <Stack.Screen name='ChatContactScreen' component={ChatContactScreen} options={{ title: 'List Kontak'}}/>
                <Stack.Screen name='ChatContentScreen' component={ChatContentScreen} />
                <Stack.Screen name='ViewImageScreen' component={ViewImageScreen}/>
            </Stack.Navigator>
          </ChatProvider>
      )
}

export default ChatStack