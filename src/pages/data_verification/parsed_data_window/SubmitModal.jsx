import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateIsModalOpen } from "../../../redux/overlayElementsSlice";
import { submit_parsed_details } from "../../../services/submitDetails";
import "./SubmitModal.scss";

const SubmitModal = ({
  closeModalHandler,
  documentStatusData = [],
  documentData = [],
}) => {
  const documentTypeMap = {
    PAN: "PAN Card",
    GST_CERT: "GST Certificate",
    UDYAM_CERT: "UDYAM Certificate",
    EBILL: "Electricity Bill",
    BANK_STATEMENT: "Bank Statement",
  };

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "ISSUES":
        return "status-issues";
      case "VERIFIED":
        return "status-verified";
      case "SKIPPED":
        return "status-skipped";
      default:
        return "status-pending";
    }
  };

  const handleModalClose = () => {
    dispatch(updateIsModalOpen(false));
    setTimeout(closeModalHandler, 300);
  };

  const handleUserSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await submit_parsed_details(id);

      if (
        response?.status === 200 &&
        response?.data?.message === "application submitted"
      ) {
        alert("Submission successful!");
        navigate("/success/" + id);
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-modal">
      <h2>Extracted Document Details</h2>
      <div className="cards-container">
        {documentStatusData.length ? (
          documentStatusData.map((doc, index) => {
            const parsedDoc = documentData.find(
              (p) => p.document_type === documentTypeMap[doc.document_type]
            );
            return (
              <div
                key={index}
                className={`document-card ${getStatusClass(doc.status)}`}
              >
                <div className="header">
                  <h3>{documentTypeMap[doc.document_type]} Fields</h3>
                  <span
                    className={`status-badge ${getStatusClass(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="extracted-fields">
                  {parsedDoc && parsedDoc.meta_data ? (
                    <ul>
                      {Object.entries(parsedDoc.meta_data).map(
                        ([key, value]) => (
                          <li key={key}>
                            <strong>
                              {key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                              :
                            </strong>{" "}
                            {value.value || "Not Available"}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>No extracted fields available</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data-to-display"> No Data to Display</div>
        )}
      </div>
      <div className="button-container">
        <button
          onClick={handleUserSubmit}
          disabled={!documentStatusData.length || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? "Submitting..." : "Submit Details"}
        </button>
        <button
          onClick={handleModalClose}
          className="cancel-button"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SubmitModal;
