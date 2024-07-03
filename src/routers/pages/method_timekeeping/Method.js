import React, { useState, useEffect, useRef } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const TableWithFormsAndCheckboxes = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        if (!user) {
          await app.logIn(Realm.Credentials.anonymous());
        }
        const functionName = "timekeeping_method";
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
    const newFormData = event.formData;

    // Update note based on methodSelection from jsonSchema
    const methodSelection = newFormData.methodSelection; // Giả sử newFormData là dữ liệu mới từ form
    const schemaItem = jsonSchema?.dependencies?.methodSelection?.oneOf.find(item =>
      item.properties.methodSelection.enum.includes(methodSelection)
    )?.properties?.note?.default;
    if (!schemaItem){
      setFormData({
        ...newFormData,
        note: ""
      });
    }
    else {
    setFormData({
      ...newFormData,
      note: schemaItem || ""
    });
  }
  };

  const handleAdd = () => {
    // Thực hiện hành động tương ứng với tab
  };

  const handleDelete = () => {
    // Thực hiện hành động tương ứng với tab
  };

  const handleExit = () => {
    // Thực hiện hành động tương ứng với tab
  };

  const handleExternalSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Cách chấm công</h2>
      <div className={styles.formSection}>
        <Form
          ref={formRef}
          schema={jsonSchema}
          formData={formData}
          onChange={handleFormChange}
          validator={validator}
          uiSchema={uiSchema}
          onSubmit={saveDataAsJson}
        />
      </div>
      <div className={styles.container_buttonGroup}>
        <div className={styles.buttonGroup}>
          <button className={styles.addButton} onClick={handleAdd}>Thêm mới</button>
          <button className={styles.saveButton} onClick={handleExternalSubmit}>Lưu</button>
          <button className={styles.deleteButton} onClick={handleDelete}>Xóa</button>
          <button className={styles.exitButton} onClick={handleExit}>Thoát</button>
        </div>
      </div>   
    </div>
  );
};

export default TableWithFormsAndCheckboxes;
