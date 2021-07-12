import React, { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, ImageBackground, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { ChatContext } from '../provider/ChatProvider'
import backgroundChat from '../assets/chat-background.png'

const ChatScreen = ({ navigation }) => {
    return(
        <ImageBackground source={backgroundChat} style={{flex: 1}}>
            
        </ImageBackground>
    )
}

export default ChatScreen