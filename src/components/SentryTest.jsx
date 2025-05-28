import React from "react";
import { captureException } from "../utils/sentry";

const SentryTest = () => {
  const handleError = () => {
    try {
      throw new Error("This is your first error!");
    } catch (error) {
      captureException(error, {
        tags: {
          location: "SentryTest Component",
          test: "error-tracking",
        },
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sentry Error Test</h2>
      <button
        onClick={handleError}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff3b30",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Break the world
      </button>
    </div>
  );
};

export default SentryTest;
