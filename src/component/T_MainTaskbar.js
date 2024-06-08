import React from "react";
import { Link } from 'react-router-dom';
import './Taskbar.css'

const Taskbar = ({ items, onSelect }) => {
  return (
    <>
      {items && items.map((item, index) => (
        <div className= "taskbar-items" key={index} onClick={() => onSelect(item)}>
          <Link to={item.path}>
            {item.label}
          </Link>
        </div>
      ))}
      </>
  );
};

export default Taskbar;
