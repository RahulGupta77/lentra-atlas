import React from "react";
import { useDispatch } from "react-redux";
import { updateIsModalOpen } from "../../../redux/overlayElementsSlice";
import "./AllChecklistModal.scss";

const AllChecklistModal = ({ closeModalHandler, checklistData }) => {
  const dispatch = useDispatch();

  const handleModalClose = () => {
    dispatch(updateIsModalOpen(false));
    setTimeout(closeModalHandler, 300);
  };

  return (
    <div className="all-checklist-modal">
      <div className="checklist-content">
        <h4 className="checklist-title">All Document Checks</h4>
        <ul className="checklist-items">
          {checklistData?.cross_checks &&
            Object.values(checklistData.cross_checks).map((value, index) => (
              <li key={index} className="checklist-item">
                <span className="check-description">{value}</span>
              </li>
            ))}
        </ul>
        <button className="close-button" onClick={handleModalClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AllChecklistModal;
