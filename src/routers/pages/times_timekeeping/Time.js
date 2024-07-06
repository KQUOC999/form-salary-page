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

const TimeClock = () => {
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

  const generateHeaders = () => {
    const staticHeaders = [
      "Mã nhân viên",
      "Tên nhân viên",
      "Ngày",
      "Phòng ban"
    ];

    const dynamicHeaders = [];
    for (let i = 1; i <= 20; i++) {
      dynamicHeaders.push(`Lần ${i}`);
    }

    return [...staticHeaders, ...dynamicHeaders];
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
    const headers = generateHeaders();

    const data = formData.map(item => [
      item.maNV,
      item.tenNV,
      item.ngay,
      item.phongBan,
      ...Array(20).fill().map((_, i) => item[`lan${i + 1}`] || '')
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Giờ chấm công");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'gio_cham_cong.xlsx');
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
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  {generateHeaders().map((header, index) => (
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
                    <td>{data.phongBan}</td>
                    {Array.from({ length: 20 }, (_, i) => (
                      <td key={i}>{data[`lan${i + 1}`]}</td>
                    ))}
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

export default TimeClock;
