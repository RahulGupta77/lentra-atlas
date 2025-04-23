import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { updateIsModalOpen } from "../../../redux/overlayElementsSlice";
import "./AllChecklistModal.scss";

const AllChecklistModal = ({ closeModalHandler, checklistData }) => {
  const dispatch = useDispatch();

  const handleModalClose = () => {
    dispatch(updateIsModalOpen(false));
    setTimeout(closeModalHandler, 300);
  };

  const checks = Array.isArray(checklistData) ? checklistData : [];

  return (
    <div className="all-checklist-modal">
      <div className="checklist-content">
        <h4 className="checklist-title">All Document Checks</h4>
        <ul className="checklist-items">
          {checks.length ? (
            checks.map((check, index) => (
              <li
                key={index}
                className={`checklist-item ${
                  check.is_enabled ? "enabled-check" : "disabled-check"
                }`}
              >
                <span
                  className="checklist-icon"
                  style={{
                    color: check.is_enabled ? "#3a9391" : "#ff3b30",
                    marginRight: "10px",
                    fontSize: "18px",
                  }}
                  data-tooltip-id="checklist-icon-tooltip"
                  data-tooltip-content={
                    check.is_enabled ? "Applied" : "Not Applied"
                  }
                >
                  {check.is_enabled ? <FaCheck /> : <FaTimes />}
                </span>
                <span className="check-description">{check.verbose}</span>
              </li>
            ))
          ) : (
            <div className="no-checks-applied">No Checks Applied</div>
          )}

          <Tooltip
            id="checklist-icon-tooltip"
            style={{
              color: "#fff",
              width: "fit-content",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.5",
            }}
          />
        </ul>
        <button className="close-button" onClick={handleModalClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AllChecklistModal;
