import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';
import { toast, ToastContainer } from 'react-toastify';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const TableWithFormsAndCheckboxes = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveData, setSaveData] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const formRef = useRef(null);

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDataTable = useCallback(async () => {
    try {
      const functionName = 'call_dataRecied_workShift';
      const response = await app.currentUser.callFunction(functionName);

      if (Array.isArray(response)) {
        setSaveData(response);
      } else {
        setSaveData((prevData) => [...prevData, response]);
      }
    } catch (error) {
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    handleDataTable()
  }, [handleDataTable])

  const handleSaveDataAsJson = useCallback(async () => {
    const jsonData = formData;
    try {
      const functionName = 'dataRecied_workShift';
      let checkShift = jsonData.shiftCode;
      const response = await app?.currentUser?.callFunction(functionName, jsonData, checkShift)

      await handleDataTable();
      toast.success('Lưu thông tin thành công!')
      return response
    } catch (error) {
      throw new Error(error);
    }
  }, [formData, handleDataTable]);

  const handleFormChange = (event) => {
    setFormData(event.formData);
  };

  const handleAdd = () => {
    setFormData({});
    console.log("Thêm dữ liệu:", formData);
  };

  const handleRowClick = useCallback ((index) => {
    if (selectedRowIndex === index){
      setSelectedRowIndex(null);
      setFormData(null)
      return
    }
    setSelectedRowIndex(index);
    setFormData(saveData[index])
  }, [saveData, selectedRowIndex]);

  const handleDelete = useCallback(async () => {
    try {
      const functionName = 'delete_dataRecied_workShift';
      if (selectedRowIndex !== null && formData) {
        const checkDataDelete = formData?.shiftCode;
        const response = await app.currentUser.callFunction(functionName, checkDataDelete);
        
        await handleDataTable();
        return response
      }
      else if (selectedRowIndex === null) {
        toast.error('Vui lòng chọn dữ liệu cần xóa!')
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      throw new Error(error);
    }
  }, [handleDataTable, selectedRowIndex, formData]);
  

  const handleExit = () => {
    console.log("Thoát");
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
      <h2>Shift Form</h2>
      <div className={styles.formSection}>
        <Form
          ref={formRef}
          schema={jsonSchema}
          formData={formData}
          onChange={handleFormChange}
          validator={validator}
          uiSchema={uiSchema}
          onSubmit={handleSaveDataAsJson}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.addButton} onClick={handleExternalSubmit}>Lưu</button>
        <button className={styles.addButton} onClick={handleAdd}>Thêm</button>
        <button className={styles.deleteButton} onClick={handleDelete}>Xóa</button>
        <button className={styles.exitButton} onClick={handleExit}>Thoát</button>
        <ToastContainer/>
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
            {saveData.map((data, index) => (
              <tr key={index} onClick={() => handleRowClick(index)} style={{ backgroundColor: selectedRowIndex === index ? '#ddd' : 'transparent' }}>
                <td>{data.shiftCode}</td>
                <td>{data.timeDetails?.startTime}</td>
                <td>{data.timeDetails?.endTime}</td>
                <td>{data.timeDetails?.mealBreakStart}</td>
                <td>{data.timeDetails?.mealBreakEnd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableWithFormsAndCheckboxes;