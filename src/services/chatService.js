import apiClient from "./apiClient";

export const send_message_to_llm = async (user_uuid, message) => {
  try {
    const response = await apiClient.post("/messages", {
      user_uuid,
      message,
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const send_file_to_llm = async (
  user_uuid,
  file,
  fileType = "image",
  is_tw_file = false
) => {
  try {
    const formData = new FormData();
    formData.append("user_uuid", user_uuid);
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("is_tw_file", is_tw_file);

    const response = await apiClient.post("/customers/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const get_user_chat_history = async (user_uuid) => {
  try {
    const response = await apiClient.get(
      `/messages?user_uuid=${encodeURIComponent(user_uuid)}`
    );
    return response;
  } catch (error) {
    return error;
  }
};
