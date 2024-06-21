import React, { useState, useEffect, useRef } from 'react';
import * as Realm from 'realm-web';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css'; // Import CSS Module
import uiSchema from './uiSchema'; // Adjust this path according to your project structure
import * as XLSX from 'xlsx'; // Import XLSX library
import { saveAs } from 'file-saver'; // Import file-saver library
import CompanyStructure from '../structureCompany.module/companyStructure'

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const Reporting = () => {
  const [jsonSchema, setJsonSchema] = useState(null);
  const [formData, setFormData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [columnWidths, setColumnWidths] = useState({}); // State to store column widths

  const headerRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = app.currentUser;
        if (!user) {
          await app.logIn(Realm.Credentials.anonymous());
        }
        const functionName = "reporting_jsonSchema";
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

  const handleCalculate = () => {
    console.log("Tính công cho nhân viên:", currentData);
    // Implement your calculation logic here
  };

  const handleExportToExcel = () => {
    const headers = [
      "Mã NV",
      "Tên NV",
      "Ngày",
      "Thứ",
      "Ca",
      "Vào",
      "Ra",
      "Công",
      "Giờ",
      "Trễ",
      "Sớm",
      "Về trễ",
      "TC1",
      "TC2",
      "Đếm Công",
      "Ký hiệu"
    ];

    const data = formData.map(item => [
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

  const onMouseDown = (index, e) => {
    const startX = e.clientX;
    const startWidth = headerRefs.current[index].offsetWidth;

    const onMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      setColumnWidths((prev) => ({ ...prev, [index]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const fields = {
    calculateButton: (props) => (
      <div className={styles.buttonGroup}>
        <button onClick={handleCalculate}>Tính công</button>
      </div>
    )
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
                schema={jsonSchema}
                formData={currentData}
                onChange={handleFormChange}
                validator={validator}
                uiSchema={uiSchema}
                fields={fields}
                onError={errors => {
                  console.error('Form errors:', errors);
                }}
              />
            ) : (
              <div>Loading schema...</div>
            )}
            <div className={styles.buttonGroup}>
              <button onClick={handleAdd}>Thêm mới</button>
              <button onClick={handleSave}>Lưu</button>
              <button onClick={handleDelete}>Xóa</button>
              <button onClick={handleExit}>Thoát</button>
              <button onClick={handleExportToExcel}>Xuất ra Excel</button> {/* Nút Xuất ra Excel */}
            </div>
          </div>
          <div className={styles.scheduleList}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  {[
                    "Mã NV",
                    "Tên NV",
                    "Ngày",
                    "Thứ",
                    "Ca",
                    "Vào",
                    "Ra",
                    "Công",
                    "Giờ",
                    "Trễ",
                    "Sớm",
                    "Về trễ",
                    "TC1",
                    "TC2",
                    "Đếm Công",
                    "Ký hiệu"
                  ].map((header, index) => (
                    <th
                      key={index}
                      ref={(el) => (headerRefs.current[index] = el)}
                      style={{ width: columnWidths[index] || 'auto' }}
                    >
                      {header}
                      <div
                        className={styles.resizer}
                        onMouseDown={(e) => onMouseDown(index, e)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.map((data, index) => (
                  <tr
                    key={index}
                    className={selectedIndex === index ? styles.selected : ''}
                    onClick={() => handleSelect(index)}
                  >
                    <td>{data.maNV}</td>
                    <td>{data.tenNV}</td>
                    <td>{data.ngay}</td>
                    <td>{data.thu}</td>
                    <td>{data.ca}</td>
                    <td>{data.vao}</td>
                    <td>{data.ra}</td>
                    <td>{data.cong}</td>
                    <td>{data.gio}</td>
                    <td>{data.tre}</td>
                    <td>{data.som}</td>
                    <td>{data.veTre}</td>
                    <td>{data.tc1}</td>
                    <td>{data.tc2}</td>
                    <td>{data.demCong}</td>
                    <td>{data.kyHieu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default Reporting;
