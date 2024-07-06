import React, { useState, useEffect, useRef, useCallback } from 'react';
import Form from "@rjsf/core";
import * as Realm from 'realm-web';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import CompanyStructure from '../structureCompany.module/companyStructure';
import { useAppContext } from '../structureCompany.module/appContext.module';
import { ToastContainer, toast } from 'react-toastify';
import uiSchema from './uiSchema';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const ManagerEmployee = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]); // Initialize formData as an array
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { selectedNode, dataByType, dataTreeCompany, parentNode, childNodes } = useAppContext();
  const [data, setDataTreeCompany] = useState([])
  const [departmentValue, setDepartmentValue] = useState({});
  const [serverData, setServerData] = useState([]);
  const [employee, setEmployees] = useState([]);

  const formRef = useRef(null); // Ref cho form

  useEffect( () => {
    console.log('parentNode:', parentNode)
    console.log('childNodes:', childNodes)
  }, [parentNode, childNodes])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
      
        const functionName = "manager_employeeJsonSchema";
        const response = await user.functions[functionName]();
        const jsonSchema = response[0]?.public?.input?.jsonSchema;

        setJsonSchema(jsonSchema);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Cập nhật currentData khi selectedNode thay đổi
    if (selectedNode) {
      for (let i = 0; i < departmentValue.length; i++) {
        if (selectedNode.lable === departmentValue[i]) {
          setCurrentData(prevData => ({
            ...prevData,
            department: selectedNode.lable
          }));
          console.log('nodeid:', selectedNode)
          return;
        } else {
          setCurrentData(prevData => ({
            ...prevData,
            department: ''
          }));
        } 
      }
    } else {
      setCurrentData(prevData => ({
        ...prevData,
        department: ''
      }));
    }

    if (dataTreeCompany !== null){
      setDataTreeCompany(dataTreeCompany)
      console.log('data:', data);
    }

  }, [selectedNode, dataByType, departmentValue, dataTreeCompany, data]);

  

  const handleFormChange = ({ formData }) => {
    setCurrentData(formData);
  };

  const handleSelect = (index) => {
    if (selectedIndex === index) {
      // Nếu bấm vào cùng một ô hai lần, bỏ chọn ô đó
      setSelectedIndex(null);
      setCurrentData({});
    } else {
      // Nếu bấm vào ô khác, chọn ô đó
      setSelectedIndex(index);
      setCurrentData(serverData[index]);
      
    }
  };

const handleAdd = () => {
  const newFormData = [...serverData, {}]; // Thêm một đối tượng trống vào cuối mảng serverData
  setServerData(newFormData); // Cập nhật serverData
  setCurrentData({}); // Đặt currentData thành đối tượng trống
  console.log("newData", newFormData); // Log dữ liệu mới

  if (formRef.current) {
    formRef.current.reset(); // Reset form nếu cần thiết
  }
};

/*
  const handleAdd = () => {
    let newData;
    if (selectedIndex !== null && serverData[selectedIndex]) {
      // Nếu có dòng được chọn và dữ liệu hợp lệ
      newData = [...serverData]; // Sao chép mảng serverData
      newData.splice(selectedIndex + 1, 0, { ...serverData[selectedIndex] }); // Thêm bản sao của dữ liệu vào vị trí tiếp theo
    } else {
      // Nếu không có dòng nào được chọn, chỉ thêm một đối tượng trống vào cuối mảng
      newData = [...serverData, {}];
    }
    
    setServerData(newData); // Cập nhật serverData mới
    setCurrentData({}); // Đặt currentData thành đối tượng trống
    setSelectedIndex(selectedIndex !== null ? selectedIndex + 1 : newData.length - 1); // Chọn hàng mới thêm

    if (formRef.current) {
      formRef.current.reset(); // Reset form nếu cần thiết
    }
  };

*/

  const handleSave = async () => {
    // Kiểm tra nếu trường department đã có giá trị thì mới lưu
    if (currentData.department) {
      if (selectedIndex !== null) {
        const newData = [...formData];
        newData[selectedIndex] = currentData;
        setFormData(newData);
      } else {
        setFormData(prevData => [...prevData, currentData, {}]);
      }
      setCurrentData({});
      setSelectedIndex(null);

      encodeData();
      await saveDataToServer();
      toast.success('Lưu thông tin thành công!');
    } else {
      toast.error('Vui lòng điền thông tin phòng ban!');
    }
  };

  const saveDataToServer = async () => {
    const functionName = "dataRecied_employee";
    const dataToServer = {
      currentData,
      parentNode
    }
    let employeeId = dataToServer?.currentData?.employeeId;
    try {
      const response = await app.currentUser.callFunction(functionName, dataToServer, employeeId);
      return response

    } catch (error) {
      toast.error('Gửi thông tin về server thất bại!');
    }
  };

  const encodeData = useCallback(() => {
    const departmentNames = dataByType?.companyDepartment?.[0]?.data_departmentName 
      ? Object.keys(dataByType.companyDepartment[0].data_departmentName).reduce((acc, key) => {
        const enumValues = dataByType.companyDepartment[0].data_departmentName[key]?.enum;
        if (enumValues) {
            acc.push(...enumValues);
        }
          return acc;
        }, [])
      : [];

      setDepartmentValue(departmentNames);
  
  }, [dataByType]);

  useEffect(() => {
    encodeData();
  }, [encodeData]);

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

  const handleDelete = () => {
    if (selectedIndex !== null) {
      const newData = serverData.filter((_, i) => i !== selectedIndex); // Lọc bỏ dòng được chọn
      setServerData(newData);
      setCurrentData({}); 
      setSelectedIndex(null); 
    }
  };


  const handleChangeEmployee = (index) => {
    //function
  };
// hàm tìm kiếm thư mục tải lên
  const handleImportExcel = () => {
    document.getElementById('fileInput').click();
  };
// hàm tải file lên  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return; // If no file is selected, do nothing
    }
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
  
      setEmployees(json);
     // setServerData(employee)
      console.log('employees:', json);

      if (Array.isArray(json)) {
        setServerData(prevData => [...prevData, ...json]); // Nối mảng response vào serverData
      } else {
        setServerData(prevData => [...prevData, json]); // Thêm đối tượng response vào serverData
      }
      setCurrentData(json[0] || {});
      console.log('employees:', employee);
    };
  
    reader.readAsArrayBuffer(file);
  };

  
  const handleExportUSB = (index) => {
    //function
  };

  const handleExternalSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
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
        <div className={styles.flexContainer}>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleAdd}>Thêm mới</button>
            <button className={styles.button} onClick={handleExternalSubmit}>Lưu</button>
            <ToastContainer />
            <button className={styles.button} onClick={handleDelete}>Xóa</button>
            <button className={styles.button} onClick={handleChangeEmployee}>Chuyển nhân viên</button>
            <button className={styles.button} onClick={handleImportExcel}>Nhập từ Excel</button>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
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
                {Array.isArray(serverData) && serverData.map((employee, index) => (
                  <tr
                    key={index}
                    className={selectedIndex === index ? styles.selected : ''}
                    onClick={() => handleSelect(index)}
                  >
                    <td>{employee.employeeId || employee['Mã NV']}</td>
                    <td>{employee.employeeName || employee['Tên nhân viên']}</td>
                    <td>{employee.timekeepingId || employee['Mã CC']}</td>
                    <td>{employee.timekeepingName || employee['Tên CC']}</td>
                    <td>{employee.joinDate|| employee['Ngày vào làm']}</td>
                    <td>{employee.cardId|| employee['Mã thẻ']}</td>
                    <td>{employee.birthDate|| employee['Ngày sinh']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.formSection}>
            <Form
              ref={formRef}
              schema={jsonSchema}
              formData={currentData}
              uiSchema={uiSchema}
              onChange={handleFormChange}
              validator={validator}
              onSubmit={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerEmployee;
