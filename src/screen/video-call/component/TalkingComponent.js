import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import Icon from 'react-native-vector-icons/MaterialIcons';

const ButtonContainer = ({hangup}) => {
    return(
        <TouchableOpacity onPress={hangup} style={{ flex: 1, justifyContent : 'flex-end' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 80 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: 80, height: 80, backgroundColor: 'red', borderRadius: 50}}>
                    <Icon name="call-end" color="white" size={50} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const TalkingComponent = ({ hangup, localStream, remoteStream}) => {
    if(localStream && !remoteStream){
        return(
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems:'center' }}>
                <RTCView streamURL={localStream.toURL()} objectFit={'cover'}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    }}
                    />
                <ButtonContainer hangup={hangup}/>
            </View>
        )
    }

    if(localStream && remoteStream){
        return(
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems:'center' }}>
                <RTCView streamURL={remoteStream.toURL()} objectFit={'cover'}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    }}
                    />
                <RTCView streamURL={localStream.toURL()} objectFit={'cover'}
                    style={{
                        position: 'absolute',
                        width: 100,
                        height: 150,
                        top: 0,
                        left: 20,
                        elevation: 10
                    }}
                    />
                <ButtonContainer hangup={hangup}/>
            </View>
        )
    }
}

export default TalkingComponent