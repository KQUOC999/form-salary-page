import React, { useEffect, useState, useCallback } from 'react';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import * as Realm from 'realm-web';

const app = new Realm.App({ id: process.env.REACT_APP_REALM_ID });
const user = app.currentUser;


const MyForm = () => {

    const [, setLoading]                                                                = useState(true);
    const [jsonSchemaCalculateNetSalaryInput, setJsonSchemaCalculateNetSalaryInput]     = useState({});
    const [jsonSchemaCalculateNetSalaryOutput, setJsonSchemaCalculateNetSalaryOutput]   = useState({});

    const [result, setResult]                                                           = useState(null); 
    const [formDataInputChange, setFormDataInputChange]                                 = useState({});
    const [ , setResponseArray]                                                         = useState([]);
    const [, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');


  useEffect(() => {
    if (user) {
      checkUserRole(user);
    } else {
      setLoading(false);
    }
  }, []);
  const checkUserRole = async (user) => {
    try {
      if (!user || !user.profile || !user.profile.email) {
        throw new Error("User is not logged in or does not have an email.");
      }
      const functionName = "checkUserRole";
      const userProfile = await user.functions[functionName](user.profile.email);
      if (userProfile.error) {
        throw new Error(userProfile.error);
      }
      setRole(userProfile.role);

      console.log("check role:", userProfile.role)

      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to check user role:", error);
    } finally {
      setLoading(false);
    }
  };

    const fetchDataNetSalaryModule = useCallback(async () => {
        try {
            if(role === 'admin' || role === 'user'){
                const profile = user.profile;
            if (profile) {
                // Lấy owner_id và owner_name từ profile
                const owner_id = profile.id;
                const owner_name = profile.email;

                // In ra console để kiểm tra
                console.log('Owner ID:', owner_id);
                console.log('Owner Name:', owner_name);
            }
                const functionName = "salaryFormModule";
                const response = await user?.callFunction(functionName);
                
                console.log("role: ", role)
                console.log("response: ", response)

                setJsonSchemaCalculateNetSalaryInput(response?.public?.input?.jsonSchema);
                setJsonSchemaCalculateNetSalaryOutput(response?.public?.output?.jsonData);
                setLoading(false);
            }
            
            
        } catch (error) { 
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchDataNetSalaryModule();
    }, [fetchDataNetSalaryModule]);

    const updateBasicSalary = useCallback((part) => {
        let basicSalary = 0;
        switch (part) {
            case "Teaching Department": 
                basicSalary = 8000000;
                break;
            case "Technical Department":
                basicSalary = 9000000;
                break;
            case "HR Department":
                basicSalary = 10000000;
                break;
            case "Production Department":
                basicSalary = 11000000;
                break;
            case "Supervision Department":
                basicSalary = 15000000;
                break;
            case "R&D":
                basicSalary = 20000000;
                break;
            case "CFO":
                basicSalary = 30000000;
                break;
            case "CEO":
                basicSalary = 40000000;
                break;
            default:
                basicSalary = 0;
        }

        setFormDataInputChange(prevData => {
            const currentBasicSalary = prevData?.["Thu nhập chịu thuế Input"]?.Part?.["Lương_cơ_bản"];
            if (currentBasicSalary !== basicSalary) {
                return {
                    ...prevData,
                    "Thu nhập chịu thuế Input": {
                        ...prevData["Thu nhập chịu thuế Input"],
                        Part: {
                            ...prevData["Thu nhập chịu thuế Input"].Part,
                            "Lương_cơ_bản": basicSalary
                        }
                    }
                };
            }
            return prevData;
        });
    }, []);

    useEffect(() => {
        const part = formDataInputChange?.["Thu nhập chịu thuế Input"]?.Part?.Part;
        if (part) {
            updateBasicSalary(part);
        }
    }, [formDataInputChange, updateBasicSalary]);


    

    const handleInputChange = (e) => {
        if (role === 'admin'){
            setFormDataInputChange(e.formData);
        }
    };
    
    const handleSubmit1 = async (form) => {
        try {
            // Kiểm tra xem formData có tồn tại không
            if (form) {
                const IncomeTaxInfo         = form.formData?.["Thu nhập chịu thuế Input"]?.["Thông_tin_nhân_viên"];
                const IncomeTaxPart         = form.formData?.["Thu nhập chịu thuế Input"]?.Part;
                const IncomekpiData         = form.formData?.["Thu nhập chịu thuế Input"]?.Plan?.["Chỉ_tiêu"];
                const IncomeBlance          = form.formData?.["Thu nhập chịu thuế Input"]?.Budget_performance;
                const IncomeBonus           = form.formData?.["Thu nhập chịu thuế Input"]?.Bonus;
                const PersonalIncomeTax     = form.formData?.["Thuế TNCN Input"]?.input;
                const LOAN                  = form.formData?.["LOAN_Tiền ứng trước Input"]?.input;
                const ExpenseReimbursement  = form.formData?.["EXPENSE REIMBURSEMENT - KHẤU TRỪ Input"]?.input;
                const InsuranceType         = form.formData?.["BẢO HIỂM"]?.Input
                

            //    console.log("Thông tin Insurance   : ", InsuranceType);

                //Thông tin Lương cơ bản
                    const dataToSendIncome = {
                        user: user.id,
                        Name: IncomeTaxInfo?.Name,
                        ID: IncomeTaxInfo?.ID,
                        Part: IncomeTaxPart?.Part,
                        BasicSalary: IncomeTaxPart?.["Lương_cơ_bản"],
                        KPIs: IncomekpiData?.map(item => ({
                            NameTaget: item?.["Tên_chỉ_tiêu"],
                            Money: item?.["Số_tiền"]
                        })) || [],// Trả về một mảng rỗng nếu IncomekpiData không tồn tại hoặc là null/undefined
                        Balance: IncomeBlance,
                        Bonus: IncomeBonus
                    };

                //Thông tin Thuế thu nhập cá nhân
                    const dataToSendPersonalIncomeTax = {
                        Date: PersonalIncomeTax.Datetime,
                        FullName: PersonalIncomeTax?.["Tên_nhân_viên"],
                        ID: PersonalIncomeTax?.ID,
                        SalaryNoTax: PersonalIncomeTax?.["Lương_chưa_thuế"],
                        Level: PersonalIncomeTax?.["Hệ_số"],
                        ReduceYourSelf: PersonalIncomeTax?.["Giảm trừ bản thân"],
                        InsuranceFees: PersonalIncomeTax?.["Bảo_hiểm"]
                    };


                //Thông tin LOAN - Tiền ứng trước
                    const dataToSendLOAN  = {
                        LoanRegistrationTime: LOAN.Datetime,
                        ExpriedDay          : LOAN.Expired_days,
                        LoanType            : LOAN.Loan_type,
                        StaffName           : LOAN.Name,
                        RefundDay           : LOAN.Refund_date,
                        Money               : LOAN.Value
                    };    

                //Thông tin EXPENSE REIMBURSEMENT - KHẤU TRỪ Input
                    const dataToSendExpenseReibursement = {
                        NotEnoughTargetStudent  : {
                            StudentNumber       : ExpenseReimbursement?.["Số_học_viên_không_đủ_chỉ_tiêu "]?.["Số_lượng_học_viên"],
                            StudentMoney        : ExpenseReimbursement?.["Số_học_viên_không_đủ_chỉ_tiêu "]?.["Số_tiền_HV"]
                        },
                        DefautFee               : ExpenseReimbursement?.["Default fee"]?.["Số_tiền_Def"],
                        Outsourcing             : ExpenseReimbursement?.Outsourcing?.["Số_tiền_Outs"],
                        UnauthorizedDayoff      : {
                            DayNumber           : ExpenseReimbursement?.["Số_ngày_nghỉ_không_phép"]?.["Số_ngày"],
                            MoneyOfDayoff       : ExpenseReimbursement?.["Số_ngày_nghỉ_không_phép"]?.["Số_tiền_trên_một_ngày_nghỉ"]
                        },
                        LackTargets: ExpenseReimbursement?.Thiếu_chỉ_tiêu?.map(item => ({
                            TargetName: item?.["Tên_chỉ_tiêu"],
                            RegisterName: item?.["Người_đăng_ký"],
                            CompensationMoney: item?.["Số_tiền_bồi_thường"]
                        })) || []
                    };

                //Thông tin Insurance - Bảo hiểm
                    const dataToSendInsurance = {
                        BHTN            : InsuranceType?.BHTN,
                        BHXH            : InsuranceType?.BHXH,
                        BHYT            : InsuranceType?.BHYT,
                        SalaryInsurance : InsuranceType?.["Lương_đóng_bảo_hiểm"]
                    }

                //   console.log("Thông tin nhân viên: ", dataToSendIncome,dataToSendPersonalIncomeTax, dataToSendLOAN,dataToSendExpenseReibursement,dataToSendInsurance);

            // Gộp mảng thông tin
                const dataTotalToSend = {
                    Người_dùng              : user.id,
                    Thu_nhập_chịu_thuế      : dataToSendIncome,
                    Thuế_thu_nhập_cá_nhân   : dataToSendPersonalIncomeTax,
                    LOAN_Tiền_ứng_trước     : dataToSendLOAN,
                    Khấu_trừ                : dataToSendExpenseReibursement,
                    Bảo_hiểm                : dataToSendInsurance
                }  
            

            //Gửi đối tượng về server
            const sendData = await app.currentUser?.callFunction("receivedData1", dataTotalToSend);


            //code trả về kết quả tính toán đưa vào form output:
            const calculatedResult = await calculateNetSalary(form.formData);
            setResult(calculatedResult);

            // Cập nhật kết quả
            fetchDataNetSalaryModule();

            return sendData;

            } else {
                console.error('Form data is missing or invalid.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

//Hàm tính toán dữ liệu trả về Output   
    const calculateNetSalary = async () => {

        //Test come code....///////////////////
            const functionName = "calculateNetSalary";
            const response     =  await user?.callFunction(functionName);

            // Kiểm tra xem response có phải là một mảng không
            if (Array.isArray(response) && response.length > 0) {
                // Lấy giá trị từ phản hồi
                const TotalsalarywithouttaxArray        = response.map(res => res.public?.output?.calculation?.["Total_salary_without_tax"]);
                const PersonalIncomeTaxArray            = response.map(res => res.public?.output?.calculation?.["Thuế_thu_nhập_cá_nhân"]);
                const LOANArray                         = response.map(res => res.public?.output?.calculation?.["LOAN_Tiền_ứng_trước"]);
                const ExpenseReimbursementArray         = response.map(res => res.public?.output?.calculation?.["Khấu_trừ"]);
                const InsuranceSalaryArray              = response.map(res => res.public?.output?.calculation?.["Lương_đóng_bảo_hiểm"]?.["Lương_đóng_bảo_hiểm"]);
                const SocialInsuranceArray              = response.map(res => res.public?.output?.calculation?.["Lương_đóng_bảo_hiểm"]?.BHXH);
                const AccidentInsuranceArray            = response.map(res => res.public?.output?.calculation?.["Lương_đóng_bảo_hiểm"]?.BHTN);
                const HealthInsuranceArray              = response.map(res => res.public?.output?.calculation?.["Lương_đóng_bảo_hiểm"]?.BHYT);
                const InsuranceArray                    = response.map(res => res.public?.output?.calculation?.["BẢO HIỂM"]);
                const NetsalaryArray                    = response.map(res => res.public?.output?.calculation?.["Lương_thực_lãnh"]);

                // Cập nhật giá trị mới nhất từ phản hồi
                const latestTotalsalarywithouttaxArray  = TotalsalarywithouttaxArray[TotalsalarywithouttaxArray.length - 1];
                const latestPersonalIncomeTaxArray      = PersonalIncomeTaxArray[PersonalIncomeTaxArray.length - 1];
                const latestLOANArray                   = LOANArray[LOANArray.length - 1];
                const latestExpenseReimbursementArray   = ExpenseReimbursementArray[ExpenseReimbursementArray.length - 1];
                const latestInsuranceSalaryArray        = InsuranceSalaryArray[InsuranceSalaryArray.length - 1];
                const latestSocialInsuranceArray        = SocialInsuranceArray[SocialInsuranceArray.length - 1];
                const latestAccidentInsuranceArray      = AccidentInsuranceArray[AccidentInsuranceArray.length - 1];
                const latestHealthInsuranceArray        = HealthInsuranceArray[HealthInsuranceArray.length - 1];
                const latestInsuranceArray              = InsuranceArray[InsuranceArray.length - 1];
                const latestNetsalaryArray              = NetsalaryArray[NetsalaryArray.length - 1];

                if (latestTotalsalarywithouttaxArray    !== undefined || 
                    latestPersonalIncomeTaxArray        !== undefined || 
                    latestLOANArray                     !== undefined ||
                    latestExpenseReimbursementArray     !== undefined ||
                    latestInsuranceSalaryArray          !== undefined ||
                    latestSocialInsuranceArray          !== undefined ||
                    latestAccidentInsuranceArray        !== undefined ||
                    latestHealthInsuranceArray          !== undefined ||
                    latestInsuranceArray                !== undefined ||
                    latestNetsalaryArray                !== undefined) {

                    // Thêm giá trị abc vào mảng state
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestTotalsalarywithouttaxArray]   : [latestTotalsalarywithouttaxArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestPersonalIncomeTaxArray]       : [latestPersonalIncomeTaxArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestLOANArray]                    : [latestLOANArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestExpenseReimbursementArray]    : [latestExpenseReimbursementArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestInsuranceSalaryArray]         : [latestInsuranceSalaryArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestSocialInsuranceArray]         : [latestSocialInsuranceArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestAccidentInsuranceArray]       : [latestAccidentInsuranceArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestHealthInsuranceArray]         : [latestHealthInsuranceArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestInsuranceArray]               : [latestInsuranceArray]);
                    setResponseArray(prevArray => Array.isArray(prevArray) ? [...prevArray, latestNetsalaryArray]               : [latestNetsalaryArray])

                // Tạo form output để hiện thị kết quả
                    const outputCalculation = {
                        "Salary_no_tax": {
                            "Total_salary": latestTotalsalarywithouttaxArray
                        },
                        "Thuế_TNCN": {
                            "Thuế_TNCN": latestPersonalIncomeTaxArray
                        },
                        "LOAN_Tiền ứng trước": {
                            "Loan_amount": latestLOANArray
                        },
                        "EXPENSE REIMBURSEMENT - KHẤU TRỪ": {
                            "Expense": latestExpenseReimbursementArray
                        },
                        "Lương đóng bảo hiểm": {
                            "BHXH": latestSocialInsuranceArray,
                            "BHTN": latestAccidentInsuranceArray,
                            "BHYT": latestHealthInsuranceArray,
                            "Lương_đóng_bảo_hiểm": latestInsuranceSalaryArray
                        },
                        "BẢO HIỂM": {
                            "Thành_tiền_BH": latestInsuranceArray
                        },
                        "LƯƠNG THỰC LÃNH": latestNetsalaryArray
                    };

                // Trả về kết quả tính toán
                return outputCalculation;

                } else {
                    console.error("Không tìm thấy giá trị trong phản hồi.");
                }
            } else {
                console.error("Phản hồi không phải là một mảng hoặc rỗng.");
            }
    };


    return (
        <>
            {user? (
                <div className="flex-justify-center">
                    <p>Role: {role}</p>
                    {role === 'admin' ? <div>Admin Content</div> : <div>Access Denied</div>}
                    {jsonSchemaCalculateNetSalaryInput ? (
                        <Form 
                            schema={jsonSchemaCalculateNetSalaryInput}
                            validator={validator}
                            formData={formDataInputChange}
                            onSubmit={handleSubmit1}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <div>Không có jsonSchemaCalculateNetSalaryInput</div>
                    )}
                    {jsonSchemaCalculateNetSalaryOutput ? (
                        <Form 
                            schema={jsonSchemaCalculateNetSalaryOutput}
                            validator={validator}
                            disabled={true} 
                            formData={result}
                            uiSchema={{
                                "ui:submitButtonOptions": {
                                    "norender": true 
                                }
                            }}
                        />
                    ) : (
                        <div>Không có jsonSchemaCalculateNetSalaryOutput</div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-600 text-lg">Please log in to view this content.</div>
                    
                </div>
            )}
        </>
    );
};

export default MyForm;