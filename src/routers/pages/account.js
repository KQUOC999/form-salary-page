
import React, { useState} from 'react';
import * as Realm from 'realm-web';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import MyForm from './form';



const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;

const schema = {
  title: 'Register',
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', title: 'Email', format: 'email' },
    password: { type: 'string', title: 'Password', minLength: 6, format: 'password' },
  },
};

const loginSchema = {
  title: 'Login',
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', title: 'Email', format: 'email' },
    password: { type: 'string', title: 'Password', minLength: 6, format: 'password' },
  },
};

const Account = () => {
  const [ , setUser] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Thêm state mới để kiểm tra trạng thái đăng nhập
  
  const register = async (form) => {
    const { email, password } = form.formData;
    try {
      await app.emailPasswordAuth.registerUser({ email, password });
      window.location.reload(true);
    } catch (error) {
      console.log(error.error);
    }
  };

  const login = async (form) => {
    const { email, password } = form.formData;
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);
      const loggedInUser = await app.logIn(credentials);
      setLoading(false);
      setUser(loggedInUser);
      setIsLoggedIn(true); // Đã đăng nhập thành công
      window.location.reload(true);
      window.location.href = '/form-salary-page';

    } catch (error) {
      console.log(error.error);
    }
  };

  return (
    <div>
      {user ? (
        <>
          {isLoggedIn && loading ? <p>Loading...</p> : <MyForm />}
        </>
      ) : (
        <div className="overlay-container">
          <div className="overlay-content">
            <div className="container_form">
              {!showRegisterForm ? (
                <>
                  <button className="button1" onClick={() => setShowRegisterForm(true)}>
                    Đăng ký
                  </button>
                  <Form
                    className="custom-form"
                    schema={loginSchema}
                    validator={validator}
                    onSubmit={login}
                  />
                </>
              ) : (
                <>
                  <button className="button1" onClick={() => setShowRegisterForm(false)}>
                    Quay lại
                  </button>
                  <Form
                    className="custom-form"
                    schema={schema}
                    validator={validator}
                    onSubmit={register}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;