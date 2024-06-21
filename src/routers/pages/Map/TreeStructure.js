import React, { useState, useEffect, useCallback } from 'react';
import * as Realm from 'realm-web';
import alertSound from '../../../sound/windows-10-notification.mp3';
import '../all_router_page.css/map.css';
import TreeForm from './TreeForm';
import 'react-treeview/react-treeview.css';
import CompanyStructure from '../structureCompany.module/companyStructure'

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;

const TreeStructure = () => {
    const [jsonSchemaCompanyName, setJsonSchemaCompanyName] = useState({});
    const [jsonSchemaCompanyAreas, setJsonSchemaCompanyAreas] = useState({});
    const [jsonSchemaCompanyDepartment, setJsonSchemaCompanyDepartment] = useState({});
    const [jsonSchemaCompanyPosition, setJsonSchemaCompanyPosition] = useState({});

    const [formData, setFormData] = useState({
        companyName: '',
        companyAreas: '',
        companyDepartment: '',
        companyPosition: '',
        employeeName: ''
    });
    const [activeTabs, setActiveTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState(null);

    const fetchJsonSchema = useCallback(async (functionName, setSchemaState, schemaKey) => {
        try {
            const response = await user?.callFunction(functionName);
            const jsonSchema = response[0]?.public?.input?.jsonSchema;

            console.log("response", response);
            console.log("response", jsonSchema)
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
        <div className="tree" style={{ display: 'flex', width: '100%', overflowX: 'auto' }}>
            <div className="tree_content"style={{ position: 'relative', width: '15%', padding: '10px', minWidth: '200px', border: '1px solid #ddd', borderRadius: '5px'}}>
                <CompanyStructure user={user} />
            </div>
            <div className='form_container' style={{ flex: 3, padding: '10px', position: 'relative', borderLeft: '1px solid #ccc', minWidth: '400px', border: '1px solid #ddd', margin: '0px 10px 10px 10px', borderRadius: '5px', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)' }}>
                <div className="btn-group-vertical" style={{ display: 'flex'}}>
                    <button className='btn_primary' style= {{padding: '5px 15px', margin: '0 20px', cursor: 'pointer'}} onClick={() => handleOpenTab('companyName')}>Công ty</button>
                    <button className='btn_primary' style= {{padding: '5px 15px', marginRight: '20px', cursor: 'pointer'}} onClick={() => handleOpenTab('companyAreas')}>Khu vực</button>
                    <button className='btn_primary' style= {{padding: '5px 15px', marginRight: '20px', cursor: 'pointer'}} onClick={() => handleOpenTab('companyDepartment')}>Phòng ban</button>
                    <button className='btn_primary' style= {{padding: '5px 15px', marginRight: '20px', cursor: 'pointer'}} onClick={() => handleOpenTab('companyPosition')}>Chức vụ</button>
                </div>
                <div className="tab-content" style={{ position: 'relative', height: '400px', overflowY: 'auto'}}>
                {activeTabs.map(tab => (
                    <div
                        key={tab}
                        id={tab}
                        style={selectedTab === tab ? { display: 'block', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)', margin: '10px 10px 10px 10px'} : { display: 'none' }}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
                            <h4>{tab}</h4>
                            <button
                            style={{ background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: '1', cursor: 'pointer' }}
                            onClick={() => handleCloseTab(tab)}
                            >
                            &times;
                            </button>
                        </div>
                        <div style= {{marginBottom: '10px'}}>
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
}

export default TreeStructure;
