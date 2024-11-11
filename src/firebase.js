import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { Notify } from 'quasar'

const firebaseConfig = {
  apiKey: 'AIzaSyBo1JFdbsf7OkQIFTeguZMc9ugiKX_sxMk',
  authDomain: 'ebpushserver.firebaseapp.com',
  projectId: 'ebpushserver',
  storageBucket: 'ebpushserver.firebasestorage.app',
  messagingSenderId: '422541257713',
  appId: '1:422541257713:web:b826c96f259558818b7250',
  measurementId: 'G-BQVXQ5M8JP'
}

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

// Xử lý yêu cầu quyền nhận thông báo
export async function requestPermission () {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Permission granted for notifications.')
      // Lấy token FCM sau khi người dùng cấp quyền
      getToken(messaging, { vapidKey: 'your-public-vapid-key' }).then(token => {
        if (token) {
          console.log('FCM token:', token)
        } else {
          console.log('No FCM token available')
        }
      }).catch(err => {
        console.error('Error retrieving FCM token:', err)
      })
    } else {
      console.log('Notification permission denied.')
    }
  }).catch(err => {
    console.error('Error requesting notification permission:', err)
  })
}

// Xử lý khi nhận thông báo foreground
onMessage(messaging, (payload) => {
  console.log('Message received: ', payload)
  // Xử lý thông báo foreground (hiển thị thông báo trên trang)
  Notify.create({
    message: payload.notification.body,
    color: 'blue',
    icon: 'info',
    position: 'top-right',
    timeout: 3000
  })
})
