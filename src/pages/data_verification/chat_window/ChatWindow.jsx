import { useEffect, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import Typewriter from "typewriter-effect";
// import {
//   fetchChatHistoryFromServer,
//   sendUserQueryToAiModelOnServer,
// } from "../../services/chatService";
import { FiImage } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
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

const sampleChatMessages = [
  {
    message_content: "Hey! Did you check the latest update?",
    role: "user",
    created_at: "2025-04-14T10:00:00Z",
  },
  {
    message_content: {
      type: "image",
      name: "coffee_break.jpg",
      url: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
    },
    role: "user",
    created_at: "2025-04-14T10:01:30Z",
  },
  {
    message_content: "Yes, everything looks good. Just a few suggestions.",
    role: "ai",
    intent: "respond",
    created_at: "2025-04-14T10:02:10Z",
  },
  {
    message_content: "Here's a pic from yesterday's team outing!",
    role: "user",
    created_at: "2025-04-14T10:04:30Z",
  },
  {
    message_content: "Thanks for sharing! Everyone looks happy!",
    role: "ai",
    intent: "comment",
    created_at: "2025-04-14T10:06:10Z",
  },
  {
    message_content: "Awesome. I'll take a look at it.",
    role: "user",
    created_at: "2025-04-14T10:08:20Z",
  },
];

const ChatWindow = () => {
  const [isWaitingForAiResponse, setIsWaitingForAiResponse] = useState(false);
  const [lenderChatHistory, setLenderChatHistory] =
    useState(sampleChatMessages);
  const [lenderCurrentChat, setLenderCurrentChat] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [newNotification, setNewNotification] = useState({
    chatViewType: "",
    totalNewMessages: 0,
  });
  const [agentId] = useState("data_verification");

  const { id } = useParams();
  const chatContainerScrollRef = useRef(null);
  const inputRef = useRef(null);

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

  // Auto-scroll to bottom on new chat
  useEffect(() => {
    chatContainerScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    scrollToBottom(chatContainerScrollRef);
  }, [lenderCurrentChat]);

  const handleSendMessage = () => {
    if (textInput.trim()) {
      const userMessage = {
        message_content: textInput.trim(),
        role: "user",
        created_at: new Date().toISOString(),
      };
      setLenderCurrentChat((prev) => [...prev, userMessage]);
      setTextInput("");
    }
  };

  const handleFileUpload = (file) => {
    const url = URL.createObjectURL(file);
    const fileType = file.type.startsWith("image/") ? "image" : "file";

    const fileMessage = {
      message_content: {
        type: fileType,
        url: url,
        name: file.name,
      },
      role: "user",
      created_at: new Date().toISOString(),
    };

    setLenderCurrentChat((prev) => [...prev, fileMessage]);
    scrollToBottom(chatContainerScrollRef);
  };

  return (
    <div className={`chat-window visible`}>
      <h2 className="title" style={{ textAlign: "center" }}>
        Chat with Atlas
      </h2>
      <p className="sub-title" style={{ textAlign: "center" }}>
        Upload any financial document — Atlas will automatically analyze,
        classify, and process it with precision.
      </p>

      <div className="chat-content">
        <>
          {[...lenderChatHistory, ...lenderCurrentChat].map(
            ({ message_content, role, created_at, intent }, index) => {
              const key = created_at + index;

              const renderMessageContent = () => {
                if (typeof message_content === "string") {
                  return (
                    <div className="user-chat-text">{message_content}</div>
                  );
                }

                if (message_content.type === "image") {
                  return (
                    <div className="user-chat-media ">
                      <img
                        src={message_content.url}
                        alt={message_content.name}
                        className="chat-image-preview"
                        onLoad={() => scrollToBottom(chatContainerScrollRef)}
                      />
                      <div className="file-name">{message_content.name}</div>
                    </div>
                  );
                }

                if (message_content.type === "file") {
                  return (
                    <div className="user-chat-file">
                      <a
                        href={message_content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📄 {message_content.name}
                      </a>
                    </div>
                  );
                }

                return null;
              };

              if (role === "user") {
                return (
                  <div key={key} className="user-chat-box">
                    {renderMessageContent()}
                    <div className="chat-time-indicator user-time-indicator">
                      {convertToIST(created_at)}
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
                    text={message_content}
                    intent={intent}
                    created_at={created_at}
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
                handleSendMessage();
              }
            }}
            disabled={isWaitingForAiResponse || isAnimating}
          />

          {/* File upload icon */}
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
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />

          {/* Send button */}
          <span
            className={
              "input-icon " +
              ((isWaitingForAiResponse || isAnimating) && "disabled")
            }
            data-tooltip-id="file-icon-tooltip"
            data-tooltip-content={"Send"}
            onClick={handleSendMessage}
          >
            <IoSend />
          </span>
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
