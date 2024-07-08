import React, { useState, useEffect } from 'react';
import styles from './styles.module.css'; // Import CSS Module

const ShiftModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const shifts = ['Sáng', 'Chiều']; // List of shifts
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // List of days from 1 to 31

  const handleShiftChange = (shift) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleConfirm = () => {
    onConfirm({ selectedShifts, selectedDays });
    onClose();
  };

  useEffect(() => {
    if (isOpen && selectedDays.length === 0) {
      // Set selectedDays to contain all days from 1 to 31
      setSelectedDays([...days]); // Copy all days array
    }
  }, [isOpen, selectedDays.length, days]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.closeButton} onClick={onClose}>
          <button className={styles.close_btn} onClick={onClose}>X</button>
        </div>
        <div className={styles.nameModal}>
          <h2>Chọn ca</h2>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.shiftList}>
            <div className={styles.nameshiftList}>
              <h3>Danh sách ca</h3>
            </div>
            {shifts.map((shift) => (
              <div key={shift} className={styles.childrenshiftList}>
                <input
                  type="checkbox"
                  id={shift}
                  name={shift}
                  checked={selectedShifts.includes(shift)}
                  onChange={() => handleShiftChange(shift)}
                />
                <label htmlFor={shift}>{shift}</label>
              </div>
            ))}
          </div>
          <div className={styles.dayList}>
            <div className={styles.namedayList}>
              <h3>Chọn ngày</h3>
            </div>
            <div className={styles.containerdayList}>
              {days.map((day) => (
                <div key={day} className={styles.childrendayList}>
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    name={`day-${day}`}
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  <label htmlFor={`day-${day}`}>{day}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.confirmButton}>
          <button onClick={handleConfirm}>Đồng ý</button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
