import apiClient from "./apiClient";

export const submit_parsed_details = async (user_uuid) => {
  try {
    const response = await apiClient.post("/submit/" + user_uuid, {
      user_uuid,
    });
    return response;
  } catch (error) {
    return error;
  }
};
