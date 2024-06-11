import React, { useState, useEffect, useCallback } from 'react';
import * as Realm from 'realm-web';
import alertSound from '../../../sound/windows-10-notification.mp3';
import '../all_router_page.css/map.css';
import TreeForm from './TreeForm';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;

const TreeStructure = () => {
    const [jsonSchemaCompanyName, setJsonSchemaCompanyName] = useState({});
    const [jsonSchemaCompanyAreas, setJsonSchemaCompanyAreas] = useState({});
    const [jsonSchemaCompanyDepartment, setJsonSchemaCompanyDepartment] = useState({});
    const [jsonSchemaCompanyPosition, setJsonSchemaCompanyPosition] = useState({});
    const [formData, setFormData] = useState({
        companyName: '',
        departmentName: '',
        positionName: '',
        employeeName: ''
    });
    const [activeTabs, setActiveTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState(null);

    const fetchJsonSchema = useCallback(async (functionName, setSchemaState, schemaKey) => {
        try {
            const response = await user?.callFunction(functionName);
            const jsonSchema = response[0]?.public?.input?.jsonSchema;
            if (jsonSchema) {
                setSchemaState(jsonSchema);
                localStorage.setItem(schemaKey, JSON.stringify(jsonSchema));
            } else {
                console.log("Không tìm thấy schema JSON trong dữ liệu trả về");
            }
        } catch (error) {
            console.log(error.message);
        }
    }, []);

    useEffect(() => {
        const storedActiveTab = localStorage.getItem('activeTab');
        const storedFormData = localStorage.getItem('formData');
        if (storedActiveTab) {
            setActiveTabs([storedActiveTab]);
            setSelectedTab(storedActiveTab);
        }
        if (storedFormData) {
            setFormData(JSON.parse(storedFormData));
        }

        const storedJsonSchemaCompanyName = localStorage.getItem('jsonSchemaCompanyName');
        const storedJsonSchemaCompanyAreas = localStorage.getItem('jsonSchemaCompanyAreas');
        const storedJsonSchemaCompanyDepartment = localStorage.getItem('jsonSchemaCompanyDepartment');
        const storedJsonSchemaCompanyPosition = localStorage.getItem('jsonSchemaCompanyPosition');

        if (storedJsonSchemaCompanyName) setJsonSchemaCompanyName(JSON.parse(storedJsonSchemaCompanyName));
        if (storedJsonSchemaCompanyAreas) setJsonSchemaCompanyAreas(JSON.parse(storedJsonSchemaCompanyAreas));
        if (storedJsonSchemaCompanyDepartment) setJsonSchemaCompanyDepartment(JSON.parse(storedJsonSchemaCompanyDepartment));
        if (storedJsonSchemaCompanyPosition) setJsonSchemaCompanyPosition(JSON.parse(storedJsonSchemaCompanyPosition));
    }, []);

    const handleOpenTab = async (formType) => {
        if (selectedTab !== null) {
            const tab = document.getElementById(selectedTab);
            tab.style.border = "2px solid red";
            const audio = new Audio(alertSound);
            audio.play();

            setTimeout(() => {
                tab.style.border = "none";
            }, 1000);
            return;
        }

        switch (formType) {
            case 'companyName':
                if (!jsonSchemaCompanyName || Object.keys(jsonSchemaCompanyName).length === 0) {
                    await fetchJsonSchema("find_company_name", setJsonSchemaCompanyName, 'jsonSchemaCompanyName');
                }
                break;
            case 'companyAreas':
                if (!jsonSchemaCompanyAreas || Object.keys(jsonSchemaCompanyAreas).length === 0) {
                    await fetchJsonSchema("find_company_areas", setJsonSchemaCompanyAreas, 'jsonSchemaCompanyAreas');
                }
                break;
            case 'companyDepartment':
                if (!jsonSchemaCompanyDepartment || Object.keys(jsonSchemaCompanyDepartment).length === 0) {
                    await fetchJsonSchema("find_company_department", setJsonSchemaCompanyDepartment, 'jsonSchemaCompanyDepartment');
                }
                break;
            case 'companyPosition':
                if (!jsonSchemaCompanyPosition || Object.keys(jsonSchemaCompanyPosition).length === 0) {
                    await fetchJsonSchema("find_company_sevice", setJsonSchemaCompanyPosition, 'jsonSchemaCompanyPosition');
                }
                break;
            default:
                break;
        }

        localStorage.setItem('activeTab', formType);
        localStorage.setItem('formData', JSON.stringify(formData));

        setActiveTabs([formType]);
        setSelectedTab(formType);
    };

    const handleCloseTab = (formType) => {
        setActiveTabs(activeTabs.filter(tab => tab !== formType));
        setSelectedTab(null);

        localStorage.removeItem('activeTab');
        localStorage.removeItem('formData');

        switch (formType) {
            case 'companyName':
                localStorage.removeItem('jsonSchemaCompanyName');
                setJsonSchemaCompanyName({});
                break;
            case 'companyAreas':
                localStorage.removeItem('jsonSchemaCompanyAreas');
                setJsonSchemaCompanyAreas({});
                break;
            case 'companyDepartment':
                localStorage.removeItem('jsonSchemaCompanyDepartment');
                setJsonSchemaCompanyDepartment({});
                break;
            case 'companyPosition':
                localStorage.removeItem('jsonSchemaCompanyPosition');
                setJsonSchemaCompanyPosition({});
                break;
            default:
                break;
        }
    };

    const handleSubmit = (data, formType) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [formType]: data[formType]
        }));
        console.log("Dữ liệu đã submit:", data);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="tree">
            <div className="tree-content">
                <ul>
                    <li>
                        {formData.companyName || 'Tên công ty'}
                        <ul>
                            <li>
                                {formData.departmentName || 'Tên phòng ban'}
                                <ul>
                                    <li>
                                        {formData.positionName || 'Tên chức vụ'}
                                        <ul>
                                            <li>{formData.employeeName || 'Tên nhân viên'}</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div style={{ flex: 3, padding: '10px', position: 'relative', borderLeft: '1px solid #ccc', overflowY: 'auto' }}>
                <div className="btn-group-vertical" style={{ marginBottom: '10px'}}>
                    <button className='btn-primary' onClick={() => handleOpenTab('companyName')}>Công ty</button>
                    <button className='btn-primary' onClick={() => handleOpenTab('companyAreas')}>Khu vực</button>
                    <button className='btn-primary' onClick={() => handleOpenTab('companyDepartment')}>Phòng ban</button>
                    <button className='btn-primary' onClick={() => handleOpenTab('companyPosition')}>Chức vụ</button>
                </div>
                <div className="tab-content" style={{ position: 'relative', height: '400px'}}>
                    {activeTabs.map(tab => (
                        <div
                            key={tab}
                            id={tab}
                            className={`tab-pane ${selectedTab === tab ? 'active' : ''}`}
                        >
                            <div className="header">
                                <h4>{tab}</h4>
                                <button
                                    className="btn btn-danger btn-close"
                                    onClick={() => handleCloseTab(tab)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="content">
                                {tab === 'companyName' && (
                                    <TreeForm
                                        jsonSchema={jsonSchemaCompanyName}
                                        onSubmit={handleSubmit}
                                        formType="companyName"
                                    />
                                )}
                                {tab === 'companyAreas' && (
                                    <TreeForm
                                        jsonSchema={jsonSchemaCompanyAreas}
                                        onSubmit={handleSubmit}
                                        formType="companyAreas"
                                    />
                                )}
                                {tab === 'companyDepartment' && (
                                    <TreeForm
                                        jsonSchema={jsonSchemaCompanyDepartment}
                                        onSubmit={handleSubmit}
                                        formType="companyDepartment"
                                    />
                                )}
                                {tab === 'companyPosition' && (
                                    <TreeForm
                                        jsonSchema={jsonSchemaCompanyPosition}
                                        onSubmit={handleSubmit}
                                        formType="companyPosition"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TreeStructure;
