import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/primitives/Modal";
import { updateIsModalOpen } from "../../redux/overlayElementsSlice";
import { addCustomer, getAllCustomer } from "../../services/dashboardService";
import "./Dashboard.scss";

// Inner content of Modal. ie inputs, buttons, etc
const AddBorrowerModalContent = ({ closeModalHandler, setAllCustomers }) => {
  const dispatch = useDispatch();

  const crossChecks = {
    EBILL_GST_ADDRESS: "Address match between E-Bill and GST certificate.",
    EBILL_UDYAM_ADDRESS: "Address match between E-Bill and Udyam certificate.",
    PAN_EBILL_NAME: "Name match between PAN and E-BILL.",
    PAN_USERNAME_CHECK: "Name match between PAN and Username.",
    UDAYM_GST_ADDRESS: "Address name match between Udyam certificate and GST.",
    UDAYM_GST_COMPANY_NAME:
      "Company's name match between Udyam and GST certificate.",
  };

  const handleBorrowerInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { borrower_name, borrower_id, ...checks } = Object.fromEntries(
      formData.entries()
    );

    if (!borrower_name || !borrower_id) {
      toast.error("All fields are required");
      return;
    }

    const isValidPhone = /^\d{10}$/.test(borrower_id);
    if (!isValidPhone) {
      toast.error("Customer phone number must be a valid 10-digit number!");
      return;
    }

    try {
      const response = await addCustomer(
        borrower_name,
        borrower_id,
        Object.keys(checks)
      );

      if (response.status !== 201) {
        throw new Error("Error while adding customer!");
      }

      setAllCustomers((prev) => [response.data, ...prev]);
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
          <label htmlFor="borrower-name">Customer First Name</label>
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

        <div className="checklist-section">
          <h3>Verification Checks Applied</h3>
          <div className="checklist">
            {Object.entries(crossChecks).map(([key, description]) => (
              <label key={key} className="checklist-item">
                <input defaultChecked type="checkbox" name={key} value={key} />
                <span>{description}</span>
              </label>
            ))}
          </div>
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
  const [allcustomers, setAllCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Unauthorized: No token found");
          return;
        }
        const response = await getAllCustomer();
        setAllCustomers(response.data.customer_users);
      } catch (error) {
        console.error("Failed to fetch customers", error);
        toast.error(
          error?.response?.data?.error ||
            "Something went wrong while fetching customers"
        );
      }
    };

    fetchCustomers();
  }, []);

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
                  setAllCustomers={setAllCustomers}
                />
              }
            </Modal>
          )}
          <input type="text" disabled={true} placeholder="Search..." />
        </div>
        <div className="main-content-table">
          <table>
            <thead>
              <tr>
                <th>Customer First Name</th>
                <th>Phone Number</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allcustomers.length ? (
                <>
                  {allcustomers.map((customer) => (
                    <tr key={customer.uuid}>
                      <td style={{ textTransform: "capitalize" }}>
                        {customer.name}
                      </td>
                      <td>{customer.phone_number}</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/${customer.uuid}`)
                          }
                          style={{ width: "234px" }}
                        >
                          Data Verification
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "18px",
                    }}
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
