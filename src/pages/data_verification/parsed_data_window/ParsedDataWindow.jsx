import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../../components/primitives/Modal";
import { getAllDocsStatus } from "../../../services/dashboardService";
import { get_document_meta_data } from "../../../services/ParsedDataWindowService";
import DocumentViewer from "./DocumentViewer";
import "./ParsedDataWindow.scss";
import SubmitModal from "./SubmitModal";

const ParsedDataWindow = ({ updateDocStatusTrigger }) => {
  const { id } = useParams();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [documentData, setDocumentData] = useState([]);
  const [documentStatusData, setDocumentStatusData] = useState([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const fetchDocumentsFromServer = async () => {
      const response = await get_document_meta_data(id);
      setDocumentData(response.data);
    };

    fetchDocumentsFromServer();
  }, [trigger, id]);

  useEffect(() => {
    const fetchAllDocsStatus = async () => {
      try {
        const response = await getAllDocsStatus(id);
        if (response.status === 200) {
          setDocumentStatusData(response?.data?.documents || []);
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

  useEffect(() => {
    const pusher = new Pusher("9867b5a5cb231094924f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(id);

    // Bind to the parsed_data_lentra_poc event
    channel.bind("parsed_data_lentra_poc", (payload) => {
      try {
        const { status } = payload;

        if (status) {
          setTrigger((prev) => !prev);
        }
      } catch (error) {
        console.error("Error processing Pusher payload:", error.message);
      }
    });

    // Cleanup function to unsubscribe and disconnect
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [id]);

  return (
    <div className="parsed-data-window">
      <div className="parsed-data-window-header">
        <h2>Parsed Data</h2>
        <button onClick={() => setIsSubmitModalOpen(true)}>Submit Data</button>

        {isSubmitModalOpen && (
          <Modal setIsModalOpen={setIsSubmitModalOpen}>
            {
              <SubmitModal
                closeModalHandler={() => setIsSubmitModalOpen(false)}
                documentData={documentData}
                documentStatusData={documentStatusData}
              />
            }
          </Modal>
        )}
      </div>
      {documentData.length > 0 ? (
        <DocumentViewer documents={documentData} />
      ) : (
        <p
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            height: "300px",
          }}
        >
          No data available
        </p>
      )}
    </div>
  );
};

export default ParsedDataWindow;
