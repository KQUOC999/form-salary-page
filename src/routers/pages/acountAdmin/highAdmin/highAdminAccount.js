import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import styles from './styles.module.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });

const changePasswordSchema = {
  title: 'Change Password',
  type: 'object',
  required: ['email', 'oldPassword', 'newPassword'],
  properties: {
    email: { type: 'string', title: 'Email', format: 'email' },
    oldPassword: { type: 'string', title: 'Old Password', minLength: 6, format: 'password' },
    newPassword: { type: 'string', title: 'New Password', minLength: 6, format: 'password' },
  },
};

const HighAdminAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingPasswordChange, setIsLoadingPasswordChange] = useState(false);

  useEffect(() => {
    const currentUser = app.currentUser;
    setUser(currentUser);
    setLoading(false);
  }, []);

  const changePassword = async (form) => {
    const { email, oldPassword} = form.formData;
    setIsLoadingPasswordChange(true);
  
    try {
      // Bước 1: Đăng nhập với mật khẩu cũ
      const credentials = Realm.Credentials.emailPassword(email, oldPassword);
      const loggedInUser = await app.logIn(credentials);
  
      if (loggedInUser) {
        // Ở đây bạn cần gửi yêu cầu để reset mật khẩu qua email
        await app.emailPasswordAuth.sendResetPasswordEmail({email, 
          url: 'https://services.cloud.mongodb.com/groups/661813920cccc506bacee593/apps/6618168217e704236ec90ada/auth/providers/local-userpass' // URL đến trang reset password của bạn
        });
        
        alert('Đã gửi email để đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.');
      }
    } catch (error) {
      console.error(error.message);
      let errorMessage = 'Failed to change password. Please check your email and old password, then try again.';
  
      if (error.message.includes('invalid username/password')) {
        errorMessage = 'Email or old password is incorrect.';
      } else if (error.message.includes('UserNotFound')) {
        errorMessage = 'User does not exist.';
      }
  
      alert(errorMessage);
    } finally {
      setIsLoadingPasswordChange(false);
    }
  };
  
  
  
  return (
    <div>
      {user ? (
        <div className={styles.container_form}>
          <h2>Change Password</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Form
              className={styles.custom_form}
              schema={changePasswordSchema}
              validator={validator}
              onSubmit={changePassword}
            />
          )}
          {isLoadingPasswordChange && <p>Changing password...</p>}
        </div>
      ) : (
        <p>Please log in to change your password.</p>
      )}
    </div>
  );
};

export default HighAdminAccount;
