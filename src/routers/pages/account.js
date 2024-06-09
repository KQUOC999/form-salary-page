import React, { useState} from 'react';
import * as Realm from 'realm-web';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import video from '../../video/work.mp4'

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

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
  const [user, setUser] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const register = async (form) => {
    const { email, password } = form.formData;
    try {
      await app.emailPasswordAuth.registerUser({ email, password });
      window.location.replace('/form-salary-page');
    } catch (error) {
      console.log(error.message);
    }
  };

  const login = async (form) => {
    const { email, password } = form.formData;
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);
      const loggedInUser = await app.logIn(credentials);
      setLoading(false);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      window.location.reload(true)

    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
       <video autoPlay loop muted className="background-video" onError={(e) => console.log('Video load error:', e)}>
        <source src= {video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {user ? (
        <>
          {isLoggedIn && loading ? <p>Loading...</p> : <Account />}
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
