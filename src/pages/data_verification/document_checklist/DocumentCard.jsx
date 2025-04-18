import React from "react";
import { FiAlertCircle, FiCheckCircle, FiMinusCircle } from "react-icons/fi";
import "./DocumentCard.scss";

const statusMap = {
  VERIFIED: {
    label: "Verified",
    icon: <FiCheckCircle size={16} />,
    className: "verified",
  },
  PENDING: {
    label: "Pending",
    icon: <FiMinusCircle size={16} />,
    className: "pending",
  },
  ISSUES: {
    label: "Issues Found",
    icon: <FiAlertCircle size={16} />,
    className: "issues",
  },
  SKIPPED: {
    label: "SKIPPED",
    icon: <FiMinusCircle size={16} />,
    className: "skip",
  },
};

const formatLabel = (type) => {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const DocumentCard = ({ documentType, status, created_at }) => {
  const statusInfo = statusMap[status] || {};
  console.log(statusInfo, status);
  return (
    <div className={`document-card ${statusInfo.className}`}>
      <div className="top">
        <span className="doc-type">{formatLabel(documentType)}</span>
        <span className={`status label-${statusInfo.className}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </div>
      <p className="date">
        {created_at ? `Uploaded ${created_at}` : "File Upload Pending"}
      </p>
    </div>
  );
};

export default DocumentCard;
