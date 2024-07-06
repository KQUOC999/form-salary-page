const uiSchema = {
  "ui:order": ["scheduleList", "description"],
  scheduleList: {
    "ui:widget": "text"
  },
  description: {
    "ui:order": ["repeatCycle"],
    repeatCycle: {
      "ui:widget": "radio",
      "ui:options": {
        inline: true
      }
    }
  },
  "ui:submitButtonOptions": {
    norender: true
  }
};

export default uiSchema;
