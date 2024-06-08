import React from "react";
import { Link } from 'react-router-dom';
import './SubTaskbar.css'

const SubTaskbar = ({ items }) => {
  return (
    <div className="sub-taskbar">
      {items && items.map((item, index) => (
        <div className = "subTaskbar-items" key={index}>
          <Link to={item.path}>
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SubTaskbar;
