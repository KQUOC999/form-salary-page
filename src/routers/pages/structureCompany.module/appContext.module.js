import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const AppContext = createContext();

// Provider cung cấp dữ liệu cho các component con
export const AppProvider = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [dataByType, setDataByType] = useState({});
  const [dataTreeCompany, setDataTreeCompany] = useState([]); // Thêm dataTreeCompany
  const [parentNode, setParentNode] = useState(null);
  const [childNodes, setChildNodes] = useState(null); 

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    console.log('Node clicked:', node);
    // Thực hiện các hành động cần thiết khi node được click
  };

  return (
    <AppContext.Provider value={{ selectedNode, handleNodeClick, dataByType, setDataByType, setSelectedNode, dataTreeCompany, setDataTreeCompany, setParentNode, parentNode, setChildNodes, childNodes }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook để sử dụng Context
export const useAppContext = () => useContext(AppContext);