import apiClient from "./apiClient";

export const loginUserInServer = async (username, password) => {
  try {
    const response = await apiClient.post("/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(error.response.data.msg);
    throw error;
  }
};
