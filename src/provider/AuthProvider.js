import React, { useEffect, useState, createContext } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SplashScreen from 'react-native-splash-screen'
import { BASE_URL } from "@env"

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const baseUrl = BASE_URL
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    const onAuthStateChanged = async (user) => {
        await setUser(user);
        SplashScreen.hide();
        if (initializing){
          setInitializing(false);
          SplashScreen.hide();
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

      useEffect(() => {
        SplashScreen.show();
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
      }, []);

    const AuthState = { user, setUser, initializing, signOut, baseUrl };

    return(
        <AuthContext.Provider value={AuthState}>
            {children}
        </AuthContext.Provider>
    )
}