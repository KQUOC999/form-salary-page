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

        const newEnums = response.map(doc => doc.employeeName);
          // Cập nhật currentData với giá trị mới
          setJsonSchema(prevSchema => ({
            ...prevSchema,
            properties: {
              ...prevSchema.properties,
              chonNhanVien: {
                ...prevSchema.properties.chonNhanVien,
                properties: {
                  ...prevSchema.properties.chonNhanVien.properties,
                  tuNV: {
                    ...prevSchema.properties.chonNhanVien.properties.tuNV,
                    enum: newEnums
                  },
                  denNV: {
                    ...prevSchema.properties.chonNhanVien.properties.denNV,
                    enum: newEnums
                  }
                }
              }
            }
          }));
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
  
  const handleCalculate = useCallback(() => {
    console.log("Tính công cho nhân viên:", currentData);
    handleCreateData();

    if (currentData?.chonNgay?.tuNgay && currentData?.chonNhanVien) {
      const dataSelectedEmployee = arrangeSelected(newData, currentData.chonNhanVien);
      const dates = getNgayRows(currentData?.chonNgay?.tuNgay, currentData?.chonNgay?.denNgay);
      // Gọi getShift và cập nhật newData
      const updatedData = getShift(dates, newData);
  
      const convertDateToDayString = (date) => {
        const dateObj = new Date(date);
        const dayNumber = dateObj.getDate();
        return `Ngày ${dayNumber}`;
      };
  
      const calculatedRows = dataSelectedEmployee.flatMap(employee => 
        dates.map(date => {
          const dayString = convertDateToDayString(date);
  
          // Lọc ca làm việc khớp với ngày và có giá trị 'Sáng' hoặc 'Tối'
          const shiftData = updatedData.flatMap(items => {
            if (Array.isArray(items.getShift)) {
              const shift = items.getShift.find(cell => dayString === cell.value);
              if (shift) {
                //console.log(shift)
                return {...shift, items}; // Chỉ lấy ca làm việc (sáng/tối)
              }
            }
            return null; // Trả về null nếu không có ca làm việc phù hợp
          }).filter(shift => shift); // Lọc bỏ các giá trị null
          
          console.log("shiftData:", shiftData)
          return {
            maNV: employee?.employeeId,
            tenNV: employee?.employeeName,
            ngay: date,
            thu: getWeekdayRows(date),
            ca: shiftData.length > 0 ? shiftData.flatMap(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.value).join('- ');
              }
              return '';
            }).join(' ') : "",

            vao: shiftData.length > 0 ? shiftData.map(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.startTimes).join('- ');
              }
              return '';
            }).join(' ') : "",

            ra: shiftData.length > 0 ? shiftData.map(shift => {
              const checkData = employee?.employeeId.includes(shift.items.employeeId);
              if (checkData) {
                return shift.items.getShift.filter(cell => cell.value === 'Sáng' || cell.value === 'Chiều').map(cell => cell.endTime).join('- ');
              }
              return '';
            }).join(' ') : "",

            cong: shiftData.length > 0 ? shiftData
              .filter(shift => employee.employeeId.includes(shift.items.employeeId))
              .filter(shift => shift.items.getShift.some(cell => cell.value === 'Sáng' || cell.value === 'Chiều'))
              .flatMap(shift => shift.items.timmingRecieved.map(element => element.timeDetails.workHours))
              .reduce(((sum, workHours) => sum + (workHours || 0)), 0) : ""
            ,
            gio: "", // Thiết lập giá trị giờ nếu có
            tre: "", // Thiết lập giá trị trễ nếu có
            som: "", // Thiết lập giá trị sớm nếu có
            veTre: "", // Thiết lập giá trị về trễ nếu có
            tc1: "", // Thiết lập giá trị TC1 nếu có
            tc2: "", // Thiết lập giá trị TC2 nếu có
            demCong: "", // Thiết lập giá trị đếm công nếu có
            kyHieu: "" // Thiết lập giá trị ký hiệu nếu có
        };
        
        })
      );
  
      setRowDefs(calculatedRows);
    } else {
      console.log("Dữ liệu không đủ để tính toán");
    }
  }, [currentData, arrangeSelected, newData, handleCreateData]);
  
 
  

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
      item.gio,
      item.tre,
      item.som,
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
    { headerName: "Mã NV", field: "maNV", pinned: 'left', width: 100},
    { headerName: "Tên NV", field: "tenNV", pinned: 'left', width: 150, filter: 'agTextColumnFilter' },
    { headerName: "Ngày", field: "ngay", pinned: 'left', width: 120 },
    { headerName: "Thứ", field: "thu", width: 80 },
    { headerName: "Ca", field: "ca", width: 80 },
    { headerName: "Vào", field: "vao", width: 100 },
    { headerName: "Ra", field: "ra", width: 100 },
    { headerName: "Công", field: "cong", width: 100 },
    { headerName: "Giờ", field: "gio", width: 100 },
    { headerName: "Trễ", field: "tre", width: 100 },
    { headerName: "Sớm", field: "som", width: 100 },
    { headerName: "Về trễ", field: "veTre", width: 100 },
    { headerName: "TC1", field: "tc1", width: 100 },
    { headerName: "TC2", field: "tc2", width: 100 },
    { headerName: "Đếm Công", field: "demCong", width: 100 },
    { headerName: "Ký hiệu", field: "kyHieu", width: 100 }
  ];

  const handleExternalSubmit = () => {
    if (!formRef.current) {
      formRef.current.submit();
    }
  };

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
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
