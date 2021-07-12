import React, { useEffect, useState, createContext } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SplashScreen from 'react-native-splash-screen'
import { BASE_URL } from "@env"
import axios from 'axios'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const baseUrl = BASE_URL
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true)

    const onAuthStateChanged = async (user) => {
        await setUser(user);
        SplashScreen.hide();
        if (initializing){
          setInitializing(false);
          
          if(user){
            getAuthentication(user)
          }
        }
    }

    const signOutGoogle = async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        alert(error)
      }
    };

    const signOut = async () => {
        auth()
        .signOut()
        .then(() => {
          if(user._user.providerData[0].providerId === 'google.com'){
              signOutGoogle();
          }
        });
    };

    const getAuthentication = async(user) => {
      await axios({
            method: 'POST',
            url: `${baseUrl}/api/user`,
            data: {
                  name: user._user.displayName ??  user._user.phoneNumber,
                  uid:  user._user.uid, 
                  profilePicture:  user._user.photoURL,
                  tokenNotif: null
            },
            headers:{
                  Accept: 'Aplication/json'
            }
      }).then(res => {
        setUser({...user, idForUser: res.data.data.id})
      }).catch(err => {
          console.log(err)
      })
      setLoadingAuth(false)
    }

      useEffect(() => {
        SplashScreen.show();
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
      }, []);

    const AuthState = { user, setUser, initializing, signOut, baseUrl, loadingAuth };

    return(
        <AuthContext.Provider value={AuthState}>
            {children}
        </AuthContext.Provider>
    )
}