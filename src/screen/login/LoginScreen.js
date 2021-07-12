import React from 'react'
import { View, Button } from 'react-native'


const LoginScreen = ({ navigation }) => {
    return(
        <View style={{flex : 1}}>
            <View style={{flex: 1, justifyContent : 'flex-end', alignItems: 'center', marginBottom : 120, marginHorizontal : 20}}>
                  <View style={{ width: 250 }}>
                    <Button title={'Login'} color={'#AAE296'} onPress={() => navigation.navigate('PhoneLoginScreen')}/>
                  </View>
              </View>
        </View>
    )
}

export default LoginScreen