import React,{lazy, Suspense} from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';


const MyForm     = lazy( () => import('./routers/pages/form'));
const Account    = lazy ( () => import('./routers/pages/account'))

function App() {
  return (
  <Router>
    <Suspense fallback = {<div>Loading....</div>}>
      <Routes>

        <Route path ="//form-login-page" element = {<Account/>} />
        <Route path ="//form-salary-page" element = {<MyForm/>} />

      </Routes>
    </Suspense>
  </Router>

  );
}

export default App;
