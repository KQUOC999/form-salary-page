import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const TableWithFormsAndCheckboxes = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        if (!user) {
          await app.logIn(Realm.Credentials.anonymous());
        }
        const functionName = "shift";
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
    setFormData(event.formData);
  };

  const handleAdd = () => {
    // Thực hiện hành động thêm dữ liệu tương ứng với tab
    console.log("Thêm dữ liệu:", formData);
  };

  const handleDelete = () => {
    // Thực hiện hành động xóa dữ liệu tương ứng với tab
    console.log("Xóa dữ liệu:", formData);
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
      <h2>Shift Form</h2>
      <div className={styles.formSection}>
        <Form
          schema={jsonSchema}
          formData={formData}
          onChange={handleFormChange}
          validator={validator}
          uiSchema={uiSchema} 
          onSubmit={saveDataAsJson}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.addButton} onClick={handleAdd}>Thêm</button>
        <button className={styles.deleteButton} onClick={handleDelete}>Xóa</button>
        <button className={styles.exitButton} onClick={handleExit}>Thoát</button>
      </div>
      <div className={styles.tablecontainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã Ca</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Vào ăn trưa</th>
              <th>Ra ăn trưa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sáng</td>
              <td>07:30</td>
              <td>11:30</td>
              <td></td>
              <td></td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableWithFormsAndCheckboxes;