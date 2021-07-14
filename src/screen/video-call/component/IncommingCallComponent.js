import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';

const IncommingCallComponent = ({ hangup, join }) => {
    return(
        <View style={{ flex: 1, justifyContent : 'flex-end' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 100 }}>
                <TouchableOpacity onPress={join} style={{ justifyContent: 'center', alignItems: 'center', width: 80, height: 80, marginRight: 30, backgroundColor: '#66c2ff', borderRadius: 50}}>
                    <Icon name="call" color="white" size={50} />
                </TouchableOpacity>
                <TouchableOpacity onPress={hangup} style={{ justifyContent: 'center', alignItems: 'center', width: 80, height: 80, marginLeft: 30, backgroundColor: 'red', borderRadius: 50}}>
                    <Icon name="call-end" color="white" size={50} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default IncommingCallComponent