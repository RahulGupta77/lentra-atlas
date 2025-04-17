import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import remarkGfm from "remark-gfm";
import Typewriter from "typewriter-effect";
// import {
//   fetchChatHistoryFromServer,
//   sendUserQueryToAiModelOnServer,
// } from "../../services/chatService";
import { FiImage } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import {
  get_user_chat_history,
  send_file_to_llm,
  send_message_to_llm,
} from "../../../services/chatService";
import { convertToIST, scrollToBottom } from "../../../utils/chatBotMethods";
import "./ChatWindow.scss";
import ReplyAnimation from "./ReplyAnimation";

const AiChatBubble = ({
  isAnimating = false,
  setIsAnimating,
  text,
  ReplyAnimationComponent,
  isWaitingForAiResponse = false,
  intent,
  created_at,
}) => {
  return (
    <div className="chat-bubble-ai">
      {intent !== "warning" ? (
        <FiMessageSquare style={{ height: "24px", width: "24px" }} />
      ) : (
        <MdErrorOutline
          style={{ height: "26px", width: "26px", color: "red" }}
        />
      )}
      <div className="ai-chat-box">
        <div className="ai-chat-text">
          {isWaitingForAiResponse ? (
            ReplyAnimationComponent && <ReplyAnimationComponent />
          ) : isAnimating ? (
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .changeDelay(15)
                  .typeString(typeof text === "string" ? text : "")
                  .callFunction(() => {
                    setIsAnimating(false);
                  })
                  .start();
              }}
            />
          ) : typeof text === "string" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3182ce", textDecoration: "underline" }}
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    style={{
                      paddingLeft: "1.5rem",
                      listStyleType: "decimal",
                    }}
                  >
                    {children}
                  </ol>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          ) : (
            <div className="ai-chat-media">
              {text.type === "file" ? (
                <a
                  href={text.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  📄 {text.name}
                </a>
              ) : text.type === "image" ? (
                <>
                  <img
                    src={text.url}
                    alt={text.name}
                    className="chat-image-preview"
                  />
                  <div className="file-name">{text.name}</div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {created_at && (
          <div className="chat-time-indicator">{convertToIST(created_at)}</div>
        )}
      </div>
    </div>
  );
};

const ChatWindow = () => {
  const [isWaitingForAiResponse, setIsWaitingForAiResponse] = useState(false);
  const [lenderChatHistory, setLenderChatHistory] = useState([]);
  const [lenderCurrentChat, setLenderCurrentChat] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [newNotification, setNewNotification] = useState({
    chatViewType: "",
    totalNewMessages: 0,
  });
  const [agentId] = useState("data_verification");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [trigger, setTrigger] = useState(false);

  const { id } = useParams();
  const chatContainerScrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const getChatHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await get_user_chat_history(id);
        if (response.data.status === "success") {
          const reversedHistory = response.data.data.chat_history.reverse();
          setLenderChatHistory(reversedHistory);
          scrollToBottom(chatContainerScrollRef);
        } else {
          throw new Error(
            response.data.error || "Failed to fetch chat history"
          );
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError(
          err.message || "An error occurred while fetching chat history"
        );
      } finally {
        setIsLoading(false);
        scrollToBottom(chatContainerScrollRef);
      }
    };

    if (id) {
      getChatHistory();
    }
  }, [id]);

  useEffect(() => {
    let intervalId = setInterval(() => {
      scrollToBottom(chatContainerScrollRef);
    }, 500);

    if (!isAnimating) {
      clearInterval(intervalId);
      inputRef?.current?.focus();
      scrollToBottom(chatContainerScrollRef);
    }

    return () => clearInterval(intervalId);
  }, [isAnimating]);

  useEffect(() => {
    chatContainerScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    scrollToBottom(chatContainerScrollRef);
  }, [lenderCurrentChat]);

  const handleSendMessage = async () => {
    if (!textInput.trim()) {
      setIsLoading(false);
      return;
    }

    const userMessage = {
      content: textInput,
      sender: "user",
      created_at: new Date().toISOString().slice(0, 19).replace("Z", ""),
      type: "text",
      uuid: crypto.randomUUID(),
      intent: "user_query",
    };

    setLenderCurrentChat((prev) => [...prev, userMessage]);
    setTextInput("");

    try {
      const response = await send_message_to_llm(id, textInput);
      setLenderCurrentChat((prev) => [
        ...prev,
        response.data.data.llm_response,
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setLenderCurrentChat((prev) => [
        ...prev,
        {
          content: "Failed to get response. Please try again.",
          sender: "system",
          created_at: new Date().toISOString().slice(0, 19).replace("Z", ""),
          type: "error",
          uuid: crypto.randomUUID(),
          intent: "error",
        },
      ]);

      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    // Check if the file is an image or PDF
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      console.error("Only image and PDF files are allowed.");
      setIsLoading(false);
      return;
    }

    const url = URL.createObjectURL(file);

    const fileMessage = {
      uuid: crypto.randomUUID(),
      content: url,
      created_at: new Date().toISOString().slice(0, 19).replace("Z", ""),
      type: file.type.startsWith("image/") ? "image" : "pdf",
      sender: "user",
      receiver: "model",
      intent: file.type.startsWith("image/")
        ? "parse image request"
        : "parse pdf request",
      file_name: file.name,
    };

    setLenderCurrentChat((prev) => [...prev, fileMessage]);
    scrollToBottom(chatContainerScrollRef);

    const response = await send_file_to_llm(
      id,
      file,
      file.type.startsWith("image/") ? "image" : "pdf"
    );
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, fileInputRef);
    }
  };

  useEffect(() => {
    // Enable Pusher logging - disable this in production
    // Pusher.logToConsole = true;

    // Initialize Pusher
    const pusher = new Pusher("9867b5a5cb231094924f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(id);

    // Bind to the pan_number_extraction event
    channel.bind("chat_lentra_poc", (payload) => {
      try {
        const {
          created_at,
          intent,
          message_content,
          message_receiver,
          message_sender,
          message_type,
          uuid,
        } = payload;

        const ai_response = {
          content: message_content,
          sender: message_sender,
          receiver: message_receiver,
          created_at: created_at,
          type: message_type,
          uuid: uuid,
          intent: intent,
        };

        setLenderCurrentChat((prev) => [...prev, ai_response]);
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
    <div className={`chat-window visible`}>
      <h2 className="title" style={{ textAlign: "center" }}>
        Chat with Atlas
      </h2>
      {/* <p className="sub-title" style={{ textAlign: "center" }}>
        Upload any financial document — Atlas will automatically analyze,
        classify, and process it with precision.
      </p> */}

      <div className="chat-content">
        <>
          {[...lenderChatHistory, ...lenderCurrentChat].map(
            (singleChat, index) => {
              const key = singleChat.uuid;

              const renderMessageContent = () => {
                if (singleChat.type === "text") {
                  return (
                    <div className="user-chat-text">{singleChat.content}</div>
                  );
                }

                if (singleChat.type === "image") {
                  return (
                    <div className="user-chat-media">
                      <img
                        src={singleChat.content}
                        alt={
                          singleChat.file_name
                            ? singleChat.file_name
                            : singleChat.content.split("/").pop().split("?")[0]
                        }
                        className="chat-image-preview"
                        onLoad={() => scrollToBottom(chatContainerScrollRef)}
                      />
                      <div className="file-name">
                        {singleChat.file_name
                          ? singleChat.file_name
                          : singleChat.content.split("/").pop().split("?")[0]}
                      </div>
                    </div>
                  );
                }

                if (singleChat.type === "pdf") {
                  return (
                    <div className="user-chat-media">
                      <iframe
                        src={singleChat.content}
                        title={
                          singleChat.file_name
                            ? singleChat.file_name
                            : singleChat.content.split("/").pop().split("?")[0]
                        }
                        className="chat-pdf-preview"
                        onLoad={() => scrollToBottom(chatContainerScrollRef)}
                      />
                      <div className="file-name">
                        {singleChat.file_name
                          ? singleChat.file_name
                          : singleChat.content.split("/").pop().split("?")[0]}
                      </div>
                    </div>
                  );
                }

                return null;
              };

              if (singleChat.sender === "user") {
                return (
                  <div key={key} className="user-chat-box">
                    {renderMessageContent()}
                    <div className="chat-time-indicator user-time-indicator">
                      {convertToIST(singleChat.created_at)}
                    </div>
                  </div>
                );
              } else {
                const isLast =
                  index ===
                  [...lenderChatHistory, ...lenderCurrentChat].length - 1;

                return (
                  <AiChatBubble
                    key={key}
                    text={singleChat.content}
                    intent={singleChat.intent}
                    created_at={singleChat.created_at}
                    isAnimating={isLast ? isAnimating : undefined}
                    setIsAnimating={isLast ? setIsAnimating : undefined}
                    performTypingAnimation={isLast}
                  />
                );
              }
            }
          )}

          {isWaitingForAiResponse && (
            <AiChatBubble
              ReplyAnimationComponent={ReplyAnimation}
              isWaitingForAiResponse={isWaitingForAiResponse}
            />
          )}

          <div ref={chatContainerScrollRef} />
        </>
      </div>

      <div className="chat-input-box">
        <div className="input-group">
          <input
            ref={inputRef}
            id="user-query-to-ai"
            type="text"
            placeholder="Type your query here..."
            className="chat-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isWaitingForAiResponse &&
                !isAnimating
              ) {
                setIsLoading(true);
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />

          {isLoading ? (
            <div
              className="spinner-container"
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "10px",
              }}
            >
              <ClipLoader size={26} color="#3a9391" />
            </div>
          ) : (
            <>
              <label
                htmlFor="image-upload"
                className="file-input-icon file-upload-icon"
                data-tooltip-id="file-icon-tooltip"
                data-tooltip-content={"Upload files"}
              >
                <FiImage />
              </label>
              <input
                id="image-upload"
                type="file"
                accept=".jpg, .jpeg, .png, .webp, .pdf"
                style={{ display: "none" }}
                disabled={isLoading}
                ref={fileInputRef}
                onChange={(e) => {
                  setIsLoading(true);
                  handleInputChange(e);
                }}
              />

              {/* Send button */}
              <span
                className={"input-icon"}
                data-tooltip-id="file-icon-tooltip"
                data-tooltip-content={"Send"}
                onClick={() => {
                  if (isLoading) return;
                  setIsLoading(true);
                  handleSendMessage();
                }}
              >
                <IoSend />
              </span>
            </>
          )}
        </div>
      </div>

      <Tooltip
        id="file-icon-tooltip"
        style={{
          color: "#fff",
          width: "fit-content",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
          lineHeight: "1.5",
        }}
      />
    </div>
  );
};

export default ChatWindow;
