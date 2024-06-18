import styles from './styles.module.css'; // Import CSS Module
import CustomTextareaWidget from '../setupFix_Error/TextareaWidget'; // Đường dẫn tới CustomTextareaWidget của bạn

const uiSchema = {
  "ui:classNames": styles.customFormClass,
  "ui:order": [
    "scheduleName",
    "methodSelection",
    "note",
    "timeSelection",
    "timeSettings",
    "minTime",
    "maxTime",
    "timeInterval"
  ],
  scheduleName: {
    "ui:widget": "text"
  },
  methodSelection: {
    "ui:widget": "radio",
    "ui:options": {
      inline: true
    },
    "ui:classNames": styles.radioGroup
  },
  timeSelection: {
    "ui:widget": "radio",
    "ui:options": {
      inline: true
    },
    "ui:classNames": styles.radioGroup
  },
  timeSettings: {
    "ui:classNames": styles.customFieldClass
  },
  note: {
    "ui:widget": CustomTextareaWidget, // Sử dụng widget tùy chỉnh của bạn
    "ui:options": {
      rows: 3
    },
    "ui:classNames": styles.note
  }
};

export default uiSchema;
