import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const formRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
  
        const functionName = "timekeeping_method";
        const response = await user.functions[functionName]();
        const jsonSchema = response[0]?.public?.input?.jsonSchema;

        setJsonSchema(jsonSchema);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTable = useCallback (async () => {
    try {
      const functionName = 'call_dataRecied_timKeepingMethod';
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
      handleTable()
    }, [handleTable])

  const createEnumsSchedule = useCallback ( async () => {
    try {
      const functionName = 'createEnums_employeeSchedule_fromTimeKeepingMethod';
      const response = app?.currentUser?.callFunction(functionName);
      return response
    } catch (error) {
      console.log(error.error)
    }
  }, [])

  const saveDataAsJson = async () => {
    const jsonData = formData
    try {
      const functionName = 'dataRecied_timeKeepingMethod';
      let scheduleName = formData?.scheduleName;

      const response = await app?.currentUser?.callFunction(functionName, jsonData, scheduleName);
      await handleTable();
      await createEnumsSchedule();

      return response
    } catch (error) {
      throw new Error(error)
    }
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
    setFormData({})
    return
  };

  const handleDelete = useCallback(async () => {
    try {
      const functionName = 'delete_dataRecied_timeKeepingMethod';
      if (selectedRowIndex !== null && formData) {
        const checkDataDelete = formData?.scheduleName;
        const response = await app.currentUser.callFunction(functionName, checkDataDelete);
        
        await handleTable();
        await createEnumsSchedule();

        setFormData({})
        return response
      }
      else if (selectedRowIndex === null) {
        toast.error('Vui lòng chọn dữ liệu cần xóa!')
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [handleTable, createEnumsSchedule, selectedRowIndex, formData]);

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
      <div className={styles.containerFormTable}>
        <div className={styles.containerFormButton}>
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
              <ToastContainer/>
            </div>
          </div>   
        </div>
        <div className={styles.tablecontainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th> </th>
                <th>Tên lịch trình</th>
              </tr>
            </thead>
            <tbody>  
            {saveData.map((data, index) => (         
              <tr key={index} onClick={() => handleRowClick(index)} style={{ backgroundColor: selectedRowIndex === index ? '#ddd' : 'transparent' }}>
                <td> </td>
                <td>{data.scheduleName}</td>           
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableWithFormsAndCheckboxes;
