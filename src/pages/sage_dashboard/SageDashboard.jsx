import axios from "axios";
import { useRef, useState } from "react";
import "./SageDashboard.scss";

const SageDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [promptName, setPromptName] = useState("MSME");
  const PROMPT_OPTIONS = ["MSME", "TW", "CDL", "BFSI", "EDUCATON", "KOTAK"];

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

  return (
    <div className="sage-dashboard">
      <div className="sage-dashboard__container">
        <h1 className="sage-dashboard__title">Image Upload Dashboard</h1>

        <div className="sage-dashboard__upload-section">
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
            Select Image
          </button>
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

        {selectedFile && (
          <div className="sage-dashboard__upload-section">
            <button
              className="sage-dashboard__upload-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <span className="sage-dashboard__loading" />
              ) : (
                "Upload Image"
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="sage-dashboard__error">
            <h3 className="sage-dashboard__error-title">Error:</h3>
            <pre className="sage-dashboard__error-content">{error}</pre>
          </div>
        )}

        {response && (
          <div className="sage-dashboard__response-section">
            <h2 className="sage-dashboard__response-section-title">
              API Response:
            </h2>
            <pre className="sage-dashboard__response-section-content">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SageDashboard;
