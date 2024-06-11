import React from 'react';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';

import '../all_router_page.css/map.css';

const TreeForm = ({ jsonSchema, onSubmit, formType }) => {
    const handleSubmit = ({ formData }) => {
        onSubmit(formData, formType);
    };

    const handleUpdate = () => {
        // Thực hiện hành động cập nhật dữ liệu tương ứng với tab
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
                validator={validator}
                onSubmit={handleSubmit}
            />
            <div style={{ marginTop: '10px' }}>
                {formType !== 'companyName' && (
                    <div>
                        <button className="btn-success" type="button" onClick={handleAdd}>Thêm mới</button>
                        <button className="btn-danger" type="button" onClick={handleDelete}>Xóa</button>
                    </div>
                )}
                <button className="btn-update" type="button" onClick={handleUpdate}>Cập nhật</button>
            </div>
        </div>
    );
};
export default TreeForm;