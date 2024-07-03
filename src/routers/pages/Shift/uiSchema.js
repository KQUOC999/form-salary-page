const uiSchema = {
  
  shiftCode: {
    "ui:widget": "select"
  },
  shiftOptions: {
    increaseLevelThisShift: {
      "ui:widget": "checkbox"
    },
    increaseLevelNextShift: {
      "ui:widget": "checkbox"
    },
    nightShift: {
      "ui:widget": "checkbox"
    }
  },
  timeDetails: {
    startTime: {
      "ui:widget": "time"
    },
    endTime: {
      "ui:widget": "time"
    },
    totalTime: {
      "ui:widget": "time"
    },
    workHours: {
      "ui:widget": "updown"
    },
    allowLate: {
      "ui:widget": "updown"
    },
    allowEarly: {
      "ui:widget": "updown"
    },
    mealBreakStart: {
      "ui:widget": "time"
    },
    mealBreakEnd: {
      "ui:widget": "time"
    },
    totalMealBreak: {
      "ui:widget": "time"
    }
  },
  timeShift: {
    startWorkTime: {
      "ui:widget": "time"
    },
    endWorkTime: {
      "ui:widget": "time"
    },
    startBreakTime: {
      "ui:widget": "time"
    },
    endBreakTime: {
      "ui:widget": "time"
    }
  },
  additionalOptions: {
    viewSundayAsNormal: {
      "ui:widget": "checkbox"
    },
    viewHolidayAsNormal: {
      "ui:widget": "checkbox"
    },
    ifNoStartTime: {
      "ui:widget": "updown"
    },
    ifNoEndTime: {
      "ui:widget": "updown"
    }
  },
  overtime: {
    beforeWork: {
      "ui:widget": "updown"
    },
    afterWork: {
      "ui:widget": "updown"
    },
    totalOvertimeBefore: {
      "ui:widget": "updown"
    },
    totalOvertimeAfter: {
      "ui:widget": "updown"
    },
    deductOvertimeBefore: {
      "ui:widget": "updown"
    },
    deductOvertimeAfter: {
      "ui:widget": "updown"
    },
    calculateByBlock: {
      "ui:widget": "updown"
    }
  },
  overtimeLimits: {
    overtimeLimit1: {
      "ui:widget": "updown"
    },
    overtimeLimit2: {
      "ui:widget": "updown"
    }
  }
};

export default uiSchema;