import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Realm from 'realm-web';
import CompanyStructure from '../structureCompany.module/companyStructure';
import { useAppContext } from '../structureCompany.module/appContext.module';
import { ToastContainer, toast } from 'react-toastify';
import styles from './styles.module.css'; // Import CSS Module
import { useDebounce } from 'use-debounce'; // Thêm debounce package
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const PolicyLeaving = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentdata, setCurrentData] = useState({});
  const [, setSelectedIndex] = useState(null);
  const { selectedNode, parentNode } = useAppContext();
  const [serverData, setServerData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newDataPolicyLeaving, setNewDataPolicyLeaving] = useState({
    dates: [],
    description: "",
    typeDay: ""
  });
  //const [belowDataTablePolicyLeaving, setBelowDataTablePolicyLeaving] = useState([]);
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
        
        setJsonSchema(jsonSchema);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect( () => {
    const fetchData = async () => {
    const policyLeavingData = await app?.currentUser?.callFunction("call_dataRecied_employeeSchedule_forDataTableLeavePolicy");
    const filterPolicyLeavingData = policyLeavingData[0]
    .filter(item => currentdata?.department?.includes(item.department) &&
                    currentdata?.employeeName?.includes(item.employeeName) &&
                    currentdata?.employeeId?.includes(item.employeeId)
                  )
    .map(element => element.dataFromRightContainer) || [];
 
    const data = [];
    const typeDay = [];
    const day = filterPolicyLeavingData[0]?.days?.filter(element => element.checked === true).map(e => e.day) || [];
    const formattedDay = day.filter(d => {
      const newDay = []
      if (d < 10) {
        newDay.push(...`${0}${d}`)
      }
      else {
        newDay.push(...`d`)
      }
      return newDay
    })
    const monthYear = filterPolicyLeavingData[0]?.monthYear || [];
    const formattedDates =  formattedDay.map(d => `${monthYear}-${d}`);
    const description = filterPolicyLeavingData[0]?.selectedEnum || [];
    const type = filterPolicyLeavingData[0]?.type || [];

    if (selectedRows.length > 0 && filterPolicyLeavingData.length > 0 && filterPolicyLeavingData[0] !== undefined) {
      if (type === true) {
        typeDay.push('0.5');
      }
      else typeDay.push('1');
    }
    if (selectedRows.length === 0) {
        typeDay.push([]);
    }
    data.push(...formattedDates);

    const newDataPolicyLeaving = {
      dates: formattedDates,
      description: description,
      typeDay: typeDay[0] || []
    }

    //console.log(newDataPolicyLeaving)
    setNewDataPolicyLeaving(newDataPolicyLeaving);
    };
    fetchData();
  }, [currentdata, selectedRows])

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
      const response = await app?.currentUser?.callFunction(functionName, selectedLableDepartment, parentNodes);
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

  // Create items for containerRight
  const [monthYear, setMonthYear]                           = useState('');
  const [type, setType]                                     = useState(false);
  const [selectedEnum, setSelectedEnum]                     = useState('');
  const [days, setDays]                                     = useState([]);
  const [dataFromRightContainer, setDataFromRightContainer] = useState([]);

  const enums = [
      "P2-Nửa ngày nghỉ có phép", 
      "P-Nghỉ có phép",
      "CĐ1-Nghỉ theo CĐ BHXH",
      "FL-Nghỉ theo quy định công ty",
      "ML-Nghỉ không phép",
      "NPL-Nghỉ việc riêng có lương",
      "B-Nghỉ bệnh",
      "HN-Hôn nhân"
  ];

  useEffect(() => {
    if (monthYear) {
      const [year, month] = monthYear.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysArray = Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          checked: false
      }));
      setDays(daysArray);
    }
  }, [monthYear]);
  
  const handleDayChange = (index) => {
    setDays(days.map((day, i) =>
        i === index ? { ...day, checked: !day.checked } : day
    ));
  };
  
  const handleSaveDataFromRightContainer = useCallback (() => {
    const dataFromRightContainer = {
        monthYear,
        type,
        selectedEnum,
        days
    };
    setDataFromRightContainer(dataFromRightContainer);
  }, [days, monthYear, selectedEnum, type]);

  useEffect (() => {
    handleSaveDataFromRightContainer();
  }, [handleSaveDataFromRightContainer])

  // Handle saving and arranging data
  const handleSaveArrange = useCallback (async () => {
    if (formData.length === 0) {
      toast.error('Bạn chưa chọn dữ liệu trong bảng!');
      return;
    }
    try {
      const functionName = 'dataRecied_employeeSchedule_byPolicyLeaving';
      const dataRecieved = formData.map(data => ({
        ...data,
        dataFromRightContainer
      }));
      const departmentsChecked = formData.map(data => data.department);
      const response = await app?.currentUser?.callFunction(functionName, dataRecieved, departmentsChecked);
      toast.success('Dữ liệu đã được lưu!');
      return response;
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [dataFromRightContainer, formData]);
  
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

//Create AgGrid Table
  const columnDefs = [
    { headerName: 'Ngày', field: 'Ngay', editable: true },
    { headerName: 'Mô tả', field: 'MoTa', editable: true  },
    { headerName: 'Dạng ngày', field: 'DangNgay', editable: true  }
  ];

  const rowData = newDataPolicyLeaving.dates.map(date => ({
    Ngay: date,
    MoTa: newDataPolicyLeaving.description,
    DangNgay: newDataPolicyLeaving.typeDay
  }));

  // Render loading state if jsonSchema is not available
  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerLeft}>
        <CompanyStructure user={app.currentUser} />
      </div>
      <div className={styles.containerMidle}>
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
            ...
          </div>
          <div className={styles.scheduleList}>
            <div className={styles.scheduleListcontainer}>
              <div className="ag-theme-alpine" style={{ height: 400}}>
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  domLayout='autoHeight'
                />
              </div>
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

      <div className={styles.containerRight}>
        <form>
          <div className={styles.chooseMonth}>
            <label className={styles.labelText} htmlFor="monthYear">Chọn tháng theo năm:</label><br></br>
            <input
              type="month"
              id="monthYear"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
            />
          </div>
          <div className={styles.chooseType}>
            <label className={styles.labelText} htmlFor="type">Loại:</label>
            <input
              type="checkbox"
              id="halfDay"
              checked={type}
              onChange={(e) => setType(e.target.checked)}
            />
            <label className={styles.labelText} htmlFor="halfDay">Nửa ngày</label>
          </div>
          <div className={styles.chooseList}>
            <label className={styles.labelText} htmlFor="enums">Danh sách loại:</label><br></br>
            <select
              id="enums"
              value={selectedEnum}
              onChange={(e) => setSelectedEnum(e.target.value)}
            >
              {enums.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.listDayContainer}>
            <label className={styles.labelText}>Chọn ngày:</label>
            <div className={styles.listDay}>
                {days.map((day, index) => (
                  <div key={index} className={styles.listDayCheckbox}>
                    <input
                      type="checkbox"
                      id={`day-${day.day}`}
                      checked={day.checked}
                      onChange={() => handleDayChange(index)}
                    />
                    <label className={styles.labelText} htmlFor={`day-${day.day}`}>{day.day}</label>
                  </div>
                ))}
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PolicyLeaving;
