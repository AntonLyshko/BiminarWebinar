import React from "react";

import axios from "axios";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/database";
import "firebase/analytics";

export const FirebaseContext = React.createContext(null);

let firebaseConfig = {
  apiKey: "AIzaSyDJ_OV9YFYSBcN0LCOHm1PBPtM1lf6upuI",
  authDomain: "biminar-b7b32.firebaseapp.com",
  databaseURL: "https://biminar-b7b32-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "biminar-b7b32",
  storageBucket: "biminar-b7b32.appspot.com",
  messagingSenderId: "365332673521",
  appId: "1:365332673521:web:a9848eb1db7c8547c90a50",
};

class Firebase {
  constructor() {
    if (!firebase.apps.length) {
      this.checkAvaliability();

      firebase.initializeApp(firebaseConfig);
      firebase.analytics();
    } else {
      firebase.app();
    }
    this.db = firebase.database();
    this.storage = firebase.storage().ref();
  }

  // Запрос идет первым, понять доступен сервис или нет. Для жителей КРЫМА
  checkAvaliability = async () => {
    try {
      let { data } = await axios.get(`https://${firebaseConfig.projectId}.firebaseio.com/messages.json`);
      return data;
    } catch (error) {
      if (!error.response) {
        localStorage.setItem("error", "VPN");
      }
    }
  };

  getPrevMessages = async (chatId, TopMessageTime, limit) => {
    let { data } = await axios.get(
      `${firebaseConfig.databaseURL}/messages/${chatId}.json?orderBy="time"&endAt=${TopMessageTime}&limitToLast=${limit}`
    );
    return data;
  };

  getHiddenMessagesREST = async (chatId, lastMessageTime) => {
    let { data } = await axios.get(
      `${firebaseConfig.databaseURL}/messages/${chatId}.json?orderBy="time"&startAt=${lastMessageTime}`
    );
    return data;
  };

  //Add
  addMessage = (chatId, username, avatar, content, cuid, time) => {
    if (chatId) {
      let msgList = this.db.ref("messages/" + chatId);
      let newMsg = msgList.push();
      newMsg.set({ avatar, username, content, cuid, time });
    }
  };

  // Разбор пачки на отправку
  addArrayMessage = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { chatId, username, avatar, content, cuid, time } = data[i];
      this.addMessage(chatId, username, avatar, content, cuid, time);
    }
  };

  addChat = (name) => {
    var chatList = this.db.ref("chats");
    var newChat = chatList.push();
    newChat.set({ name });
  };

  addUser = ({ id, username, avatar }) => {
    var userList = this.db.ref("users/" + id);
    var newUser = userList.push();
    newUser.set({ username, avatar });
  };

  uploadFile = async (fileName, data) => {
    var imageRef = this.storage.child(fileName);
    var uploadTask = imageRef.putString(data, "data_url");

    await uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        switch (error.code) {
          case "storage/unauthorized":
            console.log("User unauthorized");
            break;
          case "storage/canceled":
            console.log("User canceled upload");
            break;
          case "storage/unknown":
            console.log("unknown error");
            break;
        }
      }
    );

    return await uploadTask.snapshot.ref.getDownloadURL();
  };

  //Get
  chats = () => this.db.ref(`chats`);
  user = (uid) => this.db.ref(`users/${uid}`);
  messages = (uid) => this.db.ref(`messages/${uid}`);
  chatLength = (uid) => this.db.ref(`length/${uid}`);
}

const FirebaseProvider = ({ children }) => {
  const firebase = new Firebase();

  return <FirebaseContext.Provider value={{ firebase }}>{children}</FirebaseContext.Provider>;
};

export default FirebaseProvider;
