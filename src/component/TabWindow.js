import React, { useState } from "react";


const TabWindow = ({ title, onClose, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setPosX(e.clientX);
    setPosY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - posX;
      const dy = e.clientY - posY;
      setPosX(e.clientX);
      setPosY(e.clientY);
      document.getElementById('tabWindow').style.left = `${document.getElementById('tabWindow').offsetLeft + dx}px`;
      document.getElementById('tabWindow').style.top = `${document.getElementById('tabWindow').offsetTop + dy}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div id="tabWindow" className="tab-window" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="tab-header" onMouseDown={handleMouseDown}>
        <span>{title}</span>
        <button onClick={onClose}>x</button>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  );
};

export default TabWindow;
