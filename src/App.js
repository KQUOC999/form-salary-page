import React,{lazy, Suspense} from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

const Account    = lazy ( () => import('./routers/pages/account'));
const MyForm     = lazy( () => import('./routers/pages/form'))

function App() {
  return (
  <Router>
    <Suspense fallback = {<div>Loading....</div>}>
      <Routes>

        <Route path ="/form-salary-page" element = {<Account/>} />
        <Route path ="/form-page" element = {<MyForm/>} />

      </Routes>
    </Suspense>
  </Router>

  );
}

export default App;
