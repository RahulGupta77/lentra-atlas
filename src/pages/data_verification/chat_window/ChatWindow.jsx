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
// import { convertToIST, scrollToBottom } from "../../utils/chatBotMethods";
import { FiImage } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
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
                  .typeString(text)
                  .callFunction(() => {
                    setIsAnimating(false);
                  })
                  .start();
              }}
            />
          ) : (
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
          )}
        </div>

        {created_at && (
          <div className="chat-time-indicator">
            {"convertToIST(created_at)"}
          </div>
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
  const [newNotification, setNewNotification] = useState({
    chatViewType: "",
    totalNewMessages: 0,
  });
  const [agentId] = useState("data_verification");

  const { id } = useParams();

  // Internal ref for chat container
  const chatContainerScrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let intervalId;
    intervalId = setInterval(() => {
      //   scrollToBottom(chatContainerScrollRef);
    }, 500);

    if (!isAnimating) {
      clearInterval(intervalId);
      inputRef?.current?.focus();
      //   scrollToBottom(chatContainerScrollRef);
    }
    return () => clearInterval(intervalId);
  }, [isAnimating]);

  return (
    <div className={`chat-window visible`}>
      <h2 className="title" style={{ textAlign: "center" }}>
        Chat with Atlas
      </h2>
      {/* <p className="sub-title">
        Connect with your loan assistant for personalised support and expert
        guidance
      </p> */}

      <div
        className={
          "chat-content "
          // +(isChatFeatureDisabled && "blur-content")
        }
      >
        {/* <div className="timestamp">
          <span></span> <p>Today</p> <span></span>
        </div> */}

        <>
          {lenderChatHistory.map(
            ({ message_content, role, created_at, intent }, index) => {
              return role === "user" ? (
                <div key={created_at + index} className="user-chat-box">
                  <div className="user-chat-text">{message_content}</div>
                  <div className="chat-time-indicator user-time-indicator">
                    {/* {convertToIST(created_at)} */}
                  </div>
                </div>
              ) : (
                <AiChatBubble
                  key={created_at + index}
                  text={message_content}
                  intent={intent}
                  created_at={created_at}
                />
              );
            }
          )}

          {lenderCurrentChat.map(
            ({ message_content, role, created_at, intent }, index) => {
              return role === "user" ? (
                <div key={created_at + index} className="user-chat-box">
                  <div className="user-chat-text">{message_content}</div>
                  <div className="chat-time-indicator user-time-indicator">
                    {/* {convertToIST(created_at)} */}
                  </div>
                </div>
              ) : (
                <>
                  {index === lenderCurrentChat.length - 1 ? (
                    <AiChatBubble
                      key={created_at + index}
                      isAnimating={isAnimating}
                      setIsAnimating={setIsAnimating}
                      performTypingAnimation={true}
                      text={message_content}
                      intent={intent}
                      created_at={created_at}
                    />
                  ) : (
                    <AiChatBubble
                      key={created_at}
                      text={message_content}
                      intent={intent}
                      created_at={created_at}
                    />
                  )}
                </>
              );
            }
          )}
        </>

        {isWaitingForAiResponse && (
          <AiChatBubble
            ReplyAnimationComponent={ReplyAnimation}
            isWaitingForAiResponse={isWaitingForAiResponse}
          />
        )}

        {/* Empty div for automatically scrolling to bottom */}
        <div ref={chatContainerScrollRef} />
      </div>

      <div className="chat-input-box">
        <div className="input-group">
          <input
            ref={inputRef}
            id="user-query-to-ai"
            type="text"
            placeholder="Type your query here..."
            className="chat-input"
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
                console.log("Uploaded file:", file);
                // handleFileUpload(file); // your file handling logic
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
