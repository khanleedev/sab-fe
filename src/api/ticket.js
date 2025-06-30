import UseCallApi from "../hooks/UseCallApi";

const { UseGet, UsePost, UseEdit } = UseCallApi();

export const createTicketApi = (params) => {
  const url = "/v1/tickets";
  return UsePost({ url, requiredToken: true, params });
};

export const updateTicketApi = (params) => {
  const url = "/v1/tickets";
  return UseEdit({ url, requiredToken: true, params });
};

export const getListTicketApi = (params) => {
  const url = "/v1/tickets?status=1";
  return UseGet({ url, requiredToken: true, params });
};

export const getTicketByIdApi = (key, id) => {
  const url = `/v1/tickets/${id}`;
  return UseGet({ url, requiredToken: true });
};
