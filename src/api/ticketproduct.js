import UseCallApi from "../hooks/UseCallApi";

const { UseGet, UsePost, UseEdit, UsePostFile } = UseCallApi();

export const createTicketProductApi = (params) => {
  const url = "/v1/ticket-products";
  return UsePost({ url, requiredToken: true, params });
};

export const updateTicketProductApi = (params) => {
  const url = "/v1/ticket-products";
  return UseEdit({ url, requiredToken: true, params });
};

export const getListTicketProductApi = (params) => {
  const url = "/v1/ticket-products?status=1";
  return UseGet({ url, requiredToken: true, params });
};

export const getTicketProductByIdApi = (id) => {
  const url = `/v1/ticket-products/ticket?ticketId=${id}`;
  return UseGet({ url, requiredToken: true });
};

export const createOrderApi = (params) => {
  const url = "/v1/orders";
  return UsePost({ url, requiredToken: true, params });
};

export const getOrderApi = (params) => {
  const url = "/v1/orders";
  return UseGet({ url, requiredToken: true, params });
};

export const getOrderByIdApi = (id) => {
  const url = `/v1/orders?accountId=${id}`;
  return UseGet({ url, requiredToken: true });
};

export const uploadTicketProductApi = (params, id) => {
  const url = `/v1/ticket-products/upload/${id}`;
  return UsePostFile({ url, requiredToken: true, params });
};
