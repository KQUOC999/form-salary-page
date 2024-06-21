import React, { useState, useEffect } from 'react';
import TreeView from 'react-treeview';

const CompanyStructure = ({ user }) => {
  const [dataTreeCompany, setDataTreeCompany] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const functionName = "find_totalSourceMapCompany";
      try {
        const response = await user?.callFunction(functionName);
        console.log("response:", response);

        let companyName = response.filter(item => item.type === 'companyName');
        let companyAreas = response.filter(item => item.type === 'companyAreas');
        let companyDepartment = response.filter(item => item.type === 'companyDepartment');

        console.log(companyName, companyAreas, companyDepartment);

        const data = [
          {
            label: 'Nhân viên mới',
            children: [
              {
                label: companyName[0]?.data.enum,
                children: companyAreas[0]?.data.enum.map(area => ({
                  label: area,
                  children: Object.keys(companyDepartment[0]?.data_departmentName).map(departmentKey => {
                    const departmentEnum = companyDepartment[0]?.data_departmentName[departmentKey]?.enum || [];
          
                    if (departmentKey.includes(area)) {
                      const labels = departmentEnum.map(item => ({
                        label: item,
                        children: [{ label: 'Tên chức vụ' }]
                      }));
          
                      return labels;
                    }
                    return null;
                  }).filter(item => item !== null).flat() // Loại bỏ những mục rỗng và làm phẳng mảng
                }))
              }
            ]
          },
          {
            label: 'Nghỉ việc'
          }
        ];
        
        setDataTreeCompany(data);

      } catch (error) {
        console.error("Error calling function:", error);
      }
    };

    fetchData();
  }, [user]); // Thêm user vào dependency để useEffect gọi lại khi user thay đổi

  const renderTree = (node) => (
    <TreeView key={node.label} nodeLabel={node.label} defaultCollapsed={false}>
      {node.children && node.children.map(child => renderTree(child))}
    </TreeView>
  );
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        {dataTreeCompany.map(node => renderTree(node))}
      </div>
    </div>
  );
};

export default CompanyStructure;
