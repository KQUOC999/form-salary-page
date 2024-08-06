import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './styles.module.css'; // Import CSS Module
import * as Realm from 'realm-web';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import mqtt from 'mqtt';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const loginMQTTSchema = {
  title: 'Login',
  type: 'object',
  required: ['mqttUrl', 'username', 'password'],
  properties: {
    mqttUrl: {
      type: 'string',
      title: 'MQTT URL',
      default: 'wss://7c1953c894094f7c82714c9feea34dd6.s1.eu.hivemq.cloud:8884/mqtt'
    },
    username: {
      type: 'string',
      title: 'Username',
      default: 'ANHQUOC'
    },
    password: {
      type: 'string',
      title: 'Password',
      default: '123456789'
    }
  }
};

const ControlViewDevice = () => {
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState({});
  const clientRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [canPublish, setCanPublish] = useState(true);
  const [dataImport, setDataImport] = useState([]);
  const [newDataUpdateDevices, setNewDataUpdateDevices] = useState([]);
  const [mqttOptions, setMqttOptions] = useState({
    mqttUrl: 'wss://7c1953c894094f7c82714c9feea34dd6.s1.eu.hivemq.cloud:8884/mqtt',
    username: 'ANHQUOC',
    password: '123456789'
  });
  const [isConnected, setIsConnected] = useState(false);
  const previousMessageRef = useRef('');

  useEffect(() => {
    const user = app.currentUser;
    if (!user) return; 
    if (isConnected) {
    const fetchData = async () => {
      try {
        const functionName = "callDataDevice";
        const response = await user.callFunction(functionName);
        setDataImport(response);
      } catch (error) {
        console.error("Error calling or updating device data:", error);
      }
    };
    
    //Khi message thay đổi thì cập nhật lại dữ liệu
    if (message && message !== previousMessageRef.current) {
      previousMessageRef.current = message;
      fetchData()
    }
  }
  }, [isConnected, message]);

  useEffect(() => {
    if (isConnected) {
      const fetchData = async () => {
        const functionName = 'call_dashboard_Devices';
        try {
          const response = await app?.currentUser?.callFunction(functionName);
          const devicesData = response?.jsonSchema?.properties?.devices?.default || [];
          setDevices(devicesData);
        } catch (error) {
          console.error('Fetch Data Error:', error);
        }
      };
      fetchData();
    }
  }, [isConnected]);

  const connectMQTTClient = () => {
    // Ngắt kết nối MQTT client cũ nếu có
    if (clientRef.current) {
      clientRef.current.end(true, () => {
        console.log('Disconnected from previous MQTT client');
      });
    }

    const { mqttUrl, username, password } = mqttOptions;
    if (!mqttUrl.startsWith('ws://') && !mqttUrl.startsWith('wss://') && !mqttUrl.startsWith('tcp://') && !mqttUrl.startsWith('tls://')) {
      toast.error('Invalid MQTT URL: Missing protocol');
      console.error('Invalid MQTT URL: Missing protocol');
      setIsConnected(false);
      return;
    }

    const options = { username, password };
    const mqttClient = mqtt.connect(mqttUrl, options);

    mqttClient.on('connect', () => {
      toast.success('Connected to MQTT HiveMQ');
      setIsConnected(true); // Đặt trạng thái kết nối là true
      mqttClient.subscribe('#', (err) => {
        if (err) {
          toast.error('Failed to subscribe');
          console.error('Subscribe Error:', err);
        } else {
          console.log('Subscribed to all topics');
        }
      });
    });

    mqttClient.on('error', (err) => {
      toast.error('MQTT Connection Failed');
      console.error('MQTT Connection Error:', err);
      window.location.reload();
    });

    mqttClient.on('message', (topic, message) => {
      const msg = message.toString();
      console.log('Received message:', msg, topic);
      setMessage([msg, topic]);
    });

    clientRef.current = mqttClient;
  };

  const handleSubmit = ({ formData }) => {
    setMqttOptions({
      mqttUrl: formData.mqttUrl,
      username: formData.username,
      password: formData.password
    });

    connectMQTTClient(); // Thực hiện đăng nhập lại với thông tin mới
  };

  const handleFormChange = ({ formData }) => {
    setMqttOptions({
      mqttUrl: formData.mqttUrl,
      username: formData.username,
      password: formData.password
    });
  };

  const handleSwitchChange = (deviceName) => {
    if (!clientRef.current) {
      toast.error('MQTT client is not connected');
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setNewDataUpdateDevices((prevDevices) => {
        const updatedDevices = prevDevices.map((d) => {
          if (d.name === deviceName) {
            const newStatus = !d.status;
            handlePublish(deviceName, newStatus);
            return { ...d, status: newStatus };
          }
          return d;
        });

        return updatedDevices;
      });
    }, 300);
  };

  const updatedNewDataDevices = useCallback(() => {
    const updatedDevices = devices.map((device) => {
      const deviceData = dataImport.find((data) => data.device_id === device.name);
      if (deviceData) {
        let newStatus = false;
        if (deviceData.status === 'ON') {
          newStatus = true
        }
        else {
          newStatus = false
        }
        return {
          ...device,
          status: newStatus
        };
      }
      return device;
    });

    setNewDataUpdateDevices(updatedDevices); 
  }, [dataImport, devices]);
  
  
  useEffect(() => {
    updatedNewDataDevices();
  }, [updatedNewDataDevices]);

  const handlePublish = (deviceName, status) => {
    if (clientRef.current && deviceName && canPublish) {
      const message = status ? 'true' : 'false';
      clientRef.current.publish(deviceName, message, { qos: 0 }, (err) => {
        if (err) {
          console.error('Publish Error:', err);
        }
      });
      setCanPublish(false);
      setTimeout(() => setCanPublish(true), 300);
    }
  };

  const handleLogout = () => {
    if (clientRef.current) {
      clientRef.current.end(true, () => {
        console.log('Disconnected from MQTT broker');
        setIsConnected(false);
        // Reset MQTT options to default values
        setMqttOptions({
          mqttUrl: 'wss://7c1953c894094f7c82714c9feea34dd6.s1.eu.hivemq.cloud:8884/mqtt',
          username: 'ANHQUOC',
          password: '123456789'
        });
      });
    }
  };
  
  if (!isConnected) {
    return (
      <div className={styles.notLogin}>
        <Form
          className={styles.custom_form}
          schema={loginMQTTSchema}
          validator={validator}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          formData={mqttOptions}
        />
        <ToastContainer />
      </div>
    );
  }

  if (!devices.length) {
    return <div className={styles.notLogin}>Loading...</div>;
  }

  return (
    <div className={styles.allContainer}>
      <div className={styles.dashboard}>
        <div className={styles.dashboardName}>
          <FontAwesomeIcon icon={faList} className={styles.dashboardIcon} /> Dashboard
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Đăng xuất
        </button>
        <div className={styles.gridContainer}>
          {newDataUpdateDevices.map((device) => (
            <div key={device.name} className={styles.gridItem}>
              <h2>{device.name}</h2>
              <p><strong>Trạng thái:</strong> {device.status ? 'ON' : 'OFF'}</p>
              <p><strong>Tình trạng:</strong> {device.condition}</p>
              <p><strong>Thông báo:</strong> {device.notification}</p>
              <p><strong>Cảnh báo:</strong> {device.warning}</p>
              <div className={styles.switchContainer}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={device.status}
                    onChange={() => handleSwitchChange(device.name)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ControlViewDevice;
