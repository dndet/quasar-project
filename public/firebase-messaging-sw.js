importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBo1JFdbsf7OkQIFTeguZMc9ugiKX_sxMk',
    authDomain: 'ebpushserver.firebaseapp.com',
    projectId: 'ebpushserver',
    storageBucket: 'ebpushserver.firebasestorage.app',
    messagingSenderId: '422541257713',
    appId: '1:422541257713:web:b826c96f259558818b7250',
    measurementId: 'G-BQVXQ5M8JP'
})
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon.png'
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
});