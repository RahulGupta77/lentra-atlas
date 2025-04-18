import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_document_meta_data } from "../../../services/ParsedDataWindowService";
import DocumentViewer from "./DocumentViewer";

const ParsedDataWindow = () => {
  const { id } = useParams();

  const [documentData, setDocumentData] = useState([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const fetchDocumentsFromServer = async () => {
      const response = await get_document_meta_data(id);
      setDocumentData(response.data);
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

    // Cleanup function to unsubscribe and disconnect
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [id]);

  return (
    <div className="parsed-data-window">
      <h3 style={{ marginLeft: "10px" }}>Parsed Data</h3>
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
