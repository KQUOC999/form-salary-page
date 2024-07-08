import React, { useState, useEffect, useCallback} from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import CompanyStructure from '../structureCompany.module/companyStructure';
import { useAppContext } from '../structureCompany.module/appContext.module';
import { ToastContainer, toast } from 'react-toastify';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const EmployeeSchedule = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [jsondataRead, setJsonDataRead] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { selectedNode, parentNode} = useAppContext();
  const [serverData, setServerData] = useState([]);

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
        console.log("response:", response);
   
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const callDataBySelectedLable = useCallback (async() => {
    const functionName = "callDataForm_bySelectedLable";
    let selectedLableDepartment = selectedNode.lable;
    let parentNodes = parentNode?.parentNode?.label

    if (!parentNodes){
      return // Nếu parentNodes là null hoặc undefined, không thực hiện gọi API và kết thúc hàm
    }
    try {
        const response = await app.currentUser.callFunction(functionName, selectedLableDepartment, parentNodes);
        toast.success('Gọi dữ liệu từ Server lên thành công!');
        // Cập nhật serverData dựa vào kiểu dữ liệu của response
        if (Array.isArray(response)) {
          setServerData(prevData => [...prevData, ...response]); // Nối mảng response vào serverData
        } else {
          setServerData(prevData => [...prevData, response]); // Thêm đối tượng response vào serverData
        }
        setCurrentData(response[0] || {}); // Giả sử bạn muốn hiển thị dữ liệu của phần tử đầu tiên trong form

        return response

    } catch (error) {
      return error.error
    }
  }, [selectedNode, parentNode])

  useEffect( () => {
    if (selectedNode) {
      callDataBySelectedLable(selectedNode);
    }
  }, [callDataBySelectedLable, selectedNode])

  const handleFormChange = (event) => {
    setCurrentData(event.formData);
  };

  const handleSelect = useCallback((index) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setCurrentData(null);
      return;
    }
    setSelectedIndex(index);
    setCurrentData(serverData[index]);
  }, [selectedIndex, serverData]);
  
  const handleSaveArrange = () => {
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

  const handleDropArrange = () => {
    if (selectedIndex !== null) {
      const newData = formData.filter((_, i) => i !== selectedIndex);
      setFormData(newData);
      setCurrentData({});
      setSelectedIndex(null);
    }
  };

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
                  <th>Mã nhân viên</th>
                  <th>Mã chấm công</th>
                  <th>Tên nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(serverData) && serverData.map((employee, index) => (
                  <tr
                    key={index}
                    className={selectedIndex === index ? styles.selected : ''}
                    onClick={() => handleSelect(index)}
                  >
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
                schema={jsonSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
              />
            </div>
            <div className={styles.formSectionRight}>
              <Form
                schema={jsondataRead}
                validator={validator}
                uiSchema={uiSchema}
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleSaveArrange}>Lưu sắp xếp</button>
          <button onClick={handleDropArrange}>Bỏ sắp xếp</button>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default EmployeeSchedule;
