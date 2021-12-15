importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');

firebase.initializeApp({
  	apiKey: "AIzaSyDL8rFrbfZ_qAuSH3o5pTIbTIHFtcavWS0",
    authDomain: "medzigo-f9a87.firebaseapp.com",
    databaseURL: "https://medzigo-f9a87.firebaseio.com",
    projectId: "medzigo-f9a87",
    storageBucket: "medzigo-f9a87.appspot.com",
    messagingSenderId: "1080823318995",
    appId: "1:1080823318995:web:93696425e72021374e0726",
    measurementId: "G-804NRN6W70"
});

const messaging = firebase.messaging();
