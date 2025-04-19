import apiClient from "./apiClient";

export const getEnabledChecks = async (user_uuid) => {
  try {
    const response = await apiClient.get(
      `/checks?user_uuid=${encodeURIComponent(user_uuid)}`
    );
    return response;
  } catch (error) {
    return error;
  }
};
