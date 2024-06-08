import React, { useEffect, useState, useCallback } from 'react';
import mqtt from 'mqtt';
import * as Realm from 'realm-web';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const MqttClient = () => {
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [client, setClient] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const callDataDevice = useCallback(async () => {
    const user = app.currentUser;
    if (!user) return; // User chưa đăng nhập hoặc chưa khởi tạo
    const functionName = "callDataDevice";
    try {
      const response = await user.callFunction(functionName);
      console.log("Response from cloud function:", response);
      updateDataDevice(response);
    } catch (error) {
      console.error("Error calling or updating device data:", error);
    }
  }, []);

  useEffect(() => {
    const mqttUrl = 'wss://7c1953c894094f7c82714c9feea34dd6.s1.eu.hivemq.cloud:8884/mqtt';
    const options = {
      username: 'ANHQUOC', // Thay bằng username của bạn
      password: '123456789', // Thay bằng password của bạn
    };

    const mqttClient = mqtt.connect(mqttUrl, options);

    mqttClient.on('connect', () => {
      console.log('Connected to HiveMQ');
      mqttClient.subscribe('thietbi1', (err) => {
        if (!err) {
          console.log('Subscribed to thietbi1');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      const msg = message.toString();
      console.log('Received message:', msg);
      setMessage(msg);
      // Cập nhật dữ liệu thiết bị mỗi khi nhận được tin nhắn mới
      callDataDevice();
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, [callDataDevice]);

  useEffect(() => {
    // Hàm này chỉ chạy khi component được mount lần đầu
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        if (!user) return; // User chưa đăng nhập hoặc chưa khởi tạo
        const functionName = "callDataDevice";
        const response = await user.callFunction(functionName);
        console.log("Response from cloud function:", response);
        updateDataDevice(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Error calling or updating device data:", error);
      }
    };

    fetchData(); // Gọi hàm fetchData ngay khi component được mount
  }, []);

 
  const updateDataDevice = async (response) => {
    try {
      const dataShow = {
        device_id: response[0]?.device_id,
        status: response[0]?.status
      };
      setDeviceData(dataShow);
    } catch (error) {
      console.error("Error updating device data:", error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (client && inputValue) {
      client.publish('thietbi1', inputValue);
      setInputValue('');
      // Gọi hàm callDataDevice để cập nhật dữ liệu sau khi gửi tin nhắn
      callDataDevice();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
    <div className="form-container">
      <h1>Cloud Client</h1>
      <p>Received message: {message}</p>
      <form onSubmit={handleSubmit}>
        <strong>Device ID: {deviceData ? deviceData.device_id : '-'}</strong> <br />
        <strong>Status: {deviceData ? deviceData.status : '-'}</strong><br /><br />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter message"
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
    </div>
  );
};

export default MqttClient;
