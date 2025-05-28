import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/primitives/Modal";
import { updateIsModalOpen } from "../../redux/overlayElementsSlice";
import { addCustomer, getAllCustomer } from "../../services/dashboardService";
import {
  captureException,
  logger,
  startSpan,
  withTransaction,
} from "../../utils/sentry";
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

    // Use the modern withTransaction approach
    return withTransaction("Add Borrower Flow", "user-action", async () => {
      const formData = new FormData(e.currentTarget);
      const { borrower_name, borrower_id, ...checks } = Object.fromEntries(
        formData.entries()
      );

      if (!borrower_name || !borrower_id) {
        logger.warn("Attempt to add borrower with empty fields");
        toast.error("All fields are required");
        return;
      }

      const isValidPhone = /^\d{10}$/.test(borrower_id);
      if (!isValidPhone) {
        logger.warn("Invalid phone number format", {
          providedNumber: borrower_id,
        });
        toast.error("Customer phone number must be a valid 10-digit number!");
        return;
      }

      try {
        const response = await startSpan(
          {
            op: "http.client",
            name: "Add Customer API Call",
          },
          async () => {
            return await addCustomer(
              borrower_name,
              borrower_id,
              Object.keys(checks)
            );
          }
        );

        if (response.status !== 201) {
          throw new Error("Error while adding customer!");
        }

        setAllCustomers((prev) => [response.data, ...prev]);
        toast.success("New borrower added successfully");
        handleModalClose();
        logger.info("New borrower added successfully", {
          borrower_name,
          borrower_id,
        });
      } catch (error) {
        logger.error("Error while adding new borrower", {
          error: error.message,
          borrower_name,
          borrower_id,
        });
        captureException(error, {
          location: "Add Borrower API Call",
          borrower_name,
          borrower_id,
        });
        toast.error("Error while adding new borrower");
      }
    });
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
          <h3>MSME Overdraft Checks to be Applied</h3>
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
      // Use the modern withTransaction approach
      return withTransaction("Fetch Customers Flow", "data-fetch", async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            logger.warn("Unauthorized access attempt: No token found");
            toast.error("Unauthorized: No token found");
            return;
          }

          const response = await startSpan(
            {
              op: "http.client",
              name: "Get All Customers API Call",
            },
            async () => {
              return await getAllCustomer();
            }
          );

          setAllCustomers(response.data.customer_users);
          logger.info("Fetched all customers successfully");
        } catch (error) {
          logger.error("Failed to fetch customers", {
            error: error.message,
          });
          captureException(error, {
            location: "Fetch Customers API Call",
          });
          toast.error(
            error?.response?.data?.error ||
              "Something went wrong while fetching customers"
          );
        }
      });
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
                <th>Data Verification</th>
                {/* <th></th> */}
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
                          onClick={() => {
                            navigate(`/cdl/${customer.uuid}`);
                          }}
                          style={{ width: "200px" }}
                        >
                          Consumer Durable
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            navigate(`/loan/${customer.uuid}`);
                          }}
                          style={{ width: "200px" }}
                        >
                          Two Wheeler Loan
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (customer.is_submitted) {
                              navigate(`/success/${customer.uuid}`);
                            } else {
                              navigate(`/dashboard/${customer.uuid}`);
                            }
                          }}
                          style={{ width: "200px" }}
                        >
                          MSME Overdraft
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
