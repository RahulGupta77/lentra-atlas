import apiClient from "./apiClient";

export const addCustomer = async (name, phone_number) => {
  try {
    const response = await apiClient.post("/customers/users", {
      name,
      phone_number,
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
