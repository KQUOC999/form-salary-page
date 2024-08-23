import React, { useState, useEffect} from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema'; // Adjust this path according to your project structure
import * as XLSX from 'xlsx'; // Import XLSX library
import { saveAs } from 'file-saver'; // Import file-saver library
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CompanyStructure from '../structureCompany.module/companyStructure'

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const TimeClock = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        
        const functionName = "time_timekeeping_jsonSchema";
        const response = await user.functions[functionName]();
        const schema = response[0]?.public?.input?.jsonSchema;

        setJsonSchema(schema);
        console.log("response:", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columnDefs = [
    { headerName: 'Mã NV', field: 'maNV', editable: true, pinned: 'left' },
    { headerName: 'Tên NV', field: 'tenNV', editable: true, pinned: 'left' },
    { headerName: 'Ngày', field: 'ngay', editable: true, pinned: 'left' },
    { headerName: 'Phòng Ban', field: 'phongBan', editable: true, pinned: 'left', filter: 'agTextColumnFilter' },
    ...Array.from({ length: 20 }, (_, i) => ({
      headerName: `Lần ${i + 1}`,
      field: `lan${i + 1}`,
      editable: true, 
    })),
  ];

  // Dữ liệu của bảng
  const rowData = formData.map((data, index) => ({
    ...data,
    id: index,
  }));

  // Lựa chọn hàng
  const onRowClicked = (event) => {
    handleSelect(event.data.id);
  };

  const handleFormChange = (event) => {
    setCurrentData(event.formData);
  };

  const handleUpdate = () => {
    setFormData([...formData, currentData]);
    setCurrentData({});
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setCurrentData(formData[index]);
  };

  const handleExportToExcel = () => {
    // Lấy tiêu đề từ `columnDefs`
    const headers = columnDefs.map(col => col.headerName);

    // Chuẩn bị dữ liệu từ `formData`
    const data = formData.map(item => [
      item.maNV,
      item.tenNV,
      item.ngay,
      item.phongBan,
      ...Array.from({ length: 20 }, (_, i) => item[`lan${i + 1}`] || '')
    ]);
  
    // Tạo worksheet từ tiêu đề và dữ liệu
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
    // Tạo workbook và thêm worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Giờ chấm công");
  
    // Xuất workbook thành file Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'gio_cham_cong.xlsx');
  };

  if (!jsonSchema) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Giờ chấm công</h2>
      <div className={styles.flexContainer}>
        <div className={styles.mapCompany}>
          <CompanyStructure user={app.currentUser} />
        </div>
        <div className={styles.flexContainerHalft}>
          <div className={styles.flexContainerChild}>
            <div className={styles.formSection}>
              {jsonSchema ? (
                <Form
                  schema={jsonSchema}
                  formData={currentData}
                  onChange={handleFormChange}
                  validator={validator}
                  uiSchema={uiSchema}
                  onError={errors => {
                    console.error('Form errors:', errors);
                  }}
                />
              ) : (
                <div>Loading schema...</div>
              )}
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.button} onClick={handleUpdate}>Cập nhật</button>
              <button className={styles.button} onClick={handleExportToExcel}>Xuất Excel</button>
            </div>
          </div>
          <div className={styles.scheduleList}>
            <div className={styles.scheduleListContainer}>
              <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                  columnDefs={columnDefs}
                  rowData={rowData}
                  rowSelection="single"
                  onRowClicked={onRowClicked}
                  domLayout='autoHeight'
                  getRowClass={(params) => 
                    params.node.rowIndex === selectedIndex ? 'selected' : ''
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeClock;
