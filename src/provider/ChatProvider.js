import React, {useEffect, useState, createContext} from 'react';
import socketIOClient from 'socket.io-client';
import {BASE_URL} from "@env"

const socket = socketIOClient(BASE_URL);

export const ChatContext = createContext();
export const ChatProvider = ({user, children, navigation}) => {
  const [userOnline, setUserOnline] = useState([]);

  const auth = {
    token: 'berenang_renang_ketepian',
    userId: user.idForUser,
    username: user.displayName,
    profileImage: user.photoURL,
  };


  useEffect(() => {
    socket.auth = auth;
    socket.connect();

    socket.on('USER_ONLINE', list => {
      const result = Object.keys(list).map(key => list[key]);
      setUserOnline(result);
    });
    
  }, [navigation]);

  const chatState = {socket, userOnline};

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};
