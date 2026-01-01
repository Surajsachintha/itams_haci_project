importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDm7l69JF8eOH4oPpw7qodAt0GarhqGjnw",
  authDomain: "itams-e18f6.firebaseapp.com",
  projectId: "itams-e18f6",
  storageBucket: "itams-e18f6.firebasestorage.app",
  messagingSenderId: "361554520960",
  appId: "1:361554520960:web:7d943b2332991f9de46f65",
  measurementId: "G-86RDH1VFNV"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/it-logo.png',
    
    data: {
      url: '/jobs'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked.');
  event.notification.close();
  const route = event.notification.data.url || '/jobs'; 
  const urlToOpen = self.location.origin + route;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});