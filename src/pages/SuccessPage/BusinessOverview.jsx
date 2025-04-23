import React from "react";
import "./SuccessPage.scss";

const BusinessOverview = ({ data }) => {
  return (
    <div className="card">
      <h2 className="section-title">
        <span className="icon">📍</span> Business Overview
      </h2>
      <div className="grid">
        <p>
          <strong>Business Type:</strong> {data.businessType}
        </p>
        <p>
          <strong>Location:</strong> {data.location}
        </p>
        <p>
          <strong>Udyam Registration:</strong> {data.udyamRegistration.icon}{" "}
          {data.udyamRegistration.status}
        </p>
        <p>
          <strong>Electricity Bill:</strong> {data.electricityBill.icon}{" "}
          {data.electricityBill.status}
        </p>
        <p>
          <strong>Shop Act License:</strong> {data.shopActLicense.icon}{" "}
          {data.shopActLicense.status}
        </p>
        <p>
          <strong>Captured Images:</strong> {data.capturedImages.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default BusinessOverview;
