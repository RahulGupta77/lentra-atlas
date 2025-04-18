import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllDocsStatus } from "../../../services/dashboardService";
import DocumentCard from "./DocumentCard";
import "./DocumentChecklist.scss";

const DocumentChecklist = () => {
  const { id } = useParams();
  const [docsChecklist, setDocsChecklist] = useState([]);

  useEffect(() => {
    const fetchAllDocsStatus = async () => {
      const response = await getAllDocsStatus(id);
      if (response.status === 200) {
        setDocsChecklist(response?.data?.documents || []);
      } else {
        toast.error("Unable to fetch Document Checklists");
      }
    };

    fetchAllDocsStatus();
  }, [id]);

  const total = 5;
  const uploaded = docsChecklist.filter(
    (doc) => doc.status === "VERIFIED"
  ).length;

  console.log(docsChecklist);

  return (
    <div className="document-checklist">
      <div className="header">
        <div>
          <h3>Document Checklist</h3>
          <p>Required documents for verification</p>
        </div>
        <div className="upload-progress">
          <div className="circle">{`${Math.floor(
            (uploaded / total) * 100
          )}%`}</div>
          <p>
            {`${uploaded} of ${total}`}
            <br />
            Documents Verified
          </p>
        </div>
      </div>

      <div className="docs-container">
        {docsChecklist.map((doc, idx) => (
          <DocumentCard
            key={idx}
            documentType={doc.document_type}
            status={doc.status}
            created_at={doc.created_at}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentChecklist;
