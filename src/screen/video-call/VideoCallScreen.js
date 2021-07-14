import React, { useEffect, useRef, useState } from 'react'
import { View, Button } from 'react-native'
import IncommingCallComponent from './component/IncommingCallComponent'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc'
import TalkingComponent from './component/TalkingComponent'
import Utils from '../../../Utils'
import firestore from '@react-native-firebase/firestore';


const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

const VideoCallScreen = () => {
    const [localStream, setLocalStream] = useState()
    const [remoteStream, setRemoteStream] = useState()
    const [gettingCall, setGettingCall] = useState(false)

    const pc = useRef()
    const connecting = useRef(false)

    useEffect(() => {
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
            subscribe()
            subscribeDelete()
        }
    }, [])

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
        <View style={{flex: 1}}>
            <Button title="call" onPress={create}/>
        </View>
    )
}

export default VideoCallScreen