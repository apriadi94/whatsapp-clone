import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';

const CallingComponent = () => {
    return(
        <View style={{ flex: 1, justifyContent : 'flex-end' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 100 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 100, backgroundColor: 'red', borderRadius: 50}}>
                    <Icon name="call-end" color="white" size={50} />
                </View>
            </View>
        </View>
    )
}

export default CallingComponent