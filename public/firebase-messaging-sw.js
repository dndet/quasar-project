// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.8.0/firebase-messaging.js');
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo1JFdbsf7OkQIFTeguZMc9ugiKX_sxMk",
  authDomain: "ebpushserver.firebaseapp.com",
  projectId: "ebpushserver",
  storageBucket: "ebpushserver.firebasestorage.app",
  messagingSenderId: "422541257713",
  appId: "1:422541257713:web:b826c96f259558818b7250",
  measurementId: "G-BQVXQ5M8JP"
};

firebase.initializeApp(firebaseConfig);

// Khởi tạo Firebase Cloud Messaging
const messaging = firebase.messaging();

// Xử lý khi nhận thông báo
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/notification-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});