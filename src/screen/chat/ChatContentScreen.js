import React, { useContext, useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, Keyboard, ImageBackground, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { AuthContext } from '../../provider/AuthProvider';
import { ChatContext } from '../../provider/ChatProvider';
import SendInputComponent from './SendInputComponent';
import backgroundChat from '../../assets/chat-background.png'
import Icon from 'react-native-vector-icons/FontAwesome';
import SoundPlayer from 'react-native-sound-player'
import Utils from '../../../Utils'
import firestore from '@react-native-firebase/firestore';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc'

import TalkingComponent from '../video-call/component/TalkingComponent'
import IncommingCallComponent from '../video-call/component/IncommingCallComponent'

const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};


const ChatContentScreen = ({ navigation, route }) => {
    const { baseUrl, user } = useContext(AuthContext)
    const { socket, userOnline } = useContext(ChatContext)
    const { to, room } = route.params;
    const [roomId, setRoomid] = useState(room.id)
    const [chat, setChat] = useState([])
    const [loadingChat, setLoadingChat] = useState(true)
    const [OnPageSearch, setOnPageSearch] = useState(null)
    const [OnIndexSerach, setOnIndexSearch] = useState(0)
    const [isTyping, setIsTyping] = useState(false)
    const [headerShown, setHeaderShown] = useState(true)

    const scrollViewRef = useRef();

    const [localStream, setLocalStream] = useState()
    const [remoteStream, setRemoteStream] = useState()
    const [gettingCall, setGettingCall] = useState(false)

    const pc = useRef()
    const connecting = useRef(false)



    useEffect(() => {
        navigation.setOptions({
            headerShown,
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
            headerRight: () => (
                <TouchableOpacity onPress={create}>
                    <View style={{ marginRight : 10 }}>
                      <Icon name="video-camera" color="white" size={18} />
                    </View>
                </TouchableOpacity>
            ),
        })

        socket.emit('REQUEST_MESSAGE', ({ roomId, to }))

        socket.on('MESSAGE_SENT', (message, resRoomId, action, idUser) => {
            setChat(message)
            setRoomid(resRoomId)
            socket.emit('READ_MESSAGE', resRoomId)
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

        const cRef = firestore().collection('meet').doc('chatId')
        
        const subscribe = cRef.onSnapshot(snapshot => {
            const data = snapshot.data()

            if(pc.current && !pc.current.remoteDescription && data && data.answer){
                pc.current.setRemoteDescription(new RTCSessionDescription(data.answer))
            }

            if(data && data.offer && !connecting.current){
                setGettingCall(true)
            }
        })

        const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if(change.type == 'removed'){
                    hangup()
                }
            })
        })

        return () => {
            socket.removeAllListeners("MESSAGE_SENT");
            Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
            subscribe()
            subscribeDelete()
        }
    }, [isTyping, roomId, userOnline, headerShown])


    const _keyboardDidShow = () => scrollViewRef.current.scrollToEnd({animated: true});

    const setupWebrtc = async () => {
        pc.current = new RTCPeerConnection(configuration)

        const stream = await Utils.getStream()
        if(stream){
            setLocalStream(stream)
            pc.current.addStream(stream)
        }

        pc.current.onaddstream = (event) => {
            setRemoteStream(event.stream)
        }
    }
    const create = async () => {
        setHeaderShown(false)
        connecting.current = true
        await setupWebrtc();

        const cRef = firestore().collection("meet").doc('chatId')
        collectIceCandidates(cRef, "caller", "callee")

        if(pc.current){
            const offer = await pc.current.createOffer();
            pc.current.setLocalDescription(offer)

            const cWithOffer = {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp
                }
            }

            cRef.set(cWithOffer)
        }
    }
    const join = async () => {
        connecting.current = true
        setGettingCall(false)
        setHeaderShown(false)

        const cRef = firestore().collection('meet').doc('chatId')
        const offer = (await cRef.get()).data()?.offer

        if(offer){
            await setupWebrtc()

            collectIceCandidates(cRef, "callee", "caller")

            if(pc.current){
                pc.current.setRemoteDescription(new RTCSessionDescription(offer))

                const answer = await pc.current.createAnswer()
                pc.current.setLocalDescription(answer)
                const cWithAnswer = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp
                    }
                }
                cRef.update(cWithAnswer)
            }
        }
    }
    const hangup = async () => {
        setGettingCall(false)
        connecting.current = false
        streamCleanUp()
        firestoreCleanUp()
        if(pc.current){
            pc.current.close()
        }
        setHeaderShown(true)
    }

    const streamCleanUp = async () => {
        if(localStream){
            localStream.getTracks().forEach((t) => t.stop())
            localStream.release()
        }
        setLocalStream(null)
        setRemoteStream(null)
    }

    const firestoreCleanUp = async () => {
        const cRef = firestore().collection('meet').doc('chatId')

        if(cRef){
            const calleeCandidate = await cRef.collection('callee').get()
            calleeCandidate.forEach(async (candidate) => {
                await candidate.ref.delete()
            })

            const callerCandidate = await cRef.collection('caller').get()
            callerCandidate.forEach(async (candidate) => {
                await candidate.ref.delete()
            })

            cRef.delete()
        }
    }

    const collectIceCandidates = async (cRef, localName, remoteName) => {
        const candidateCollection = cRef.collection(localName)
        if(pc.current){
            pc.current.onicecandidate = (event) => {
                if(event.candidate) {
                    candidateCollection.add(event.candidate)
                }
            }
        }

        cRef.collection(remoteName).onSnapshot(snapshot => {
            snapshot.docChanges().forEach((change) => {
                if(change.type == 'added'){
                    const candidate = new RTCIceCandidate(change.doc.data())
                    pc.current?.addIceCandidate(candidate)
                }
            })
        })
    }

    if(gettingCall){
        return <IncommingCallComponent hangup={hangup} join={join}/>
    }

    if(localStream){
        return(
            <TalkingComponent
                hangup={hangup}
                localStream={localStream}
                remoteStream={remoteStream}
            />
        )
    }

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