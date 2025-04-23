import React from "react";
import "./SuccessPage.scss";

const ListSection = ({ title, items, icon, className }) => {
  return (
    <div className="card">
      <h2 className={`section-title ${className}`}>
        <span className="icon">{icon}</span> {title}
      </h2>
      <ul className="list">
        {items.map((item, index) => (
          <li key={index} className="list-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListSection;
