const uiSchema = {
  chonPhongBan: {
    "ui:widget": "select"
  },
 
  chonNhanVien: {
    tuNV: {
      "ui:widget": "text" // Replaced 'updown' with 'text'
    },
    denNV: {
      "ui:widget": "text" // Replaced 'updown' with 'text'
    }
  },
  
  calculateButton: {
    "ui:field": "calculateButton"
  },

  baoCao: {
    chiTiet: {
      "ui:widget": "select"
    },
    thongKeThang: {
      "ui:widget": "select"
    },
    thongKe: {
      "ui:widget": "select"
    },
    treSom: {
      "ui:widget": "select"
    }
  },
  "ui:submitButtonOptions": {
            "norender": true
        }
};

export default uiSchema;
