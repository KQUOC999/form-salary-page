import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const EmployeeSchedule = () => {
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
        const functionName = "employee_scheduleJsonSchema";
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
    console.log("Thoát");
  };

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Thông tin nhân viên</h2>
      <div className={styles.flexContainer}>
        <div className={styles.scheduleList}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Mã chấm công</th>
                <th>Tên nhân viên</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((data, index) => (
                <tr
                  key={index}
                  className={selectedIndex === index ? styles.selected : ''}
                  onClick={() => handleSelect(index)}
                >
                  <td>{data.maNhanVien}</td>
                  <td>{data.maChamCong}</td>
                  <td>{data.tenNhanVien}</td>
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

export default EmployeeSchedule;
