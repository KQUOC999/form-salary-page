import React, { useState, useEffect, useCallback } from 'react';
import * as Realm from 'realm-web';
import { ToastContainer } from 'react-toastify';
import styles from './styles.module.css'; // Import CSS Module
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const AbsentEmployee = () => {
  const [mainDataFromEmployeeSchedule, setMainDataFromEmployeeSchedule] = useState(null);
  const [mainDataFromMQTTServer, setMainDataFromMQTTServer] = useState(null);
  const [mainData, setMainData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch JSON schema and data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
          const functionName1 = "call_dataRecied_employeeSchedule_forDataTableLeavePolicy";
          const response1 = await user?.callFunction(functionName1);
          console.log(response1[0] || []);
          setMainDataFromEmployeeSchedule(response1[0]);

          const functionName2 = "callDataRecieved_fromMQTTServer";
          const response2 = await user?.callFunction(functionName2);
          console.log(response2);
          setMainDataFromMQTTServer(response2 || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const processDataUpdateButton = useCallback (() => {
    //const dataMQTTFingerId = mainDataFromMQTTServer ? mainDataFromMQTTServer.map(item => item.fingerId) : [];
    const data = mainDataFromEmployeeSchedule ? mainDataFromEmployeeSchedule.map(item => {return item}) : [];
    setMainData(data);
    return data;
  }, [mainDataFromEmployeeSchedule])

  //Bảng 1
  const columnDefs1 = [
    { headerName: 'Mã NV', field: 'maNV', editable: true, width: 150 },
    { headerName: 'Tên NV', field: 'tenNV', editable: true, width: 150 },
    { headerName: 'Kí hiệu', field: 'kiHieu', editable: true, width: 150 },
    { headerName: 'Phòng Ban', field: 'phongBan', editable: true, width: 150 },
    { headerName: 'Chức vụ', field: 'chucVu', editable: true, width: 150 },
    { headerName: 'Công việc', field: 'congViec', editable: true, width: 150 },
    { headerName: 'Khu vực', field: 'khuVuc', editable: true, width: 150 }
  ];
  const rowData1 = mainData ? mainData.map( item => ({
    maNV: item.employeeId,
    tenNV: item.employeeName,
    kiHieu: mainDataFromMQTTServer ? mainDataFromMQTTServer
      .filter(items => selectedDate.includes(items.date))
      .filter(items => {const fingerId = item.fingerprintCount
        return fingerId === items.fingerId
      })
      .map(element => {
        return 'Đ'
    }).join('Đ') || 'V' : [],

    phongBan: item.department,
    chucVu: item.role,
    congViec: '', //wait
    khuVuc: '', //wait
  })) : [];

  //Bảng 2
  const columnDefs2 = [
    { headerName: 'Phòng Ban', field: 'phongBan', editable: true, width: 150 },
    { headerName: 'Khu vực', field: 'khuVuc', editable: true, width: 150 },
    { headerName: 'SS', field: 'SS', editable: true, width: 150 },
    { headerName: 'Vắng', field: 'V', editable: true, width: 150 },
  ];
  // Dữ liệu của bảng
  const rowData2 = [
    1,
    2
    //wait
  ];

  // Render loading state if jsonSchema is not available
  if (!mainDataFromEmployeeSchedule || !mainDataFromMQTTServer) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerChildrent}>
        <div className={styles.headerSection}>
          <div className={styles.datePicker}>
            <label className={styles.labelText} htmlFor="datePicker">Ngày xem:  </label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className={styles.buttonGroupHeader}>
            <button className={styles.exitButton} onClick={processDataUpdateButton}>Cập nhật</button>
            <button className={styles.exitButton} onClick={() => console.log('Exit clicked')}>Xuất nhân viên vắng</button>
          </div>
        </div>
        
        <div className={styles.midlleSection}>
          <div className={styles.tableLeft}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs1}
                rowData={rowData1}
                rowSelection="single"
                domLayout='autoHeight'
              />
            </div>
          </div>      
          <div className={styles.tableRight}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs2}
                rowData={rowData2}
                rowSelection="single"
                domLayout='autoHeight'
              />
            </div>
          </div>
        </div>

        <div className={styles.footerSection}>
          <div className={styles.formContainer}>
            <form className={styles.elementForm}>
              <div className={styles.elementFormFilter}>
                <div className={styles.searchLable}>
                  <label className={styles.labelText} htmlFor="search"></label>
                  <input
                    type="search"
                    id="search"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className={styles.checkBox}>
                  <input
                    type="checkbox"
                    id="checkBox"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <label className={styles.labelText} htmlFor="checkBox">Chỉ người vắng</label>
                </div>
                <div className={styles.filterButton}>
                  <button className={styles.filterButton}>Lọc</button>
                </div>
              </div>
            </form>
          </div>
          
          <div className={styles.buttonContainer}>
            <div className={styles.buttonGroup}>
              <button className={styles.seeAll}>Xem tất cả</button>
              <button className={styles.exportExcell}>Xuất Excell</button>
            </div>
          </div>
        </div>

        <div className={styles.announcementBottomPage}>
          <p>Tổng nhân viên là number, nhân viên vắng: number</p>
        </div>

      </div>
      <ToastContainer />
    </div>
  );
};

export default AbsentEmployee;
