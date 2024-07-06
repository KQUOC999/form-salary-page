import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [tableData, setTableData] = useState([]);
  const formRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;

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
  
  const creatTableBelow = useCallback (() =>{
    const numRows = 31;
    const numCols = 20;
    const newData = [];

    for (let i = 0; i < numRows; i++) {
      const row = [];
      row.push(`Ngày ${i + 1}`);
      for (let j = 0; j < numCols; j++) {
        row.push(" ");
      }
      newData.push(row);
    }
    setTableData(newData);
  }, []);

  useEffect(() => {
    creatTableBelow();
  },[creatTableBelow]);

  const saveDataAsJson = () => {
    const jsonData = JSON.stringify(formData, null, 2);
    console.log(jsonData);
    if (selectedIndex !== null) {
      const newData = [...formData];
      newData[selectedIndex] = currentData;
      setFormData(newData);
    } else {
      setFormData([...formData, currentData]);
    }
    setCurrentData({});
    setSelectedIndex(null);
    // Save or send jsonData to another API if needed
  };

  const handleFormChange = (event) => {
    setCurrentData(event.formData);
  };

  const handleAdd = () => {
    setFormData([...formData, currentData]);
    setCurrentData({});
  };

  const handleDelete = () => {
    if (selectedIndex !== null) {
      const newData = formData.filter((_, i) => i !== selectedIndex);
      setFormData(newData);
      setCurrentData({});
      setSelectedIndex(null);
    }
  };

  const handleExit = () => {
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };

  const handleChosseShiftAll = () => {
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };
  const handleChosseShift = () => {
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };
  const handleDeleteShiftAll = () => {
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };
  const handleDeleteShift = () => {
    // Thực hiện hành động thoát hoặc điều hướng đến trang khác
    console.log("Thoát");
  };

  const handleSelect = (index) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setCurrentData({});
      return;
    }
    setSelectedIndex(index);
    setCurrentData(formData[index]);
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
      <h2>Lịch trình</h2>
      <div className={styles.containerTableFormButton}>
        <div className={styles.scheduleListTableTop}>
          <table className={styles.scheduleTableTop}>
            <thead>
              <tr>
                <th>Lịch trình</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((data, index) => (
                <tr key={index} onClick={() => handleSelect(index)}>
                  <td>{data.scheduleName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.containerFormButtonFlex}>
          <div className={styles.containerFormButton}>
            <div className={styles.formSection}>
              <Form
                ref={formRef}
                schema={jsonSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
                onSubmit={saveDataAsJson}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button onClick={handleAdd}>Thêm mới</button>
              <button onClick={handleExternalSubmit}>Lưu</button>
              <button onClick={handleDelete}>Xóa</button>
              <button onClick={handleExit}>Thoát</button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.containerTableBelow}>
        <div className={styles.containerChildres}>
          <table id="custom-table" className={styles.scheduleListTableBelow}>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={handleChosseShiftAll}>Chọn ca tất cả</button>
        <button onClick={handleChosseShift}>Chọn ca</button>
        <button onClick={handleDeleteShiftAll}>Xóa ca tất cả</button>
        <button onClick={handleDeleteShift}>Xóa ca</button>
      </div>
    </div>
  );
};

export default Schedule;
