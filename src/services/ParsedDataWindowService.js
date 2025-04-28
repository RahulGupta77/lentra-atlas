import apiClient from "./apiClient";

export const get_document_meta_data = async (user_uuid) => {
  try {
    const response = await apiClient.get(`/documents/${user_uuid}`);
    return response;
  } catch (error) {
    return error;
  }
};

export const get_tw_document_meta_data = async (user_uuid) => {
  try {
    const response = await apiClient.get(`/twdocuments/${user_uuid}`);
    return response;
  } catch (error) {
    return error;
  }
};
