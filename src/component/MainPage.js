import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from 'react-router-dom';
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

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(app.currentUser);
  const [, setRole] = useState('');
  const [selectedTaskbar, setSelectedTaskbar] = useState(null);
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
    navigate(taskbar.path);
  };

  const taskbarItems = [
    { label: "Attendance", path: "/attendance" },
    { label: "Customization", path: "/customization" }
  ];

  const attendanceSubTaskbarItems = [
    { label: "Home", path: "/myhome" },
    { label: "Form", path: "/form-page" },
    { label: "NodeRed", path: "/client-page" },
    { label: "Search", path: "/search-page" }
  ];

  const customizationSubTaskbarItems = [
    { label: "Option 1", path: "/customization/option1" },
    { label: "Option 2", path: "/customization/option2" }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-page">
      
      {isLoggedIn ? (
        <>
          <div className= "taskbar-container">
              <Taskbar items={taskbarItems} onSelect={handleTaskbarSelect} />
              <button onClick={logout}>Logout</button>
          </div>
          {selectedTaskbar && (
            <SubTaskbar
              items={
                selectedTaskbar.label === "Attendance"
                  ? attendanceSubTaskbarItems
                  : customizationSubTaskbarItems
              }
            />
          )}
          
          <div className="container-main-page">
            <Routes>
              <Route path="/form-page" element={<MyForm />} />
              <Route path="/client-page" element={<MqttClient />} />
              <Route path="/search-page" element={<Search />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/customization/*" element={<CustomizationPage />} />
            </Routes>
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
