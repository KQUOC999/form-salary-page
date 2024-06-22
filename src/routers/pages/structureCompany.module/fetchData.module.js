
export const fetchData = async (user, setDataTreeCompany) => {
    const functionName = "find_totalSourceMapCompany";
    try {
      const response = await user?.callFunction(functionName);
  
      let companyName = response.filter(item => item.type === 'companyName');
      let companyAreas = response.filter(item => item.type === 'companyAreas');
      let companyDepartment = response.filter(item => item.type === 'companyDepartment');
  
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
  