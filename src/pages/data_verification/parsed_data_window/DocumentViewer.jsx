import React from "react";
import "./DocumentViewer.scss";

const DocumentViewer = ({ documents }) => {
  console.log(documents);

  const renderMetaData = (metaData) => {
    // Check if metaData has data array (first type of object)
    if (Array.isArray(metaData?.data)) {
      return metaData?.data?.map((pageData, pageIndex) => (
        <div key={pageIndex} className="page-data">
          {pageIndex > 0 && <div className="page-separator" />}
          <div className="page-header">
            Page {pageData?._page_number} of {pageData?._total_pages}
          </div>
          {Object.entries(pageData || {})
            .filter(([key]) => !key.startsWith("_")) // Filter out internal fields
            .map(([field, data]) => (
              <div key={field} className="field-box">
                <label>{field.replace(/_/g, " ").toUpperCase()}</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={
                      Array.isArray(data?.value)
                        ? data?.value.join(", ")
                        : data?.value || ""
                    }
                    readOnly
                    className="read-only-input"
                  />
                  <span className="confidence">
                    {data?.confidence_score
                      ? `${(data?.confidence_score * 100).toFixed(2)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      ));
    }

    // Second type of object (direct meta_data fields)
    return Object.entries(metaData || {})?.map(([field, data]) => (
      <div key={field} className="field-box">
        <label>{field?.replace(/_/g, " ")?.toUpperCase()}</label>
        <div className="input-group">
          <input
            type="text"
            value={data?.value || ""}
            readOnly
            className="read-only-input"
          />
          <span className="confidence">
            {data?.confidence_score
              ? `${(data?.confidence_score * 100).toFixed(2)}%`
              : "N/A"}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="document-container">
      {documents?.map((doc, index) => (
        <div key={index} className="document-box">
          <div className="document-type-container">
            <h3 className="document-title">
              {doc?.document_type || "Untitled Document"}
            </h3>
            <p className="document-file-name">{doc?.file_name || ""}</p>
          </div>
          <div className="meta-data">{renderMetaData(doc?.meta_data)}</div>
        </div>
      ))}
    </div>
  );
};

export default DocumentViewer;
