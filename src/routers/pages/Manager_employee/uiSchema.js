const uiSchema = {
  "ui:order": [
    "employeeId",
    "employeeName",
    "joinDate",
    "birthDate",
    "gender",
    "role",
    "address",
    "timekeepingId",
    "timekeepingName",
    "department",
    "fingerprintCount",
    "faceCount",
    "cardId"
  ],
  employeeId: {
    "ui:widget": "text"
  },
  employeeName: {
    "ui:widget": "text"
  },
  joinDate: {
    "ui:widget": "date"
  },
  birthDate: {
    "ui:widget": "date"
  },
  gender: {
    "ui:widget": "radio",
    "ui:options": {
      inline: true
    }
  },
  role: {
    "ui:widget": "select"
  },
  address: {
    "ui:widget": "text"
  },
  timekeepingId: {
    "ui:widget": "text"
  },
  timekeepingName: {
    "ui:widget": "text"
  },
  department: {
    "ui:disabled": true
  },
  fingerprintCount: {
    "ui:widget": "updown"
  },
  faceCount: {
    "ui:widget": "updown"
  },
  cardId: {
    "ui:widget": "text"
  },
  "ui:submitButtonOptions": {
    "norender": true
  }
};

export default uiSchema;
