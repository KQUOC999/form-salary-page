import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import CompanyStructure from '../structureCompany.module/companyStructure';
import { useAppContext } from '../structureCompany.module/appContext.module';
import { ToastContainer, toast } from 'react-toastify';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';
import { useDebounce } from 'use-debounce'; // Thêm debounce package

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const EmployeeSchedule = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [jsondataRead, setJsonDataRead] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [, setSelectedIndex] = useState(null);
  const { selectedNode, parentNode } = useAppContext();
  const [serverData, setServerData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const formRef = useRef(null); // Ref cho form

  // Fetch JSON schema and data
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
        const jsondataRead = response[0]?.public?.input?.getdata;
        
        setJsonSchema(jsonSchema);
        setJsonDataRead(jsondataRead);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Call data from server based on selected label
  const [debouncedSelectedNode] = useDebounce(selectedNode, 500); // Debounce 500ms

  const callDataBySelectedLable = useCallback(async () => {
    const functionName = "callDataForm_bySelectedLable";
    const selectedLableDepartment = debouncedSelectedNode?.lable;
    const parentNodes = parentNode?.parentNode?.label;

    if (!parentNodes) {
      console.warn("No parent nodes available.");
      return;
    }

    try {
      const response = await app.currentUser.callFunction(functionName, selectedLableDepartment, parentNodes);
      const filteredResponse = response.filter(item => 
        !serverData.some(existingItem =>
          existingItem.department === item.department &&
          existingItem.employeeId === item.employeeId
        )
      );

      if (filteredResponse.length > 0) {
        setServerData(prevData => [...prevData, ...filteredResponse]);
      }

      setCurrentData(filteredResponse[0] || {});
      return filteredResponse;

    } catch (error) {
      return [];
    }
  }, [debouncedSelectedNode, parentNode, serverData]);

  useEffect(() => {
    if (debouncedSelectedNode) {
      callDataBySelectedLable();
    }
  }, [debouncedSelectedNode, callDataBySelectedLable]);
  
  // Handle form data change
  const handleFormChange = (event) => {
    setCurrentData(event.formData);
  };

  // Handle showing data based on selected rows
  const handleShowDataForm = useCallback(async () => {
    if (selectedRows.length > 0) {
      try {
        const functionName = 'call_dataRecied_employeeSchedule';
        const response = await app?.currentUser?.callFunction(functionName);
        const newArrayResponse = response[0].map(item => ({ ...item }));
        const trueElementsArray = [];

        for (let i = 0; i < newArrayResponse.length; i++) {
          const department = newArrayResponse[i].department;
          const checkData = formData.filter(doc => doc.department === department);
          if (checkData.length > 0) {
            trueElementsArray.push(...checkData);
          }
        }

        let count = 0;
        const newArrayDataBySelectedRow = [];
        for (let i = 0; i < newArrayResponse.length; i++) {
          const employeeId = newArrayResponse[i].employeeId;
          const employeeName = newArrayResponse[i].employeeName;  
          if (formData.some(doc => doc.employeeId === employeeId && doc.employeeName === employeeName)) {
            newArrayDataBySelectedRow.push(newArrayResponse[i])
            count = count + 1;
          }
        }

        if (count === 1) {
          setJsonDataRead(prevDataRead => ({
            ...prevDataRead,
            properties: {
              lichTrinhLamViecDoc: {
                title: "Lịch trình làm việc",
                type: "string",
                default: newArrayDataBySelectedRow[0].lichTrinhLamViec || ""
              },
              lichTrinhVaoRaDoc: {
                title: "Lịch trình vào ra",
                type: "string",
                default: newArrayDataBySelectedRow[0].lichTrinhVaoRa || ""
              }
            },
            title: "Dữ liệu cập nhật",
            type: "object"
          }));
        }
        else {
          setJsonDataRead(prevDataRead => ({
            ...prevDataRead,
            properties: {
              lichTrinhLamViecDoc: {
                title: "Lịch trình làm việc",
                type: "string",
                default: ""
              },
              lichTrinhVaoRaDoc: {
                title: "Lịch trình vào ra",
                type: "string",
                default:""
              }
            },
            title: "Dữ liệu cập nhật",
            type: "object"
          }));
        }

        return trueElementsArray;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    return [];
  }, [formData, selectedRows]);

  useEffect(() => {
    if (formData.length > 0) {
      handleShowDataForm();
    }
  }, [formData, handleShowDataForm]);

  // Handle row selection
  const handleSelect = useCallback((index) => {
    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = prevSelectedRows.includes(index)
        ? prevSelectedRows.filter(row => row !== index)
        : [...prevSelectedRows, index];

      // Update formData based on newSelectedRows
      const updatedFormData = newSelectedRows.map(i => serverData[i]);
      setFormData(updatedFormData);

      if (newSelectedRows.length === 1) {
        setCurrentData(serverData[newSelectedRows[0]]);
        setSelectedIndex(newSelectedRows[0]);
      } else {
        setCurrentData({});
        setSelectedIndex(null);
      }
      return newSelectedRows;
    });
  }, [serverData]);

  // Handle saving and arranging data
  const handleSaveArrange = async () => {
    if (!currentData.lichTrinhLamViec || !currentData.lichTrinhVaoRa) {
      toast.error('Vui lòng chọn thông tin nhân viên');
      return;
    }
    console.log(formData);
    if (formData.length === 0) {
      toast.error('Bạn chưa chọn dữ liệu trong bảng!');
      return;
    }
    try {
      const functionName = 'dataRecied_employeeSchedule';
      const dataRecieved = formData.map(data => ({
        ...data,
        ...currentData
      }));
      const departmentsChecked = formData.map(data => data.department);
      const response = await app?.currentUser?.callFunction(functionName, dataRecieved, departmentsChecked);
      toast.success('Dữ liệu đã được lưu!');
      return response;
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  // Handle dropping and removing selected rows
  const handleDropArrange = () => {
    const newData = formData.filter((_, i) => !selectedRows.includes(i));
    setFormData(newData);
    setCurrentData({});
    setSelectedIndex(null);
    setSelectedRows([]);
  };

  // Submit form externally
  const handleExternalSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Render loading state if jsonSchema is not available
  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerLeft}>
        <CompanyStructure user={app.currentUser} />
      </div>
      <div className={styles.containerRight}>
        <h2>Thông tin nhân viên</h2>
        <div className={styles.flexContainer}>
          <div className={styles.scheduleList}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th></th>
                  <th>Mã nhân viên</th>
                  <th>Mã chấm công</th>
                  <th>Tên nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(serverData) && serverData.map((employee, index) => (
                  <tr
                    key={index}
                    className={selectedRows.includes(index) ? styles.selected : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(index)}
                        onChange={() => handleSelect(index)}
                      />
                    </td>
                    <td>{employee.employeeId || employee['Mã NV']}</td>
                    <td>{employee.timekeepingId || employee['Mã CC']}</td>
                    <td>{employee.employeeName || employee['Tên nhân viên']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formSectionLeft}>
              <Form
                ref={formRef}
                schema={jsonSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
                onSubmit={handleSaveArrange}
              />
            </div>
            <div className={styles.formSectionRight}>
              <Form
                schema={jsondataRead}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.addButton} onClick={handleExternalSubmit}>Thêm</button>
          <button className={styles.saveButton} onClick={handleSaveArrange}>Lưu</button>
          <button className={styles.deleteButton} onClick={handleDropArrange}>Xóa</button>
          <button className={styles.exitButton} onClick={() => console.log('Exit clicked')}>Thoát</button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EmployeeSchedule;
