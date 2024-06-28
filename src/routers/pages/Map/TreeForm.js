import React, { useState} from 'react';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import * as Realm from 'realm-web';
import emitter from '../structureCompany.module/eventEmitter.module';

import '../all_router_page.css/map.css';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;

const TreeForm = ({ jsonSchema, onSubmit, formType }) => {
    const [formData, setFormData] = useState({});
    const [isSuccess, setIsSuccess] = useState(true);

    function updateCompanyStructure() {
        emitter.emit('updateCompanyStructure');
    }

//**             Hàm cập nhật dữ liệu jsonSchema cho server                 **//
    const handleUpdate = async ({ formData }) => {
        // Gọi hàm onSubmit để truyền giá trị form về TreeStructure
        onSubmit({ [formType]: formData });
        //Thực hiện đối với bảng companyName
        if (formType === 'companyName') {
            if (!formData) {
                console.log("Form data is invalid");
                return;
            }
            const enumValues = formData.name;
            
            try {
                const functionName = "update_TreeForm_company";
                const response = await user?.callFunction(functionName, enumValues, formType);
                updateCompanyStructure();
                setIsSuccess(true)
                return response;
            } catch (error) {
                setIsSuccess(false)
                console.log(error.message);
            }
        }

        //Thực hiện đối với bảng companyAreas
        if (formType === 'companyAreas') {
            if (!formData) {
                console.log("Form data is invalid");
                return;
            }
            const enumValues = formData.list;
            const enumAreas  = formData.name

            try {
                const functionName = "update_TreeForm_company";
                const response = await user?.callFunction(functionName, enumValues, formType, "", enumAreas);
                updateCompanyStructure();
                setIsSuccess(true);
                checkUpdateDataEmployee(formType, enumValues, enumAreas);    
                return response;
            } catch (error) {
                setIsSuccess(false)
                console.log(error.message);
            }
        }

        //Thực hiện đối với bảng companyDepartment
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
                updateCompanyStructure();
                setIsSuccess(true);
                console.log("formType, enumValues, enumdataDepartment:", formType, enumValues, enumdataDepartment)
                checkUpdateDataEmployee(formType, enumValues, "", enumdataDepartment, enumdataAreas); 
                return response;
            } catch (error) {
                setIsSuccess(false)
                console.log(error.message);
            }
        }
        
    };

    //Cập nhật lại dữ liệu nhận cho Server khi trạng thái phản hồi thành công ở hàm update
        const checkUpdateDataEmployee = async (formType, enumValues, enumAreas, enumdataDepartment, enumdataAreas) => {
            try {
                if (isSuccess) { 
                    let functionName = "checkUpdate_dataRecivedEmployee"
                    if (formType === 'companyAreas') { 
                        const response = await user?.callFunction(functionName, formType, enumValues, enumAreas);
                        return response
                    };

                    if (formType === 'companyDepartment') { 
                        const response = await user?.callFunction(functionName, formType, enumValues, enumdataDepartment, enumdataAreas);
                        return response
                    }
                }
            } catch (error) {
                window.alert(error.error)
            }
        }
//**            Hàm insert (thêm) dữ liệu jsonSchema cho server             **//
    const handleAdd = async () => { 
        // Gọi hàm onSubmit để truyền giá trị form về TreeStructure
        onSubmit({ [formType]: formData });       
        const functionName = "insert_TreeForm_company"

        //Thực hiện đối với from companyAreas
        if (formType === "companyAreas"){
            if (!formData) {
                console.log("From data is invalid");
                return
            }
            //Thêm các biến truyền vào
            const enumValues = formData.name
            try {
                const response = await user?.callFunction(functionName, enumValues, formType)
                updateCompanyStructure();
                return response;               
            } catch (error) {
                console.log(error.message)
            }
        };

        //Thực hiện đối với from companyDepartment
        if (formType === "companyDepartment"){
            if (!formData) {
                console.log("From data is invalid");
                return
            }
            //Thêm các biến truyền vào
            const enumValues = formData.name;
            const listAreas  = formData.Danh_sách_khu_vực;
            const listDepartment = formData.Danh_sách_phòng_ban
            
            try {
                const response = await user?.callFunction(functionName, enumValues, formType, listAreas, listDepartment)
                updateCompanyStructure();
                return response;               
            } catch (error) {
                console.log(error.message)
            }
        }
    };

//**            Hàm delete (xóa) dữ liệu jsonSchema cho server             **//
    const handleDelete = async () => {
        // Gọi hàm onSubmit để truyền giá trị form về TreeStructure
        onSubmit({ [formType]: formData });
        const functionName = "delete_TreeForm_company";
       
        //Thực hiện đối với from companyAreas
        if (formType === "companyAreas"){
            if (!formData) {
                console.log("From data is invalid");
                return
            }
            //Thêm các biến truyền vào
            const enumValues = formData.name
            try {
                const response = await user?.callFunction(functionName, enumValues, formType)
                updateCompanyStructure();
                return response;               
            } catch (error) {
                console.log(error.message)
            }
        };

        //Thực hiện đối với from companyDepartment
        if (formType === "companyDepartment"){
            if (!formData) {
                console.log("From data is invalid");
                return
            }
            //Thêm các biến truyền vào
            const enumValues = formData.name;
            const listAreas  = formData.Danh_sách_khu_vực;
            const listDepartment = formData.Danh_sách_phòng_ban
            
            try {
                const response = await user?.callFunction(functionName, enumValues, formType, listAreas, listDepartment)
                updateCompanyStructure();
                return response;               
            } catch (error) {
                console.log(error.message)
            }
        }

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
