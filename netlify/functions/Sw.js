self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('message', e => {
  if (e.data?.type === 'show-notification') {
    const {title,body,tag,icon,vibrate} = e.data;
    e.waitUntil(self.registration.showNotification(title,{body,icon,badge:icon,tag,vibrate,renotify:true}));
  }
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cs=>{
    for(const c of cs) if('focus' in c) return c.focus();
    return clients.openWindow('/');
  }));
});
 
