import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import Spreadsheet from 'react-spreadsheet';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema';
import ShiftModal from './shiftModal'; // Import ShiftModal component
import { toast, ToastContainer } from 'react-toastify';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const Schedule = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [saveData, setSaveData] = useState([]);
  const [callFormData, setCallFormData] = useState([]);
  const [callTableData, setCallTableFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [spreadsheetDataRefresh, setSpreadsheetDataRefresh] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        const functionName = "calendar";
        const response = await user.functions[functionName]();
        const jsonSchema = response?.[0]?.public?.input?.jsonSchema;
        setJsonSchema(jsonSchema);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const createSpreadsheetData = () => {
      const numRows = 31;
      const numCols = 20;
      const newData = Array.from({ length: numRows }, (_, rowIndex) =>
        Array.from({ length: numCols }, (_, colIndex) => ({
          value: colIndex === 0 ? `Ngày ${rowIndex + 1}` : ""
        }))
      );
      setSpreadsheetData(newData);
      setSpreadsheetDataRefresh(newData);
    };

    createSpreadsheetData();
  }, []);

  const handleConfirm = useCallback(({ selectedShifts, selectedDays }) => {
    const updatedData = spreadsheetData.map((row, rowIndex) => {
      const dayNumber = rowIndex + 1;
      if (selectedDays.includes(dayNumber)) {
        const shift1 = selectedShifts[0] || "";
        const shift2 = selectedShifts[1] || "";
        return row.map((cell, cellIndex) =>
          cellIndex === 1 ? { value: shift1 } : cellIndex === 2 ? { value: shift2 } : cell
        );
      }
      return row;
    });

    setSpreadsheetData(updatedData);
    setIsModalOpen(false);
  }, [spreadsheetData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelect = useCallback((index) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setCurrentData(null);
      setSpreadsheetData(spreadsheetDataRefresh);
      return;
    }
    setSelectedIndex(index);
    setCurrentData(callFormData[index]);
    setSpreadsheetData(callTableData[index]);
  }, [callFormData, callTableData, spreadsheetDataRefresh, selectedIndex]);

  const handleFormChange = useCallback(({ formData }) => {
    setCurrentData(formData);
  }, []);

  const handleTableExcelChange = useCallback((newData) => {
    setSpreadsheetData(newData);
    setSpreadsheetDataRefresh(newData);
  }, []);

  const handleAdd = useCallback(() => {
    setFormData([...formData, currentData]);
    setSelectedIndex(null);
    setCurrentData({});
    setSpreadsheetData(spreadsheetDataRefresh);
  }, [currentData, formData, spreadsheetDataRefresh]);

  const handleDataTable = useCallback(async () => {
    try {
      const functionName = 'call_dataRecied_schedule';
      const response = await app.currentUser.callFunction(functionName);
      const formData = response.map(data => data.jsonData);
      const tableData = response.map(data => data.spreadsheetData);

      if (Array.isArray(response)) {
        setSaveData(response);
        setCallFormData(formData);
        setCallTableFormData(tableData);
      } else {
        setSaveData(prevData => [...prevData, response]);
        setCallFormData(prevData => [...prevData, formData]);
        setCallTableFormData(prevData => [...prevData, tableData]);
      }
    } catch (error) {
      console.error("Error calling data table:", error);
    }
  }, []);

  useEffect(() => {
    handleDataTable();
  }, [handleDataTable]);

  const createEnumsSchedule = useCallback ( async () => {
    try {
      const functionName = 'createEnums_employeeSchedule_fromTimeKeepingMethod';
      const response = app?.currentUser?.callFunction(functionName);
      return response
    } catch (error) {
      console.log(error.error)
    }
  }, [])

  const saveDataAsJson = useCallback(async () => {
    const dataSend = {
      jsonData: currentData,
      spreadsheetData
    };
    try {
      const functionName = 'dataRecied_schedule';
      let checkCalendar = currentData.scheduleList;
      const response = await app?.currentUser?.callFunction(functionName, dataSend, checkCalendar);
      toast.success('Lưu thông tin thành công!');
      
      await handleDataTable();
      await createEnumsSchedule();

      return response;
    } catch (error) {
      console.error("Error saving data as JSON:", error);
    }
  }, [currentData, handleDataTable, createEnumsSchedule, spreadsheetData]);

  const handleDelete = useCallback( async () => {
    try {
      const functionName = 'delete_dataRecied_schedule';
      console.log(currentData)
      if (selectedIndex !== null && currentData) {
        const checkDataDelete = currentData?.scheduleList;
        const response = await app.currentUser.callFunction(functionName, checkDataDelete);
        
        await handleDataTable();
        await createEnumsSchedule();

        return response
      }
      else if (selectedIndex === null) {
        toast.error('Vui lòng chọn dữ liệu cần xóa!')
      }
    } catch (error) {
      toast.error(`${error.error}`)
    }
  }, [handleDataTable, createEnumsSchedule, selectedIndex, currentData]);

  const handleExit = useCallback(() => {
    console.log("Thoát");
  }, []);

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    setSelectedIndex(null);
    setSelectedCell({ rowIndex, colIndex });
  }, []);

  const handleChooseShiftAll = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleChooseShift = useCallback(() => {
    // Logic for choosing individual shifts
  }, []);

  const handleDeleteShiftAll = useCallback(() => {
    const refreshData = spreadsheetData.map((row) =>
      row.map((cell, cellIndex) =>
        cellIndex === 1 || cellIndex >= 2 ? { value: "" } : cell
      )
    );
    setSpreadsheetData(refreshData);
  }, [spreadsheetData]);

  const handleDeleteShift = useCallback(() => {
    if (selectedCell && selectedCell.rowIndex !== null && selectedCell.colIndex !== null) {
      const { rowIndex, colIndex } = selectedCell;
      const updatedData = spreadsheetData.map((row, rIndex) =>
        rIndex === rowIndex ? row.map((cell, cIndex) =>
          cIndex === colIndex ? { value: "" } : cell
        ) : row
      );
      setSpreadsheetData(updatedData);
      setSelectedCell({ rowIndex: null, colIndex: null });
    }
  }, [selectedCell, spreadsheetData]);
  

  const handleExternalSubmit = useCallback(() => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }, [formRef]);

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
              {saveData.map((data, index) => (
                <tr
                  key={index}
                  onClick={() => handleSelect(index)}
                  style={{ backgroundColor: selectedIndex === index ? '#007bff' : 'transparent' }}
                >
                  <td>{data.jsonData.scheduleList}</td>
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
              <ToastContainer/>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.containerTableBelow}>
        <div className={styles.containerChildres}>
          <Spreadsheet
            data={spreadsheetData}
            onSelect={handleCellClick}
            onChange={handleTableExcelChange}
          />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={handleChooseShiftAll}>Chọn ca tất cả</button>
        <button onClick={handleChooseShift}>Chọn ca</button>
        <button onClick={handleDeleteShiftAll}>Xóa ca tất cả</button>
        <button onClick={handleDeleteShift}>Xóa ca</button>
      </div>

      <ShiftModal isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} />
    </div>
  );
};

export default Schedule;
