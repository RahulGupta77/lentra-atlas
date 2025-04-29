import Pusher from "pusher-js";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { send_file_to_llm } from "../../../services/chatService";
import { get_tw_document_meta_data } from "../../../services/ParsedDataWindowService";
import DocumentViewer from "./DocumentViewer";
import "./ParsedDataWindow.scss";

const ParsedDataWindow = ({ updateDocStatusTrigger }) => {
  const { id } = useParams();

  const [documentData, setDocumentData] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocumentsFromServer = async () => {
      const response = await get_tw_document_meta_data(id);
      // const renameData = renameBankStatements(response?.data || []);
      setDocumentData(response?.data || []);
    };

    fetchDocumentsFromServer();
  }, [trigger, id]);

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

    // Bind to the parsed_data_lentra_poc event
    channel.bind("direct_notification", (payload) => {
      try {
        const { status, message } = payload;

        if (status === "failed") {
          toast.error(message, { autoClose: 10000 }); // 8 seconds
        } else if (status === "passed") {
          toast.success(message, { autoClose: 10000 });
        }

        setLoading(false);
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

  const handleFileUpload = async (file) => {
    // Check if the file is an image or PDF
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      console.error("Only image and PDF files are allowed.");
      return;
    }

    const url = URL.createObjectURL(file);

    const response = await send_file_to_llm(
      id,
      file,
      file.type.startsWith("image/") ? "image" : "pdf",
      true
    );

    setTrigger((prev) => !prev);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, fileInputRef);
    }
  };

  return (
    <div className="parsed-data-window">
      <div className="parsed-data-window-header">
        <h2>Two Wheeler Loan Documents</h2>
        <label htmlFor="image-upload">
          {loading ? (
            <span className="parsed-loading-state"></span>
          ) : (
            "Upload Files"
          )}
        </label>
        <input
          id="image-upload"
          type="file"
          accept=".jpg, .jpeg, .png, .webp, .pdf"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            setLoading(true);
            handleInputChange(e);
          }}
        />
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
