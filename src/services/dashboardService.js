import apiClient from "./apiClient";

export const addCustomer = async (name, phone_number, checks) => {
  console.log(checks);

  try {
    const response = await apiClient.post("/customers/users", {
      name,
      phone_number,
      checks,
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const getAllCustomer = async () => {
  try {
    const response = await apiClient.get("/customers/users");
    return response;
  } catch (error) {
    return error;
  }
};

export const getAllDocsStatus = async (user_uuid) => {
  try {
    const response = await apiClient.get("/documents/status/" + user_uuid);
    return response;
  } catch (error) {
    return error;
  }
};
