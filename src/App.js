import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './component/MainPage';
import './index.css'
import Helmet from "helmet";

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
    <>
      <Helmet>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline';" />
        <meta http-equiv="Permissions-Policy" content="fullscreen=(self), geolocation=()" />
      </Helmet>
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
    </>
  );
}

export default App;
