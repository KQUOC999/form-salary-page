import React, { useEffect, useState, useRef } from 'react';
import * as Realm from 'realm-web';
import styles from './styles.module.css'; // Import CSS Module

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const WebSocketClient = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('wss://192.168.1.7/ws'); // Update with your ESP32 WebSocket server address

    socketRef.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket Server');
    };

    socketRef.current.onmessage = (event) => {
      console.log('Received message: ', event.data);
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (socketRef.current && input && isConnected) {
      socketRef.current.send(input);
      setInput('');
    }
  };

  const checkWebSocketState = () => {
    if (socketRef.current) {
      switch (socketRef.current.readyState) {
        case WebSocket.CONNECTING:
          console.log('WebSocket is connecting...');
          break;
        case WebSocket.OPEN:
          console.log('WebSocket is open and connected.');
          break;
        case WebSocket.CLOSING:
          console.log('WebSocket is closing...');
          break;
        case WebSocket.CLOSED:
          console.log('WebSocket is closed.');
          break;
        default:
          console.log('Unknown WebSocket state.');
          break;
      }
    }
  };

  useEffect(() => {
    checkWebSocketState();
  }, [])
  

  if (!app.currentUser) {
    return <div className={styles.notLogin}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>WebSocket Client</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
        />
        <button onClick={sendMessage} aria-label="Send Message">Send</button>
      </div>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WebSocketClient;
