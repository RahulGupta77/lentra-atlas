import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ParsedDataWindow = () => {
  const [data, setData] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const pusher = new Pusher("9867b5a5cb231094924f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(id);

    // Bind to the parsed_data_lentra_poc event
    channel.bind("parsed_data_lentra_poc", (payload) => {
      try {
        console.log("Raw payload:", JSON.stringify(payload, null, 2));
        // Normalize payload to always work with an array
        const normalizedData = Array.isArray(payload) ? payload : [payload];
        setData(normalizedData);
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

  // Recursive component to render nested data
  const RenderNestedData = ({ data, level = 0 }) => {
    // Handle null, undefined, or non-object primitives
    if (data === null || data === undefined) {
      return <span className="text-gray-500">N/A</span>;
    }

    if (typeof data !== "object") {
      return <span className="text-blue-600">{String(data)}</span>;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return (
        <div className={`ml-${level * 4}`}>
          {data.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold text-gray-700">
                [Item {index}]
              </span>
              <RenderNestedData data={item} level={level + 1} />
            </div>
          ))}
        </div>
      );
    }

    // Handle objects
    return (
      <div className={`ml-${level * 4}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="font-semibold text-gray-700">{key}: </span>
            <RenderNestedData data={value} level={level + 1} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Parsed Data</h2>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">Entry {index + 1}</h3>
            <RenderNestedData data={item} level={0} />
          </div>
        ))
      ) : (
        <p className="text-gray-500">No data available</p>
      )}
    </div>
  );
};

export default ParsedDataWindow;
