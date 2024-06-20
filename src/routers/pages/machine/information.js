import React, { useState, useEffect } from 'react';
import Form from "@rjsf/core";
import * as Realm from 'realm-web';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from '../schedules/uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const MachineInformation = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        if (!user) {
          await app.logIn(Realm.Credentials.anonymous());
        }
        const functionName = "machine_informationJsonSchema";
        const response = await user.functions[functionName]();
        const jsonSchema = response[0]?.public?.input?.jsonSchema;

        setJsonSchema(jsonSchema);
        console.log("response:", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = ({ formData }) => {
    setCurrentData(formData);
  };

  const handleAdd = () => {
    setFormData([...formData, currentData]);
    setCurrentData({});
  };

  const handleSave = () => {
    if (selectedIndex !== null) {
      const newData = [...formData];
      newData[selectedIndex] = currentData;
      setFormData(newData);
    } else {
      setFormData([...formData, currentData]);
    }
    setCurrentData({});
    setSelectedIndex(null);
  };

  const handleDelete = () => {
    if (selectedIndex !== null) {
      const newData = formData.filter((_, i) => i !== selectedIndex);
      setFormData(newData);
      setCurrentData({});
      setSelectedIndex(null);
    }
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setCurrentData(formData[index]);
  };

  const handleExit = () => {
    // Implement exit logic if needed
    console.log("Exiting Machine Information");
  };

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Thông tin máy</h2>
      <div className={styles.flexContainer}>
        <div className={styles.scheduleList}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Tên máy</th>
                <th>Loại kết nối</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((data, index) => (
                <tr
                  key={index}
                  className={selectedIndex === index ? styles.selected : ''}
                  onClick={() => handleSelect(index)}
                >
                  <td>{data.tenMay}</td>
                  <td>{data.ketNoi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.formSection}>
          <Form
            schema={jsonSchema}
            formData={currentData}
            onChange={handleFormChange}
            validator={validator}
            uiSchema={uiSchema}
          />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={handleAdd}>Thêm mới</button>
        <button onClick={handleSave}>Lưu</button>
        <button onClick={handleDelete}>Xóa</button>
        <button onClick={handleExit}>Thoát</button>
      </div>
    </div>
  );
};

export default MachineInformation;
