import React, { useState } from 'react';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import * as Realm from 'realm-web';

import '../all_router_page.css/map.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;

const TreeForm = ({ jsonSchema, onSubmit, formType }) => {
    const [formData, setFormData] = useState({});

    const handleUpdate = async ({ formData }) => {
        // Gọi hàm onSubmit để truyền giá trị form về TreeStructure
        onSubmit({ [formType]: formData });

        if (formType === 'companyName') {
            if (!formData) {
                console.log("Form data is invalid");
                return;
            }
            const enumValues = formData.name;
            
            console.log("enumValues", enumValues)
            try {
                const functionName = "update_TreeForm_company";
                const response = await user?.callFunction(functionName, enumValues, formType);
                console.log("response", response);
                return response;
            } catch (error) {
                console.log(error.message);
            }
        }

        if (formType === 'companyAreas') {
            if (!formData) {
                console.log("Form data is invalid");
                return;
            }
            const enumValues = formData.list;
            const enumAreas  = formData.name

            console.log("enumValues:", enumValues)
            try {
                const functionName = "update_TreeForm_company";
                const response = await user?.callFunction(functionName, enumValues, formType, "", enumAreas);
                console.log("response", response);
                return response;
            } catch (error) {
                console.log(error.message);
            }
        }

        if (formType === 'companyDepartment') {
            if (!formData) {
                console.log("Form data is invalid");
                return;
            }
            
            let enumValues = formData.name;
            let enumdataAreas = formData.Danh_sách_khu_vực;
            let enumdataDepartment = formData.Danh_sách_phòng_ban;

            try {
                const functionName = "update_TreeForm_company";
                const response = await user?.callFunction(functionName, enumValues, formType, "", "", enumdataAreas, enumdataDepartment, );
                console.log("response", response);
                return response;
            } catch (error) {
                console.log(error.message);
            }
        }
        
    };

    const handleAdd = () => { 
        // Thực hiện hành động thêm mới dữ liệu tương ứng với tab
    };

    const handleDelete = () => {
        // Thực hiện hành động xóa dữ liệu tương ứng với tab
    };

    const uiSchema = {
        "ui:submitButtonOptions": {
            "norender": true
        }
    };

    return (
        <div>
            <Form
                schema={jsonSchema}
                uiSchema={uiSchema}
                formData={formData}
                validator={validator}
                onChange={({ formData }) => setFormData(formData)}
                onSubmit={handleUpdate}
            />
            <div style={{ marginTop: '10px' }}>
                {formType !== 'companyName' && (
                    <div>
                        <button className="btn-success" type="button" onClick={handleAdd}>Thêm mới</button>
                        <button className="btn-danger" type="button" onClick={handleDelete}>Xóa</button>
                    </div>
                )}
                <button className="btn-update" type="button" onClick={() => handleUpdate({ formData })}>Cập nhật</button>
            </div>
        </div>
    );
};

export default TreeForm;
