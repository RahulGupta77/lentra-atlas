import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ParsedDataWindow = () => {
  const [data, setData] = useState("");
  const { id } = useParams();

  useEffect(() => {
    // Enable Pusher logging - disable this in production
    // Pusher.logToConsole = true;

    // Initialize Pusher
    const pusher = new Pusher("9867b5a5cb231094924f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(id);

    // Bind to the pan_number_extraction event
    channel.bind("parsed_data_lentra_poc", (payload) => {
      try {
        setData(payload);
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

  return <div>{data}</div>;
};

export default ParsedDataWindow;
