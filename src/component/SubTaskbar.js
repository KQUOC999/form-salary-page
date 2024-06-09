import React from "react";
import './SubTaskbar.css'

const SubTaskbar = ({ items, onSelect }) => {
  return (
    <div className="sub-taskbar">
      {items && items.map((item, index) => (
        <div className="subTaskbar-items" key={index} onClick={() => onSelect(item)}>
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default SubTaskbar;
