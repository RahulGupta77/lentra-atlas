export const scrollToBottom = (chatContainerScrollRef) => {
  if (chatContainerScrollRef.current) {
    chatContainerScrollRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

export const getFormattedDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export function convertToIST(timestamp) {
  const date = new Date(timestamp);

  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  return istDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}
