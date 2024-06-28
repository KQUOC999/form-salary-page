import { v4 as uuidv4 } from 'uuid';

const getOrCreateId = (path) => {
  const storedIds = JSON.parse(localStorage.getItem('nodeIds')) || {};
  if (!storedIds[path]) {
    storedIds[path] = uuidv4();
    localStorage.setItem('nodeIds', JSON.stringify(storedIds));
  }
  return storedIds[path];
};
export const fetchData = async (user, setDataTreeCompany, setDataByType) => {
  const functionName = "find_totalSourceMapCompany";

  try {
    const response = await user?.callFunction(functionName);

    // Phân loại dữ liệu theo type
    let dataByType = {};
    response.forEach(item => {
      if (!dataByType[item.type]) {
        dataByType[item.type] = [];
      }
      dataByType[item.type].push(item);
    });

    // Lấy dữ liệu từ các loại
    let companyName = dataByType['companyName'] || [];
    let companyAreas = dataByType['companyAreas'] || [];
    let companyDepartment = dataByType['companyDepartment'] || [];

    // Đặt tên cho từng cấp node
    const defaultLabels = {
      topLevel: 'Nhân viên mới',
      company: 'Tên công ty',
      area: 'Khu vực',
      department: 'Phòng ban',
      position: 'Tên chức vụ',
      resigned: 'Nghỉ việc'
    };

    const createNode = (label, path) => ({
      id: getOrCreateId(path),
      label: label,
      children: []
    });

    const data = [
      createNode(defaultLabels.topLevel, defaultLabels.topLevel),
      createNode(companyName[0]?.data.enum || defaultLabels.company, `${defaultLabels.topLevel}/${companyName[0]?.data.enum || defaultLabels.company}`),
      createNode(defaultLabels.resigned, defaultLabels.resigned)
    ];

    const areaNodes = (companyAreas[0]?.data.enum || [defaultLabels.area]).map(area => {
      const areaPath = `${defaultLabels.topLevel}/${companyName[0]?.data.enum || defaultLabels.company}/${area}`;
      const areaNode = createNode(area, areaPath);

      areaNode.children = Object.keys(companyDepartment[0]?.data_departmentName || {}).map(departmentKey => {
        const departmentEnum = companyDepartment[0]?.data_departmentName[departmentKey]?.enum || [];

        if (departmentKey.includes(area)) {
          return departmentEnum.map(item => {
            const departmentPath = `${areaPath}/${item || defaultLabels.department}`;
            const departmentNode = createNode(item || defaultLabels.department, departmentPath);

            departmentNode.children = [createNode(defaultLabels.position, `${departmentPath}/${defaultLabels.position}`)];
            return departmentNode;
          });
        }
        return null;
      }).filter(item => item !== null).flat(); // Loại bỏ những mục rỗng và làm phẳng mảng

      return areaNode;
    });

    data[1].children = areaNodes;

    setDataTreeCompany(data); // Cập nhật state dataTreeCompany với dữ liệu mới lấy được
    setDataByType(dataByType); // Truyền dataByType vào setDataByType để cập nhật context

    return dataByType; // Trả về dataByType nếu cần sử dụng ở nơi khác
  } catch (error) {
    console.error("Error calling function:", error);
  }
};