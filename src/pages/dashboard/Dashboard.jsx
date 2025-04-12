import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/primitives/Modal";
import { updateIsModalOpen } from "../../redux/overlayElementsSlice";
import "./Dashboard.scss";

// Inner content of Modal. ie inputs, buttons, etc
const AddBorrowerModalContent = ({ closeModalHandler }) => {
  const dispatch = useDispatch();

  const handleBorrowerInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { borrower_name, borrower_id } = Object.fromEntries(
      formData.entries()
    );

    if (!borrower_name || !borrower_id) {
      toast.error("All fields are required");
      return;
    }

    try {
      toast.success("New borrower added successfully");
      handleModalClose();
    } catch (error) {
      toast.error("Error while adding new borrower");
      console.error(error.message);
    }
  };

  const handleModalClose = () => {
    dispatch(updateIsModalOpen(false));
    setTimeout(closeModalHandler, 300); // make sure the time matches with setTimeout in Modal.jsx and transition property of modal in app.scss
  };

  // This function will stop Enter key from submitting the form
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="add-borrower-modal-content">
      <form onSubmit={handleBorrowerInfoSubmit}>
        <div className="text-input">
          <label htmlFor="borrower-name">Customer Name</label>
          <input
            name="borrower_name"
            id="borrower_name"
            type="text"
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="text-input">
          <label htmlFor="borrower-id">Phone Number</label>
          <input
            name="borrower_id"
            id="borrower_id"
            type="text"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="buttons">
          <button type="submit">Create New Customer</button>
          <button onClick={handleModalClose} type="button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const [isAddBorrowerModalOpen, setIsAddBorrowerModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
      className="main-content-dashboard"
    >
      <div className="main-content-box">
        <div className="main-content-header">
          <button onClick={() => setIsAddBorrowerModalOpen((prev) => !prev)}>
            Add Customer
          </button>
          {isAddBorrowerModalOpen && (
            <Modal setIsModalOpen={setIsAddBorrowerModalOpen}>
              {
                <AddBorrowerModalContent
                  closeModalHandler={() => setIsAddBorrowerModalOpen(false)}
                  setOriginalAllBorrowersDetails={[]}
                />
              }
            </Modal>
          )}
          <input type="text" placeholder="Search..." />
        </div>
        <div className="main-content-table">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Created On</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr key={"uuid"}>
                <td style={{ textTransform: "capitalize" }}>
                  {"Omkar Deshpande"}
                </td>
                <td>24th April 2025</td>
                <td>
                  <button
                    onClick={() => navigate(`/dashboard/123`)}
                    style={{ width: "234px" }}
                  >
                    Data Verification
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
