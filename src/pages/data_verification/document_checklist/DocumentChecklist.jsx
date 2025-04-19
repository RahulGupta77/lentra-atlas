import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../../components/primitives/Modal";
import { getAllDocsStatus } from "../../../services/dashboardService";
import { getEnabledChecks } from "../../../services/getEnabledChecks";
import AllChecklistModal from "./AllChecklistModal";
import DocumentCard from "./DocumentCard";
import "./DocumentChecklist.scss";

const DocumentChecklist = ({ updateDocStatusTrigger }) => {
  const { id } = useParams();
  const [docsChecklist, setDocsChecklist] = useState([]);
  const [isShowChecklistModalOpen, setIsShowChecklistModalOpen] =
    useState(false);

  const checklistData = {
    cross_checks: {
      EBILL_GST_ADDRESS: "Address match between E-Bill and GST certificate.",
      EBILL_UDYAM_ADDRESS:
        "Address match between E-Bill and Udyam certificate.",
      PAN_EBILL_NAME: "Name match between PAN and E-BILL.",
      PAN_USERNAME_CHECK: "Name match between PAN and Username.",
      UDAYM_GST_ADDRESS:
        "Address name match between Udyam certificate and GST.",
      UDAYM_GST_COMPANY_NAME:
        "Company's name match between Udyam and GST certificate.",
    },
  };

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
  }, [id, updateDocStatusTrigger]);

  useEffect(() => {
    const getAllEnabledChecksFromServer = async () => {
      const response = await getEnabledChecks(id);

      console.log(response);
    };

    getAllEnabledChecksFromServer();
  }, []);

  const total = 5;
  const uploaded = docsChecklist.filter((doc) => doc.created_at).length;

  return (
    <div className="document-checklist">
      <div className="header">
        <div>
          <h3>Document Checklist</h3>
          <p>Required documents for verification</p>
        </div>
        <div className="sub-header-2">
          <div className="upload-progress">
            <div className="circle">{`${Math.floor(
              (uploaded / total) * 100
            )}%`}</div>
            <p>
              {`${uploaded} of ${total}`}
              <br />
              Documents Uploaded
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsShowChecklistModalOpen(true)}
              type="button"
              className="show-all-checks"
            >
              {"View All Document Checks"}
            </button>

            {isShowChecklistModalOpen && (
              <Modal setIsModalOpen={setIsShowChecklistModalOpen}>
                {
                  <AllChecklistModal
                    closeModalHandler={() => setIsShowChecklistModalOpen(false)}
                    checklistData={checklistData}
                  />
                }
              </Modal>
            )}
          </div>
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
