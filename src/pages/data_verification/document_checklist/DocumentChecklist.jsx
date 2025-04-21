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
  const [enabledChecklist, setEnabledChecklist] = useState(null);

  // Fetch document status
  useEffect(() => {
    const fetchAllDocsStatus = async () => {
      try {
        const response = await getAllDocsStatus(id);
        if (response.status === 200) {
          setDocsChecklist(response?.data?.documents || []);
        } else {
          toast.error("Failed to fetch document checklist. Please try again.");
          console.error("Error fetching document status:", response);
        }
      } catch (error) {
        toast.error("Something went wrong while fetching document checklist.");
        console.error("Exception in fetchAllDocsStatus:", error);
      }
    };

    if (id) {
      fetchAllDocsStatus();
    }
  }, [id, updateDocStatusTrigger]);

  // Fetch enabled checks
  useEffect(() => {
    const getAllEnabledChecksFromServer = async () => {
      try {
        const response = await getEnabledChecks(id);
        if (response.status === 200) {
          setEnabledChecklist(response?.data?.checks || {});
        } else {
          toast.error("Failed to fetch enabled checks.");
          console.error("Error fetching enabled checks:", response);
        }
      } catch (error) {
        toast.error("Something went wrong while fetching enabled checks.");
        console.error("Exception in getAllEnabledChecksFromServer:", error);
      }
    };

    if (id) {
      getAllEnabledChecksFromServer();
    }
  }, [id]);

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
                    checklistData={enabledChecklist}
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
