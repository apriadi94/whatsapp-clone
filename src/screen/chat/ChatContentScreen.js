import React, { useContext, useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, Keyboard, ImageBackground, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { AuthContext } from '../../provider/AuthProvider';
import { ChatContext } from '../../provider/ChatProvider';
import SendInputComponent from './SendInputComponent';
import backgroundChat from '../../assets/chat-background.png'
import Icon from 'react-native-vector-icons/FontAwesome';
import SoundPlayer from 'react-native-sound-player'


const ChatContentScreen = ({ navigation, route }) => {
    const { baseUrl, user, getUnreadMessage } = useContext(AuthContext)
    const { socket, userOnline } = useContext(ChatContext)
    const { to, room } = route.params;
    const [roomId, setRoomid] = useState(room.id)
    const [chat, setChat] = useState([])
    const [loadingChat, setLoadingChat] = useState(true)
    const [OnPageSearch, setOnPageSearch] = useState(null)
    const [OnIndexSerach, setOnIndexSearch] = useState(0)
    const [isTyping, setIsTyping] = useState(false)

    const scrollViewRef = useRef();


    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate(roomId ? 'ChatScreen' : 'ChatContactScreen')}>
                    <View style={{ marginLeft : 25 }}>
                      <Icon name="arrow-left" color="gray" size={18} />
                    </View>
                </TouchableOpacity>
              ),
            headerTitle: () => (
                <View>
                    <Text style={{ 
                        fontWeight : 'bold', color: 'white', fontSize: 20,
                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                        textShadowRadius: 10
                    }}>{to[0].name}</Text>
                    {
                        userOnline.includes(to[0].idLogin) ?
                        <Text style={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowRadius: 10 }}>
                            {
                                isTyping? 'sedang mengetik...' : 'Online'
                            }
                        </Text> : null
                    }
                </View>
            ),
        })

        socket.emit('REQUEST_MESSAGE', ({ roomId, to }))

        socket.on('MESSAGE_SENT', (message, resRoomId, action, idUser) => {
            setChat(message)
            setRoomid(resRoomId)
            socket.emit('READ_MESSAGE', resRoomId)
            getUnreadMessage(user.idForUser)
            setLoadingChat(false)

            if(action === 'SEND' && idUser !== user.idForUser){
                try {
                    SoundPlayer.playSoundFile('chat', 'mp3')
                } catch (e) {
                    console.log(`cannot play the sound file`, e)
                }
            }
        })

        socket.on('CHECKLIST', (message) => {
            setChat(message)
        })

        socket.on('TYPING', (status) => {
            setIsTyping(status)
        })

        Keyboard.addListener("keyboardDidShow", _keyboardDidShow);

        return(() => {
            socket.removeAllListeners("MESSAGE_SENT");
            Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
        })
    }, [isTyping, roomId, userOnline])


    const _keyboardDidShow = () => scrollViewRef.current.scrollToEnd({animated: true});

    return(
           <ImageBackground source={backgroundChat} style={{flex : 1}}>
                <ScrollView
                        ref={scrollViewRef}
                        onContentSizeChange={() => {
                            scrollViewRef.current.scrollToEnd({animated: true})
                        }}
                        >
                    {
                        loadingChat ? <View  style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading...</Text></View> :
                        <View style={{flex : 1, marginTop : 10, marginHorizontal : 10, marginBottom : 10}}>
                            {
                                chat.map((list, index) =>
                                        <View key={index} style={{marginTop: chat[index - 1] ? chat[index - 1].isFromSelf !== list.isFromSelf ? 10 : 3 : 5, alignItems : list.isFromSelf ? 'flex-end' : 'flex-start'}}>
                                                <View style={{backgroundColor : list.id === OnPageSearch ? 'white' : 'rgba(76, 175, 80, 0)', borderRadius : 5}}>
                                                    <View style={{backgroundColor : list.isFromSelf ? '#DCF8C6' : 'white', borderRadius : 7, marginHorizontal : 10, marginVertical : 0}}>
                                                        <View style={{marginTop : 5, marginLeft : 10, marginRight : 10}}>
                                                            {
                                                                list.type === 'TEXT' ?
                                                                <React.Fragment>
                                                                    <Text style={{fontSize : 14}}>{list.content}</Text>
                                                                    <View style={{flexDirection: 'row'}}>
                                                                        <Text style={{fontSize : 12, color: 'gray', marginTop: 2, textAlign: 'right', marginBottom : 5}}>{list.jam}</Text>                                                  
                                                                        {
                                                                            list.isFromSelf ?
                                                                            <View style={{justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginBottom: 4}}>
                                                                                {
                                                                                    list.isRead ? <Icon name="check" color="#4db8ff" size={14} /> : null
                                                                                }
                                                                            </View> : null
                                                                        }
                                                                    </View>
                                                                </React.Fragment> :
                                                                <TouchableWithoutFeedback onPress={() => navigation.navigate('ViewImageScreen', { gambar : [{url : `${baseUrl}/${list.url}`}] })}>
                                                                    <View>
                                                                        <Image source={{ uri : `${baseUrl}/${list.url}`}} style={{ width: list.width / 5, height: list.height / 5 }} resizeMode="contain"/>
                                                                        <View style={{flexDirection: 'row'}}>
                                                                        <Text style={{fontSize : 12, color: 'gray', marginTop: 2, textAlign: 'right', marginBottom : 5}}>{list.jam}</Text>                                                  
                                                                        {
                                                                            list.isFromSelf ?
                                                                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
                                                                                {
                                                                                    list.isRead ? <Icon name="check" color="gray" size={15} /> : null
                                                                                }
                                                                            </View> : null
                                                                        }
                                                                    </View>
                                                                    </View>
                                                                </TouchableWithoutFeedback>
                                                            }
                                                            </View>
                                                    </View>
                                                </View>
                                        </View>
                                )
                            }
                            </View>
                    }
                    </ScrollView>
                    <SendInputComponent scrollViewRef={scrollViewRef} roomId={roomId} to={to}/>
            </ImageBackground>
    )
}

export default ChatContentScreen