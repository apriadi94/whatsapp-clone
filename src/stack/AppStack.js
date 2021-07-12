import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from '../provider/ChatProvider';
import ChatScreen from '../screen/chat/ChatScreen';
import ChatContactScreen from '../screen/chat/ChatContactScreen';
import ChatContentScreen from '../screen/chat/ChatContentScreen';
import ViewImageScreen from '../screen/chat/ViewImageScreen';
import { AuthContext } from '../provider/AuthProvider';
import VideoCallScreen from '../screen/video-call/VideoCallScreen';

const Stack = createStackNavigator();

const ChatStack = ({navigation}) => {
  const { user, loadingAuth } = useContext(AuthContext)

  const optionsStyle = {
      headerStyle: {
          backgroundColor: '#075E55',
          shadowOffset: {
              width: 0,
              height: 2,
          }
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: {width: -1, height: 1},
          textShadowRadius: 10
        }
  }

    return(
          loadingAuth ? null :
          <ChatProvider navigation={navigation} user={user}>
            <Stack.Navigator>
                <Stack.Screen name='ChatScreen' component={ChatScreen} options={{ 
                     ...optionsStyle,
                    title: 'ChatsApp'
                  }}/>

                <Stack.Screen name='ChatContactScreen' component={ChatContactScreen} options={{ ...optionsStyle, title: 'List Kontak'}}/>
                <Stack.Screen name='ChatContentScreen' component={ChatContentScreen} options={{ ...optionsStyle}}/>
                <Stack.Screen name='ViewImageScreen' component={ViewImageScreen}/>
                <Stack.Screen name='VideoCallScreen' component={VideoCallScreen} options={{
                  headerShown: false
                }}/>
            </Stack.Navigator>
          </ChatProvider>
      )
}

export default ChatStack