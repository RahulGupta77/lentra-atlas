import React from "react";
import "./SuccessPage.scss";

const ListSection = ({ title, items, icon, className, subTitle }) => {
  return (
    <div className={`card card-bg-${className}`}>
      <h2 className={`section-title ${className}`}>
        <span className="icon">{icon}</span> {title}
      </h2>
      {subTitle && <h3>{subTitle}</h3>}
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
