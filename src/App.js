import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './component/MainPage';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Giả sử đã đăng nhập thành công
    setIsLoggedIn(true);
    setInitializing(false);

    // Cập nhật các thẻ <head> khi component được mount
    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#000000');
    document.title = "Your App Title";
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
