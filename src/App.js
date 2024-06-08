import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './component/MainPage';
import './index.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Giả sử đã đăng nhập thành công
    setIsLoggedIn(true);
    setInitializing(false);
  }, []);

  if (initializing) {
    return <div>Loading....</div>;
  }

  return (
    <Router>
      <Suspense fallback={<div>Loading....</div>}>
        <Routes>
          {!isLoggedIn ? (
            <Route path="/*" element={<Navigate to="/form-salary-page" />} />
          ) : (
            <Route path="/*" element={<MainPage />} />
          )}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
