import axios from "axios";
import { useRef, useState } from "react";
import "./SageDashboard.scss";
import { createS3UrlOfFile } from "../../services/LlmTestService";

const SageDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [s3UrlLoading, setS3UrlLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [promptName, setPromptName] = useState("MSME_OD");
  // const PROMPT_OPTIONS = ["MSME", "TW", "CDL", "BFSI", "EDUCATON", "KOTAK", "LAP"];
  const PROMPT_OPTIONS = ["MSME_OD", "TW", "CDL", "LAP", "OTHER", "V3_API"];
  const [responseS3Url, setResponseS3Url] = useState(null);
  const [s3UrlInput, setS3UrlInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Generate a random flow_id
  const generateFlowId = () => {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `flow_${timestamp}_${randomString}`;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("No access token found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("prompt_name", promptName);
    
    // Add prompt field only if prompt_name is "OTHER"
    if (promptName === "OTHER") {
      formData.append("custom_prompt", customPrompt);
    }

    try {
      const response = await axios.post(
        "https://dev4.kreditmind.com/internal/modeltest",
        formData,
        {
          headers: {
            Token: accessToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle both types of responses
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResponse(response.data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error uploading file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const createS3URL = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setS3UrlLoading(true);
    setError(null);
    setResponseS3Url(null);

    try {
      const response = await createS3UrlOfFile(selectedFile);
      console.log("S3 URL Response:", response);
      
      if (response.status === 200 && response.data.presigned_url) {
        setResponseS3Url(response.data.presigned_url);
        setS3UrlInput(response.data.presigned_url); // Auto-fill the input
      } else {
        setError(response.data?.error || "Failed to create S3 URL");
      }
    } catch (error) {
      console.error("Error creating S3 URL:", error);
      setError("Error creating S3 URL. Please try again.");
    } finally {
      setS3UrlLoading(false);
    }
  };

  const handleS3UrlUpload = async () => {
    if (!s3UrlInput.trim()) {
      setError("Please enter an S3 URL.");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("No access token found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const requestData = {
        flow_id: generateFlowId(),
        file_url: s3UrlInput,
        prompt_name: promptName
      };
      
      // Add prompt field only if prompt_name is "OTHER"
      if (promptName === "OTHER") {
        requestData.custom_prompt = customPrompt;
      }

      const productionUrl = "https://uat-integrations.kreditmind.com/v2/verification/internal/sage";
      const developmentUrl = "http://localhost:5000/v2/verification/internal/sage";

      const response = await axios.post(
        productionUrl,
        requestData,
        {
          headers: {
            Token: accessToken,
            "Content-Type": "application/json",
          },
        }
      );


      // if (response.data.error) {
      //   setError(response.data.error);
      // } else {
      //   setResponse(response.data);
      // }

      setResponse(response.data);
    } catch (error) {
      console.error("Error uploading S3 URL:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error uploading S3 URL. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log("URL copied to clipboard");
    });
  };

  return (
    <div className="sage-dashboard">
      <div className="sage-dashboard__container">
        <h1 className="sage-dashboard__title">Image Upload Dashboard</h1>

        <div className="sage-dashboard__upload-section">
          <div className="sage-dashboard__step">
            <h3 style={{marginBottom: "10px"}}>Step 1: Select File and Create S3 URL</h3>
            <input
              ref={fileInputRef}
              accept="image/*,application/pdf"
              type="file"
              onChange={handleFileSelect}
              className="sage-dashboard__file-input"
              id="image-upload"
            />
            <button
              className="sage-dashboard__upload-button"
              onClick={handleSelectClick}
            >
              Select File
            </button>
            
            {selectedFile && (
              <button
                className="sage-dashboard__upload-button"
                onClick={createS3URL}
                disabled={s3UrlLoading}
                style={{ marginLeft: "10px" }}
              >
                {s3UrlLoading ? "Creating S3 URL..." : "Create S3 URL"}
              </button>
            )}

            {responseS3Url && (
              <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ color: "green", fontWeight: "bold" }}>Generated S3 URL:</span>
                </div>
                <div style={{ 
                  wordBreak: "break-all", 
                  backgroundColor: "white", 
                  padding: "8px", 
                  borderRadius: "3px",
                  border: "1px solid #ccc",
                  marginBottom: "10px"
                }}>
                  {responseS3Url}
                </div>
                <button
                  onClick={() => copyToClipboard(responseS3Url)}
                  style={{ 
                    padding: "5px 10px", 
                    backgroundColor: "#007bff", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Copy URL
                </button>
              </div>
            )}
          </div>

          <div className="sage-dashboard__step">
            <h3>Step 2: Upload S3 URL</h3>
            <input
              type="text"
              placeholder="Enter S3 URL or use the generated one above"
              className="sage-dashboard__input"
              value={s3UrlInput}
              onChange={(e) => setS3UrlInput(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button
              className="sage-dashboard__upload-button"
              onClick={handleS3UrlUpload}
              disabled={loading || !s3UrlInput.trim()}
            >
              {loading ? "Uploading..." : "Upload S3 URL"}
            </button>
          </div>
        </div>

        <form
          className="sage-dashboard__prompt-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <label
            htmlFor="prompt-select"
            className="sage-dashboard__prompt-label"
          >
            Select Prompt:
          </label>
          <select
            id="prompt-select"
            className="sage-dashboard__prompt-select"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
          >
            {PROMPT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </form>

        {promptName === "OTHER" && (
          <div className="sage-dashboard__custom-prompt-section">
            <label
              htmlFor="custom-prompt"
              className="sage-dashboard__prompt-label"
            >
              Custom Prompt:
            </label>
            <textarea
              id="custom-prompt"
              className="sage-dashboard__custom-prompt-textarea"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt here..."
              rows={6}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "120px"
              }}
            />
          </div>
        )}

        {preview && selectedFile && (
          <div className="sage-dashboard__preview-section">
            <h2 className="sage-dashboard__preview-section-title">Preview:</h2>
            {selectedFile.type === "application/pdf" ? (
              <iframe
                src={preview}
                title="PDF Preview"
                className="sage-dashboard__preview-section-pdf sage-dashboard__preview-section-media"
                width="300"
                height="300"
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="sage-dashboard__preview-section-image sage-dashboard__preview-section-media"
                width="300"
                height="300"
              />
            )}
          </div>
        )}


        {error && (
          <div className="sage-dashboard__error">
            <h3 className="sage-dashboard__error-title">Error:</h3>
            <pre className="sage-dashboard__error-content">{error}</pre>
          </div>
        )}

        {response && (
          <div className="sage-dashboard__response-container">
            {/* JSON Data Section */}
            <div className="sage-dashboard__response-section">
              <h2 className="sage-dashboard__response-section-title">
                JSON Data
              </h2>
              <div className="sage-dashboard__response-section-content">
                {response?.data && (
                  <div className="sage-dashboard__json-section">
                    <pre className="sage-dashboard__json-content">
                      {JSON.stringify(response?.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Error Section */}
            {response?.error && (
              <div className="sage-dashboard__response-section" style={{ border: '2px solid #f44336', borderRadius: '8px' }}>
                <h2 className="sage-dashboard__response-section-title" style={{ color: '#d32f2f' }}>
                  Error
                </h2>
                <div className="sage-dashboard__response-section-content">
                  <div className="sage-dashboard__json-section">
                    <pre className="sage-dashboard__json-content" style={{ color: '#d32f2f' }}>
                      {JSON.stringify(response?.error, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Meta Section */}
            {response?.meta && (
              <div className="sage-dashboard__response-section">
                <h2 className="sage-dashboard__response-section-title">
                  Meta
                </h2>
                <div className="sage-dashboard__response-section-content">
                  <div className="sage-dashboard__json-section">
                    <pre className="sage-dashboard__json-content">
                      {JSON.stringify(response?.meta, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* SAGE RAW Response Section */}
            {response?.response_text && (
              <>
                {/* Raw Response Section */}
                <div className="sage-dashboard__response-section">
                  <h2 className="sage-dashboard__response-section-title">
                    SAGE'S RAW Response
                  </h2>
                  <div className="sage-dashboard__raw-response-content">
                    <pre className="sage-dashboard__raw-text">
                      {response?.response_text}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SageDashboard;
