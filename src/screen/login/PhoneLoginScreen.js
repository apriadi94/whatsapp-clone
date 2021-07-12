import React, { useState } from 'react';
import { View, Button, TextInput, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import GoogleLogin from './GoogleLogin';


const PhoneLoginScreen = () => {
   // If null, no SMS has been sent
  const [NomorHp, setNomorHp] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [Loading, setLoading] = useState(false)

  const [code, setCode] = useState('');

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    setLoading(true);
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
    setLoading(false);
  }

  async function confirmCode() {
    try {
      await confirm.confirm(code);
        const update = {
          displayName: `+62${NomorHp}`,
          photoURL: 'https://firebasestorage.googleapis.com/v0/b/portalptkendari.appspot.com/o/anonymos.png?alt=media&token=d508f4a7-e1f4-4270-ac81-4192fd5605b0',
        };
        auth().currentUser.updateProfile(update);
    } catch (error) {
      alert('Invalid code.');
    }
  }

  const valiDate = (text) => {
    const nomor_awal = NomorHp.substring(0, 1);
    if(nomor_awal === '0'){
      alert('awalan tidak usah pakai 0')
      setNomorHp('')
    }else{
      setNomorHp(text)
    }
  }


  if (!confirm) {
    return (
      <View>
        <View style={{marginTop : 10, backgroundColor : '#fff'}}>
        <View style={{marginHorizontal : 20, marginTop : 20, marginBottom : 20}}>
          <Text>Masukan Nomor Handphone</Text>
          <View style={{flexDirection : 'row'}}>
            <Text style={{marginTop : 13, fontSize : 20}}>+62</Text>
            <TextInput value={NomorHp} onChangeText={(text) => valiDate(text)} 
                style={{ 
                    fontSize : 20,
                    marginLeft : 30,
                    marginRight : 10,
                    width : '75%', 
                    borderWidth : 1,
                    borderBottomColor : '#cccccc',
                    marginBottom : 20,
                    borderTopColor : '#fff',
                    borderLeftColor : '#fff',
                    borderRightColor : '#fff'
                  }} />
          </View>

           <Text style={{textAlign : 'justify', fontSize : 20, marginBottom : 20}}>Saya setuju dengan semua peraturan, dan ketentuan pelayanan</Text>
           <Button title="Lanjutkan" color='#84d198' disabled={NomorHp.length < 10 || Loading} onPress={() => signInWithPhoneNumber(`+62${NomorHp}`)}/>
        </View>
      </View>

        <View style={{marginTop : 30, backgroundColor : '#fff'}}>
          <Text style={{textAlign : 'center', marginTop : 20, fontSize : 20}}>Coba Login dengan Cara Lain</Text>
          <GoogleLogin/>
        </View>
      </View>
    );
  }

  return (
    <View style={{marginTop : 10, backgroundColor : '#fff'}}>
      <View style={{marginHorizontal : 20, marginTop : 20, marginBottom : 20}}>
        <TextInput style={{ 
                    fontSize : 20,
                    width : '100%', 
                    borderWidth : 1,
                    borderBottomColor : '#cccccc',
                    marginBottom : 20,
                    borderTopColor : '#fff',
                    borderLeftColor : '#fff',
                    borderRightColor : '#fff'
                  }} value={code} onChangeText={text => setCode(text)} />
        <Button title="Konfirmasi Kode" onPress={() => confirmCode()} />
      </View>
    </View>
  );
}

export default PhoneLoginScreen