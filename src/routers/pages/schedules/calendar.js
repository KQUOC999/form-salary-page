import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const Schedule = () => {
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
        const functionName = "calendar";
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

  const saveDataAsJson = () => {
    const jsonData = JSON.stringify(formData, null, 2);
    console.log(jsonData);
    // Save or send jsonData to another API if needed
  };

  const handleFormChange = (event) => {
    setCurrentData(event.formData);
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
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Form Chấm Công</h2>
      <div className={styles.flexContainer}>
        <div className={styles.scheduleList}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Lịch trình</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((data, index) => (
                <tr
                  key={index}
                  className={selectedIndex === index ? styles.selected : ''}
                  onClick={() => handleSelect(index)}
                >
                  <td>{data.lichTrinh || `Item ${index + 1}`}</td>
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
            onSubmit={saveDataAsJson}
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

export default Schedule;