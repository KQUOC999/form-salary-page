import React, { useState, useEffect, useRef, useCallback} from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema'; // Adjust this path according to your project structure
import * as XLSX from 'xlsx'; // Import XLSX library
import { saveAs } from 'file-saver'; // Import file-saver library
import CompanyStructure from '../structureCompany.module/companyStructure'
import { useAppContext } from '../structureCompany.module/appContext.module';
import { ToastContainer, toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react'; // Import AgGridReact
import 'ag-grid-community/styles/ag-grid.css'; // Import ag-Grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Import ag-Grid theme CSS


const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const Reporting = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [rowDefs, setRowDefs] = useState([]);
  const [dataRecieved, setDataRecieved] = useState([]);
  const [newData, setNewData] = useState([]);
  const { selectedNode, parentNode} = useAppContext();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const formRef = useRef(null); // Ref cho form

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;

        const functionName = "reporting_jsonSchema";
        const response = await user.functions[functionName]();
        const schema = response[0]?.public?.input?.jsonSchema;

        setJsonSchema(schema);
        //console.log("response:", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = (event) => {
    setCurrentData(event.formData);
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

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setCurrentData(formData[index]);
  };

  const handleExit = () => {
    console.log("Thoát");
  };

  const getNgayRows = (tuNgay, denNgay) => {
    const startDate = new Date(tuNgay);
    const endDate = new Date(denNgay);
    const dates = [];
  
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1); 
      currentDate = new Date(currentDate); 
    }
  
    return dates;
  };
  
  const getWeekdayRows = (dateString) => {
    const date = new Date(dateString);
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return weekdays[date.getDay()];
  };

  const callDataBySelectedLable = useCallback (async() => {
    const functionName = "callDataReporting_bySelectedLable";
    let selectedLableDepartment = selectedNode.lable;
    //console.log('parentNode:', parentNode)
    let parentNodes = parentNode?.parentNode?.label || '';
    //console.log("parentNodes:", parentNodes);
    //console.log("selectedLableDepartment:", selectedLableDepartment)

    try {
        const response = await app.currentUser.callFunction(functionName, selectedLableDepartment, parentNodes, parentNode);
        toast.success('Gọi dữ liệu từ Server lên thành công!');
        // Cập nhật serverData dựa vào kiểu dữ liệu của response
        //console.log(response)
        setDataRecieved(response);
        //console.log("response:", response)

        const newEnums = response.map(doc => doc.employeeName) || {};
          // Cập nhật currentData với giá trị mới
          setJsonSchema(prevSchema => ({
            ...prevSchema,
            properties: {
              ...prevSchema?.properties || {},
              chonNhanVien: {
                ...prevSchema?.properties?.chonNhanVien || {},
                properties: {
                  ...prevSchema?.properties?.chonNhanVien?.properties || {},
                  tuNV: {
                    ...prevSchema?.properties?.chonNhanVien?.properties?.tuNV || {},
                    enum: newEnums
                  },
                  denNV: {
                    ...prevSchema?.properties?.chonNhanVien?.properties?.denNV || {},
                    enum: newEnums
                  }
                }
              }
            }
          }) || {});
        return response || {}

    } catch (error) {
      return error.error
    }
  }, [selectedNode, parentNode])

  useEffect( () => {
    if (selectedNode) {
      callDataBySelectedLable(selectedNode);
    }
  }, [callDataBySelectedLable, selectedNode])

  const handleCreateData = useCallback(async () => {
    try {
      const functionName = 'call_dataRecied_employeeSchedule';
      const response = await app?.currentUser?.callFunction(functionName);
      const newArrayResponse = response[0].map(item => ({ ...item }));
      //console.log('....', newArrayResponse);
  
      const newData = [];
      newArrayResponse.forEach(item => {
        const department = item.department;
        const employeeId = item.employeeId;
        const checkData = dataRecieved.filter(element => 
          element.department === department && element.employeeId === employeeId
        );
        if (checkData.length > 0) {
          const dataImport1 = {
            ...checkData[0],
            lichTrinhLamViec: item.lichTrinhLamViec || 'Chưa sắp xếp',
            lichTrinhVaoRa: item.lichTrinhVaoRa || 'Chưa sắp xếp'
          };
          newData.push(dataImport1);
        }       
      });
  
      const fetchDataEmployeeSchedule = async (newData) => {
        try {
          const functionName = 'call_dataRecied_schedule';
          const response = await app?.currentUser?.callFunction(functionName);
          const dataImport2 = [];
          
          response.forEach(item => {
            const scheduleList = item?.jsonData?.scheduleList;
            const takeData = newData.filter(element => element.lichTrinhLamViec === scheduleList);
            if (takeData.length > 0) {
              takeData.forEach(i => {
                dataImport2.push({
                  ...i,
                  item
                });
              });
            }
            return dataImport2
          });

          const fetchDataShift = async (dataImport2) => {
            try {
              const functionName = 'call_dataRecied_workShift';
              const response = await app.currentUser.callFunction(functionName);
              
              const dataImport3 = dataImport2.map(items => {
                const checkData = response.filter(element => {
                  const shiftCode = element.shiftCode;
                  return items.item.spreadsheetData.some(row =>
                    row.some(cell => cell.value === shiftCode)
                  );
                });
                const newData = {
                  timmingRecieved: checkData,
                  ...items
                }
                return newData;
              });
              

              const dataImport4 = dataImport3.map(item => { 
                const data = item.item.spreadsheetData;
                const newData = data.map(row => row.filter(cell => cell.value && cell.value.trim() !== '') || []);
          
                const sortSpreadsheetDataByDay = (data) => {
                  return data.sort((a, b) => {
                    const dayA = a && a[0] && a[0].value ? parseInt(a[0].value.replace('Ngày ', '')) || 0 : 0;
                    const dayB = b && b[0] && b[0].value ? parseInt(b[0].value.replace('Ngày ', '')) || 0 : 0;                    
                    return dayA - dayB;
                  });
                };
          
                const sortedSpreadsheetDataByDay = sortSpreadsheetDataByDay(newData);
                return {
                  ...item,
                  dataSortSchedule: sortedSpreadsheetDataByDay
                };
              });

              const dataImport5 = dataImport4.map(items => {
                const shiftCodes = items.timmingRecieved.map(element => {
                  return { shiftCode: element.shiftCode, startTime: element.timeDetails.startTime, 
                           endTime: element.timeDetails.endTime};
                });
                items.dataSortSchedule = items.dataSortSchedule.map(row =>
                  row.map(cell => {
                    const matchedShift = shiftCodes.find(sc => sc.shiftCode === cell.value);
                    if (matchedShift) {
                      return { ...cell, startTimes: matchedShift.startTime, endTime: matchedShift.endTime}; 
                    }
                    return cell;
                  })
                );
                return {
                  ...items
                };
              });
              setNewData(dataImport5);   
              /*                
              console.log("dataImport3:", dataImport3);
              console.log("dataImport2:", dataImport2);
              console.log('response:', response);
              console.log("dataImport4:", dataImport4);
              console.log("dataImport5:", dataImport5);
              */
          
            } catch (error) {
              console.error("Error fetching work shift data:", error);
            }
          };
          
          await fetchDataShift(dataImport2);         
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      };
  
      await fetchDataEmployeeSchedule(newData); // Truyền newData vào hàm fetchAdditionalData
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [dataRecieved]);
  
  useEffect(() => {
    handleCreateData()
  }, [handleCreateData])

  const getShift = (dates, newData) => {
    // Chuyển đổi ngày thành định dạng "Ngày X"
    const getDay = dates.map(date => {
      let dateObj;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = date;
      }
      const dayNumber = dateObj.getDate();
      return `Ngày ${dayNumber}`;
    });
  
    //console.log("....", getDay);
  
    // Cập nhật thông tin ca làm việc cho từng ngày trong newData
    const newDatas = [];
    newData.forEach(items => {
      items.dataSortSchedule = items.dataSortSchedule.map(row =>
        row.map(cell => {
          const matchedShift = getDay.find(e => e === cell.value);
          if (matchedShift) {
            //console.log([row])
            return newDatas.push({getShift: row, ...items}); 
          }
          return 'Khong xac dinh'; 
        })
      );
    });
    //console.log("newData", newDatas)
    return newDatas;
  };

  const callDataRecievedFromMQTTServer = async () => {
    try {
      const functionName = 'callDataRecieved_fromMQTTServer';
      const response = await app?.currentUser?.callFunction(functionName);
      return response;
    } catch (error) {
      console.log(error.error)
    }
  }
  
  const timeEnter = useCallback (async (date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      return response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount)): [];
         
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              return item.time; 
            }
          }
        }

        return [];
      }).join(' - ') || '0';

    } catch (error) {
      console.log(error.message);
    }
  }, [])

  const timeEnterEarly = useCallback (async (dates, date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      const dates = response.map(items => items.date);

      const timeRequires = response.flatMap(item => {
          const checkData = shiftData
          .filter(shift => employee?.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date));
          if (checkData.length > 0) {
            const times = checkData.flatMap(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.startTimes));
            const isMatch = checkData.some(shift => item.fingerId === shift.items.fingerprintCount);
            if (isMatch && item.date.includes(date)) {
              return times.map(item => {
                const time = item.split(':') || 0;
                const hours = parseInt(time[0]) || 0;
                const minutes = parseInt(time[1]) || 0;
                const second = parseInt(time[2]) || 0;
                const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
                return calculatedTimes;
              });
            }
          }
          return [];
      })
   
      const timesEnter = response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date)): [];
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              const timeParts = item.time.split(':') || 0;
              const hours = parseInt(timeParts[0]) || 0;
              const minutes = parseInt(timeParts[1]) || 0;
              const second = parseInt(timeParts[2]) || 0;
              const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
              //console.log(calculatedTimes)
              //console.log(item.time)
              return calculatedTimes; 
            }
          }
        }
        return [];
      });
      
      const timeEnterRequest = shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .filter(shift => shift.items.getShift.some(cell => cell.value === 'Sáng' || cell.value === 'Chiều'))
        .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.allowEarly)) : [];

       return shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .flatMap(shift => {
          const result = timesEnter.flatMap(timeString => {
            return timeRequires.map((timeRequire, index) => {
              const difference = (timeString - timeRequire);
              if (difference < 0 ) {
                return -(difference - timeEnterRequest[index]);
              }
                return '0'
            })
          })
          return result.join(' - ') || '0'
        }).join(' - ') || '0' : '0'

    } catch (error) {
      console.log(error.message);
    }
  }, [])
  
  const timeEnterLately = useCallback (async (date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      const dates = response.map(items => items.date);

      const timeRequires = response.flatMap(item => {
          const checkData = shiftData
          .filter(shift => employee?.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date));
          if (checkData.length > 0) {
            const times = checkData.flatMap(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.startTimes));
            const isMatch = checkData.some(shift => item.fingerId === shift.items.fingerprintCount);
            if (isMatch && item.date.includes(date)) {
              return times.map(item => {
                const time = item.split(':') || 0;
                const hours = parseInt(time[0]) || 0;
                const minutes = parseInt(time[1]) || 0;
                const second = parseInt(time[2]) || 0;
                const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
                return calculatedTimes;
              });
            }
          }
          return [];
      })
      
      const timesEnter = response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date)): [];
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              const timeParts = item.time.split(':') || 0;
              const hours = parseInt(timeParts[0]) || 0;
              const minutes = parseInt(timeParts[1]) || 0;
              const second = parseInt(timeParts[2]) || 0;
              const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
              //console.log(calculatedTimes)
              //console.log(item.time)
              return calculatedTimes; 
            }
          }
        }
        return [];
      });
    
      const timeEnterRequest = shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .filter(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều'))
        .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.allowLate)) : [];
        return shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .flatMap(shift => {
          const result = timesEnter.flatMap(timeString => {
            return timeRequires.map((timeRequire, index) => {
              const difference = (timeString - timeRequire);
              if (difference > 0 ) {
                return (difference - timeEnterRequest[index]);
              }
                return '0'
            })
          })
          return result.join(' - ') || '0'
        }).join(' - ') || '0' : '0'

    } catch (error) {
      console.log(error.message);
    }
  }, [])

  const timeOut = useCallback (async (date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      return response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount)): [];
         
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              return item.time; 
            }
          }
        }

        return [];
      }).join(' - ') || '0';

    } catch (error) {
      console.log(error.message);
    }
  }, [])

  const timeOutEarly = useCallback (async (date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      const dates = response.map(items => items.date);

      const timeRequires = response.flatMap(item => {
          const checkData = shiftData
          .filter(shift => employee?.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date));
          if (checkData.length > 0) {
            const times = checkData.flatMap(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.endTime));
            const isMatch = checkData.some(shift => item.fingerId === shift.items.fingerprintCount);
            if (isMatch && item.date.includes(date)) {
              return times.map(item => {
                const time = item.split(':') || 0;
                const hours = parseInt(time[0]) || 0;
                const minutes = parseInt(time[1]) || 0;
                const second = parseInt(time[2]) || 0;
                const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
                return calculatedTimes;
              });
            }
          }
          return [];
      })
   
      const timesEnter = response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date)): [];
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              const timeParts = item.time.split(':') || 0;
              const hours = parseInt(timeParts[0]) || 0;
              const minutes = parseInt(timeParts[1]) || 0;
              const second = parseInt(timeParts[2]) || 0;
              const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
              //console.log(calculatedTimes)
              //console.log(item.time)
              return calculatedTimes; 
            }
          }
        }
        return [];
      });
      
      const timeEnterRequest = shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .filter(shift => shift.items.getShift.some(cell => cell.value === 'Sáng' || cell.value === 'Chiều'))
        .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.allowEarly)) : [];

       return shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .flatMap(shift => {
          const result = timesEnter.flatMap(timeString => {
            return timeRequires.map((timeRequire, index) => {
              const difference = (timeString - timeRequire);
              if (difference < 0 ) {
                return -(difference - timeEnterRequest[index]);
              }
                return '0'
            })
          })
          return result.join(' - ') || '0'
        }).join(' - ') || '0' : '0'

    } catch (error) {
      console.log(error.message);
    }
  }, [])
  
  const timeOutLately = useCallback (async (date, shiftData, employee) => {
    try {
      const response = await callDataRecievedFromMQTTServer();
      const fingerIds = response.map(items => items.fingerId);
      const dates = response.map(items => items.date);

      const timeRequires = response.flatMap(item => {
          const checkData = shiftData
          .filter(shift => employee?.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date));
          if (checkData.length > 0) {
            const times = checkData.flatMap(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.endTime));
            const isMatch = checkData.some(shift => item.fingerId === shift.items.fingerprintCount);
            if (isMatch && item.date.includes(date)) {
              return times.map(item => {
                const time = item.split(':') || 0;
                const hours = parseInt(time[0]) || 0;
                const minutes = parseInt(time[1]) || 0;
                const second = parseInt(time[2]) || 0;
                const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
                return calculatedTimes;
              });
            }
          }
          return [];
      })
      
      const timesEnter = response.flatMap(item => {
        const matchingShifts = shiftData.length > 0 ? shiftData
          .filter(shift => employee.employeeId.includes(shift.items.employeeId))
          .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
          .filter(shift => dates.some(element => element === date)): [];
        if (matchingShifts.length > 0) {
          const isMatch = matchingShifts.some(shift => item.fingerId === shift.items.fingerprintCount);
          if (isMatch) {
            if (item.time != null && item.date.includes(date)) {
              const timeParts = item.time.split(':') || 0;
              const hours = parseInt(timeParts[0]) || 0;
              const minutes = parseInt(timeParts[1]) || 0;
              const second = parseInt(timeParts[2]) || 0;
              const calculatedTimes = hours * 60 + minutes + second/60 || 0; //Quy đổi thời gian thành phút
              //console.log(calculatedTimes)
              //console.log(item.time)
              return calculatedTimes; 
            }
          }
        }
        return [];
      });
      
      const timeEnterRequest = shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .filter(shift => shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều'))
        .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.allowLate)) : [];
        return shiftData.length > 0 ? shiftData
        .filter(shift => employee.employeeId.includes(shift.items.employeeId))
        .filter(shift => fingerIds.includes(shift.items.fingerprintCount))
        .flatMap(shift => {
          const result = timesEnter.flatMap(timeString => {
            return timeRequires.map((timeRequire, index) => {
              const difference = (timeString - timeRequire);
              if (difference > 0 ) {
                return (difference - timeEnterRequest[index]);
              }
                return '0'
            })
          })
          return result.join(' - ') || '0'
        }).join(' - ') || '0' : '0'

    } catch (error) {
      console.log(error.message);
    }
  }, [])

  const arrangeSelected = useCallback((employees, selection) => {
    // Tìm chỉ số của tuNV và denNV trong danh sách
    const startIndex = employees.findIndex(emp => emp.employeeName === selection.tuNV);
    const endIndex = employees.findIndex(emp => emp.employeeName === selection.denNV);
  
    if (startIndex === -1) {
      console.log(`Lỗi: Không tìm thấy nhân viên với tên ${selection.tuNV}`);
      return [];
    }
    if (endIndex === -1) {
      console.log(`Lỗi: Không tìm thấy nhân viên với tên ${selection.denNV}`);
      return [];
    }
  
    const adjustedStartIndex = Math.min(startIndex, endIndex);
    const adjustedEndIndex = Math.max(startIndex, endIndex);
  
    const selectedEmployees = employees.slice(adjustedStartIndex, adjustedEndIndex + 1);
    //console.log("Selected Employees:", selectedEmployees);
    return selectedEmployees;
  }, []);
  
  const handleCalculate = useCallback(async () => {
    console.log("Tính công cho nhân viên:", currentData);
    handleCreateData();
    
    if (currentData?.chonNgay?.tuNgay && currentData?.chonNhanVien) {
      const dataSelectedEmployee = arrangeSelected(newData, currentData.chonNhanVien);
      const dates = getNgayRows(currentData?.chonNgay?.tuNgay, currentData?.chonNgay?.denNgay);
      const updatedData = getShift(dates, newData);
  
      const convertDateToDayString = (date) => {
        const dateObj = new Date(date);
        return `Ngày ${dateObj.getDate()}`;
      };
    
      const totalCalculations = dataSelectedEmployee.length * dates.length;
      let completedCalculations = 0;
  
      const calculatedRows = await Promise.all(dataSelectedEmployee.flatMap(async (employee) => {
        return Promise.all(dates.map(async (date) => {
          const dayString = convertDateToDayString(date);
  
          const shiftData = updatedData.flatMap(items => {
            if (Array.isArray(items.getShift)) {
              const shift = items.getShift.find(cell => dayString === cell.value);
              return shift ? { ...shift, items } : null;
            }
            return null;
          }).filter(shift => shift);

          //console.log(shiftData)

          const gioVao  = await timeEnter(date, shiftData, employee);
          const treVao  = await timeEnterLately(date, shiftData, employee);
          const somVao  = await timeEnterEarly(dates, date, shiftData, employee);
          const gioRa   = await timeOut(date, shiftData, employee);
          const somRa   = await timeOutEarly(date, shiftData, employee);
          const veTre   = await timeOutLately(date, shiftData, employee);

          const demCong = shiftData.flatMap(shift => {
            const checkData = employee?.employeeId.includes(shift.items.employeeId);
            if (checkData && gioVao !== '0' && gioRa !== '0') {
              return shift.items.timmingRecieved.map(element => element.timeDetails.workHours)
                .reduce((sum, workHours) => sum + (workHours || 0), 0);
            }
            return [];
          }).reduce((sum, hours) => sum + hours, 0) || 0; 
          
          const kyHieu = demCong !== 0 ? 'Đ' : 'V';

          const result = {
            maNV: employee?.employeeId,
            tenNV: employee?.employeeName,
            ngay: date,
            thu: getWeekdayRows(date),
            ca: shiftData.flatMap(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.value);
              }
              return [];
            }).join(' - ') || 'Nghỉ',
            
            vao: shiftData.flatMap(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.startTimes);
              }
              return [];
            }).join(' - ') || '0',
            
            ra: shiftData.flatMap(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.endTime);
              }
              return [];
            }).join(' - ') || '0',
            
            cong: shiftData.length > 0 ? shiftData
              .filter(shift => employee.employeeId.includes(shift.items.employeeId))
              .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.workHours))
              .reduce((sum, workHours) => sum + (workHours || 0), 0) : 0,
            
            gioVao: gioVao,
            treVao: treVao,
            somVao: somVao,

            gioRa: gioRa,
            somRa: somRa,
            veTre: veTre,

            tc1: "0", //wating code lately
            tc2: "0",
            demCong: demCong,
            kyHieu: kyHieu
          };
  
          completedCalculations += 1;
          const progressPercentage = (completedCalculations / totalCalculations) * 100;
          setLoadingProgress(progressPercentage);
          return result;
        }));
      }));
  
      setRowDefs(calculatedRows.flat());
      setLoadingProgress(0);
    } else {
      console.log("Dữ liệu không đủ để tính toán");
    }
  }, [currentData, arrangeSelected, newData, handleCreateData, timeEnter, timeEnterEarly, timeEnterLately, timeOut, timeOutEarly, timeOutLately]);
  
  
  const handleExportToExcel = () => {
    const headers = columnDefs.map(item => item.headerName);
    const data = rowDefs.map(item => [
      item.maNV,
      item.tenNV,
      item.ngay,
      item.thu,
      item.ca,
      item.vao,
      item.ra,
      item.cong,
      item.gioVao,
      item.somVao,
      item.treVao,
      item.gioRa,
      item.somRa,
      item.veTre,
      item.tc1,
      item.tc2,
      item.demCong,
      item.kyHieu
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo chấm công");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'bao_cao_cham_cong.xlsx');
  };

  const fields = {
    calculateButton: (props) => (
      <div className={styles.buttonSingle}>
        <button onClick={handleExternalSubmit}>Tính công</button>
      </div>
    )
  };

  const columnDefs = [
    { headerName: "Mã NV", field: "maNV", pinned: 'left', width: 100, editable: true },
    { headerName: "Tên NV", field: "tenNV", pinned: 'left', width: 150, editable: true, filter: 'agTextColumnFilter' },
    { headerName: "Ngày", field: "ngay", pinned: 'left', width: 120, editable: true },
    { headerName: "Thứ", field: "thu", width: 80, editable: true },
    { headerName: "Ca", field: "ca", width: 80, editable: true },
    { headerName: "Vào", field: "vao", width: 100, editable: true },
    { headerName: "Ra", field: "ra", width: 100, editable: true },
    { headerName: "Công", field: "cong", width: 100, editable: true },
    { headerName: "Giờ Vào", field: "gioVao", width: 100, editable: true },
    { headerName: "Vào sớm", field: "somVao", width: 100, editable: true },
    { headerName: "Vào trễ", field: "treVao", width: 100, editable: true },
    { headerName: "Giờ Ra", field: "gioRa", width: 100, editable: true },
    { headerName: "Về sớm", field: "somRa", width: 100, editable: true },
    { headerName: "Về trễ", field: "veTre", width: 100, editable: true },
    { headerName: "TC1", field: "tc1", width: 100, editable: true },
    { headerName: "TC2", field: "tc2", width: 100, editable: true },
    { headerName: "Đếm Công", field: "demCong", width: 100, editable: true },
    { headerName: "Ký hiệu", field: "kyHieu", width: 100, editable: true }
  ];

  const handleExternalSubmit = () => {
    if (!formRef.current) {
      formRef.current.submit();
    }
  };

  if (!jsonSchema) {
    return <div className={styles.notLogin}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Báo cáo chấm công</h2>
      <div className={styles.flexContainer}>
        <div className={styles.mapCompany}>
          <CompanyStructure user={app.currentUser} />
        </div>
        <div className={styles.flexContainerHalft}>
          <div className={styles.formSection}>
            {jsonSchema ? (
              <Form
                ref={formRef}
                schema={jsonSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
                onSubmit={handleCalculate}
                fields={fields}
                onError={errors => {
                  console.error('Form errors:', errors);
                }}
              />
            ) : (
              <div>Loading schema...</div>
            )}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonList}>
                <button onClick={handleAdd}>Chi tiết</button>
                <button onClick={handleSave}>Thống kê tháng</button>
                <button onClick={handleDelete}>Tổng hợp</button>
                <button onClick={handleExit}>Trễ sớm</button>
                <button onClick={handleExportToExcel}>Xuất ra Excel</button> {/* Nút Xuất ra Excel */}
                <ToastContainer />
              </div>
            </div>
          </div>

          <div className={styles.loadingProgress}>
            {loadingProgress > 0 && (
              <div className={styles.loadingBar} style={{ width: `${loadingProgress}%` }}>
                {loadingProgress.toFixed(2)}%
              </div>
            )}
          </div>

          <div className={styles.scheduleList}>
            <div
              className="ag-theme-alpine"
              style={{ height: 400, width: '100%' }}
            >
              <AgGridReact
                columnDefs={columnDefs}
                rowData={rowDefs}
                onRowClicked={(event) => handleSelect(event.rowIndex)}
                rowSelection="single"
                domLayout='autoHeight'
                frameworkComponents={{ calculateButton: fields.calculateButton }}
              />
              <style>
                {`
                  .ag-header {
                    background-color: #f3f3f3; /* Màu nền của header */
                    color: #333; /* Màu chữ của header */
                    font-weight: bold; /* Font đậm cho header */
                  }
                `}
              </style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
