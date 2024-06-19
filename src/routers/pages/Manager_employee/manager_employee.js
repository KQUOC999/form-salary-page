import React, { useState, useEffect } from 'react';
import Form from "@rjsf/core";
import * as Realm from 'realm-web';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from '../Schedule/uiSchema';;


const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const ManagerEmployee = () => {
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
        const functionName = "manager_employeeJsonSchema";
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

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setCurrentData(formData[index]);
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

  const handleChangeEmployee = (index) => {
    //function
  };

  const handleImportExcel = (index) => {
    //function
  };

  const handleExportUSB = (index) => {
    //function
  };


  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerLeft}>
        <div>company</div>
      </div>
      <div className={styles.containerRight}>
        <div className={styles.flexContainer}>
        <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleAdd}>Thêm mới</button>
            <button className={styles.button} onClick={handleSave}>Lưu</button>
            <button className={styles.button} onClick={handleDelete}>Xóa</button>
            <button className={styles.button} onClick={handleChangeEmployee}>Chuyển nhân viên</button>
            <button className={styles.button} onClick={handleImportExcel}>Nhập từ Excel</button>
            <button className={styles.button} onClick={handleExportUSB}>Xuất USB</button>
        </div>
            <div className={styles.scheduleList}>
            <table className={styles.scheduleTable}>
                <thead>
                <tr>
                    <th>Mã NV</th>
                    <th>Tên nhân viên</th>
                    <th>Mã CC</th>
                    <th>Tên CC</th>
                    <th>Ngày vào làm</th>
                    <th>Mã thẻ</th>
                    <th>Ngày sinh</th>
                </tr>
                </thead>
                <tbody>
                {formData.map((employee, index) => (
                    <tr
                    key={index}
                    className={selectedIndex === index ? styles.selected : ''}
                    onClick={() => handleSelect(index)}
                    >
                    <td>{employee.employeeId}</td>
                    <td>{employee.employeeName}</td>
                    <td>{employee.timekeepingId}</td>
                    <td>{employee.timekeepingName}</td>
                    <td>{employee.joinDate}</td>
                    <td>{employee.cardId}</td>
                    <td>{employee.birthDate}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            <div className={styles.formSection}>
            <Form
                schema={jsonSchema}
                uiSchema={uiSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
            />
            </div>
            </div>
        </div>
      </div>
  );
};

export default ManagerEmployee;
