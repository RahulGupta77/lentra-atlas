import Pusher from "pusher-js";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { send_file_to_llm } from "../../../services/chatService";
import { get_current_account_document_meta_data } from "../../../services/ParsedDataWindowService";
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
      const response = await get_current_account_document_meta_data(id);
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
    channel.bind("current_account_direct_notification", (payload) => {
      try {
        const { status, message } = payload;

        if (status === "failed") {
          toast.error(message, { autoClose: 10000 }); // 10 seconds
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

  const handleFileUpload = async (files) => {
    // Check if more than 2 files are selected
    if (files.length > 1) {
      toast.error("You can only upload a maximum of 1 file at once.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Process each file
      for (const file of files) {
        if (
          !file.type.startsWith("image/") &&
          file.type !== "application/pdf"
        ) {
          toast.error(
            `${file.name} is not a valid file type. Only images and PDFs are allowed.`
          );
          continue;
        }

        await send_file_to_llm(
          id,
          file,
          file.type.startsWith("image/") ? "image" : "pdf",
          "current-account"
        );
      }

      setTrigger((prev) => !prev);
    } catch (error) {
      toast.error("File upload failed.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="parsed-data-window">
      <div className="parsed-data-window-header">
        <h2>Current Account Documents</h2>
        <label
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
          htmlFor="image-upload"
          onClick={(e) => {
            if (loading) {
              e.preventDefault(); // ⛔️ Prevent file dialog from opening
            }
          }}
        >
          {loading ? (
            <span className="parsed-loading-state"></span>
          ) : (
            "Upload Files"
          )}
        </label>
        <input
          id="image-upload"
          type="file"
          accept=".jpg, .jpeg, .png, .webp, .pdf, .tif, .tiff"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            setLoading(true);
            handleInputChange(e);
          }}
          disabled={loading}
          multiple
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
