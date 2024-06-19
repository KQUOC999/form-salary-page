import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import * as Realm from 'realm-web';
import './MainPage.css';

import Taskbar from "../component/T_MainTaskbar.js";
import SubTaskbar from "../component/SubTaskbar.js";
import Account from "../routers/pages/account";
import MyForm from "../routers/pages/form";
import MqttClient from "../routers/pages/nodeRed";
import Search from "../routers/pages/search";
import AttendancePage from "../routers/pages/AttendancePage";
import CustomizationPage from "../routers/pages/CustomizationPage";
import TreeStructure from "../routers/pages/Map/TreeStructure.js";
import TableWithFormsAndCheckboxes from "../routers/pages/Shift/createTableShift.js";
import TimeKeepingMethod from "../routers/pages/TimeKeeping_Method/Method.js";
import Schedule from "../routers/pages/Schedule/calendar.js";
import EmployeeSchedule from "../routers/pages/Employee_Schedule/schedule.js";
import MachineInformation from "../routers/pages/machine/information.js";
import Reporting from "../routers/pages/Reporting/reporting.js";
import Time from "../routers/pages/TimeKeeping_Time/Time.js";
import ManagerEmployee from "../routers/pages/Manager_employee/manager_employee.js";


const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(app.currentUser);
  const [, setRole] = useState('');
  const [selectedTaskbar, setSelectedTaskbar] = useState(null);
  const [openTabs, setOpenTabs] = useState([]); // State mới để lưu trữ danh sách các tab đang mở
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      checkUserRole(currentUser);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const selectedItem = sessionStorage.getItem('selectedTaskbar');
    if (selectedItem) {
      setSelectedTaskbar(JSON.parse(selectedItem));
    }

    const storedTabs = JSON.parse(localStorage.getItem('openTabs') || '[]');
    setOpenTabs(storedTabs);
  }, []);

  const checkUserRole = async (user) => {
    try {
      if (!user || !user.profile || !user.profile.email) {
        throw new Error("User is not logged in or does not have an email.");
      }
      const functionName = "checkUserRole";
      const userProfile = await user.functions[functionName](user.profile.email);
      if (userProfile.error) {
        throw new Error(userProfile.error);
      }
      setRole(userProfile.role);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to check user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await currentUser.logOut();
      setCurrentUser(null);
      setIsLoggedIn(false);
      navigate('/form-salary-page');
    }
  };

  const handleTaskbarSelect = (taskbar) => {
    setSelectedTaskbar(taskbar);
    sessionStorage.setItem('selectedTaskbar', JSON.stringify(taskbar));
  };

  const handleSubTaskbarSelect = (subTaskbarItem) => {
    setOpenTabs(prevTabs => {
      const updatedTabs = prevTabs.filter(tab => tab.path !== subTaskbarItem.path);
      const newTabs = [subTaskbarItem, ...updatedTabs];
      localStorage.setItem('openTabs', JSON.stringify(newTabs));
      return newTabs;
    });
  };

  const handleCloseTab = (tabPath) => {
    // Loại bỏ tab bằng cách lọc ra các tab không phải là tab đó
    const updatedTabs = openTabs.filter(tab => tab.path !== tabPath);
    setOpenTabs(updatedTabs);
    
    // Lưu trạng thái mới của các tab mở vào localStorage
    localStorage.setItem('openTabs', JSON.stringify(updatedTabs));
  };

  const renderTabContent = (path) => {
    switch(path) {
      case "/form-page":
        return <MyForm />;
      case "/client-page":
        return <MqttClient />;
      case "/search-page":
        return <Search />;
      case "/tính_công/employee":
        return <ManagerEmployee />;
      case "/tính_công/workshift":
        return <TableWithFormsAndCheckboxes />;
      case "/tính_công/marking_scheme":
        return <TimeKeepingMethod />;
      case "/tính_công/schedule":
        return <Schedule />;
      case "/tính_công/employee_schedule":
        return <EmployeeSchedule />;
      case "/tính_công/time_clock_machine":
        return <MachineInformation />;
      case "/tính_công/connect_multiple_devices":
        return null;
      case "/tính_công/reporting":
        return <Reporting />;
      case "/tính_công/time_clock_hours":
        return <Time />;
      case "/tính_công/current_status":
        return <AttendancePage />;
      case "/tùy_chỉnh/phân_quyền":
        return null;
      case "/tùy_chỉnh/sơ_đồ":
        return <TreeStructure />;
      case "/tùy_chỉnh/nghỉ_chế_độ":
        return null;
      case "/tùy_chỉnh/phép_năm":
        return null;
      case "/tùy_chỉnh/phân_giờ":
        return null;
      case "/tùy_chỉnh/chọn_dữ_liệu":
        return null;
      case "/tùy_chỉnh/xóa_dữ_liệu":
        return <CustomizationPage />;
      default:
        return null;
    }
  };

  const taskbarItems = [
    { label: "Tính công", path: "/tính_công" },
    { label: "Tùy chỉnh", path: "/tùy_chỉnh" }
  ];

  const attendanceSubTaskbarItems = [
    { label: "Nhân viên", path: "/tính_công/employee" },
    { label: "Ca làm việc", path: "/tính_công/workshift" },
    { label: "Cách chấm", path: "/tính_công/marking_scheme" },
    { label: "Lịch trình", path: "/tính_công/schedule" },
    { label: "Lịch nhân viên", path: "/tính_công/employee_schedule" },
    { label: "Máy chấm công", path: "/tính_công/time_clock_machine" },
    { label: "Kết nối nhiều thiết bị", path: "/tính_công/connect_multiple_devices" },
    { label: "Báo cáo", path: "/tính_công/reporting" },
    { label: "Giờ chấm công", path: "/tính_công/time_clock_hours" },
    { label: "Hiện hành", path: "/tính_công/current_status" },
    { label: "Thoát", path: "/tính_công/exit" }
  ];

  const customizationSubTaskbarItems = [
    { label: "Phân quyền", path: "/tùy_chỉnh/phân_quyền" },
    { label: "Sơ đồ", path: "/tùy_chỉnh/sơ_đồ" },
    { label: "Nghỉ chế độ", path: "/tùy_chỉnh/nghỉ_chế_độ"},
    { label: "Phép năm", path: "/tùy_chỉnh/phép_năm" },
    { label: "Phân giờ", path: "/tùy_chỉnh/phân_giờ" },
    { label: "Chọn dữ liệu", path: "/tùy_chỉnh/chọn_dữ_liệu" },
    { label: "Xóa dữ liệu", path: "/tùy_chỉnh/xóa_dữ_liệu" },
    { label: "Form", path: "/form-page" },
    { label: "NodeRed", path: "/client-page" },
    { label: "Search", path: "/search-page" }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-page">
      
      {isLoggedIn ? (
        <>
          <div className="taskbar-container">
            <Taskbar items={taskbarItems} onSelect={handleTaskbarSelect} />
            <button onClick={logout}>Logout</button>
          </div>
          {selectedTaskbar && (
            <SubTaskbar
              items={
                selectedTaskbar.label === "Tính công"
                  ? attendanceSubTaskbarItems
                  : customizationSubTaskbarItems
              }
              onSelect={handleSubTaskbarSelect} // Thêm callback để xử lý khi một tab được chọn
            />
          )}
          
          <div className="container-main-page">
            {/* Hiển thị nội dung của các tab đang mở */}
            {openTabs.map(tab => (
              <div key={tab.path} className="tab-content">
                <div className="tab-header">
                  {tab.label}
                  <button onClick={() => handleCloseTab(tab.path)}>x</button>
                </div>
                <div className="tab-body">
                  {renderTabContent(tab.path)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <Routes>
            <Route path="/form-salary-page" element={<Account />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default MainPage;
