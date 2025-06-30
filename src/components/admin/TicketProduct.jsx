import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTicketProductApi,
  updateTicketProductApi,
  getListTicketProductApi,
  uploadTicketProductApi,
} from "../../api/ticketproduct";
import { getListTicketApi } from "../../api/ticket";
import {
  Button,
  Form,
  Input,
  Table,
  Modal,
  Dropdown,
  message,
  Select,
  InputNumber,
  Upload,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import UseCookie from "../../hooks/UseCookie";

const TicketProduct = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [typeModal, setTypeModal] = useState("create");
  const [selectedTicketProduct, setSelectedTicketProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { removeToken } = UseCookie();
  const queryClient = useQueryClient();

  // Fetch ticket products
  const {
    data: listTicketProducts,
    isLoading: isLoadingTicketProducts,
    error,
  } = useQuery({
    queryKey: ["listTicketProducts"],
    queryFn: () =>
      getListTicketProductApi({}).then((res) => {
        return res.data.content || res.data;
      }),
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch ticket products";
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        removeToken();
        navigate("/login");
      }
    },
  });

  // Fetch tickets for ticketId dropdown
  const { data: listTickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["listTickets"],
    queryFn: () =>
      getListTicketApi({}).then((res) => {
        return res.data.content || res.data;
      }),
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch tickets";
      toast.error(errorMessage);
    },
  });

  // Create ticket product mutation
  const {
    mutateAsync: createTicketProduct,
    isLoading: isLoadingCreateTicketProduct,
  } = useMutation({
    mutationKey: ["createTicketProduct"],
    mutationFn: createTicketProductApi,
    onSuccess: () => {
      toast.success("Ticket product created successfully");
      queryClient.invalidateQueries(["listTicketProducts"]);
      form.resetFields();
      closeModal();
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to create ticket product";
      message.error(errorMessage);
      if (err.response?.status === 401) {
        removeToken();
        navigate("/login");
      }
    },
  });

  // Update ticket product mutation
  const {
    mutateAsync: updateTicketProduct,
    isLoading: isLoadingUpdateTicketProduct,
  } = useMutation({
    mutationKey: ["updateTicketProduct"],
    mutationFn: updateTicketProductApi,
    onSuccess: () => {
      toast.success("Ticket product updated successfully");
      queryClient.invalidateQueries(["listTicketProducts"]);
      form.resetFields();
      closeModal();
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to update ticket product";
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        removeToken();
        navigate("/login");
      }
    },
  });

  // Upload file mutation
  const { mutate: uploadFile, isLoading: isUploadingFile } = useMutation({
    mutationFn: ({ id, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadTicketProductApi(formData, id);
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries(["listTicketProducts"]);
      closeUploadModal();
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to upload file";
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        removeToken();
        navigate("/login");
      }
    },
  });

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      description: values.description,
      quantity: values.quantity,
      price: parseFloat(values.price),
      ticketId: values.ticketId,
      maxPurchasePerAccount: values.maxPurchasePerAccount,
    };

    if (typeModal === "create") {
      createTicketProduct(payload);
    } else {
      updateTicketProduct({ id: selectedTicketProduct.id, ...payload });
    }
  };

  const handleSetForm = (type, ticketProduct = null) => {
    setTypeModal(type);
    setSelectedTicketProduct(ticketProduct);
    if (type === "update" && ticketProduct) {
      form.setFieldsValue({
        name: ticketProduct.name,
        description: ticketProduct.description,
        quantity: ticketProduct.quantity,
        price: parseFloat(ticketProduct.price), // Ensure number
        ticketId: ticketProduct.ticketId,
        maxPurchasePerAccount: ticketProduct.maxPurchasePerAccount,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicketProduct(null);
    form.resetFields();
  };

  const openUploadModal = (ticketProduct) => {
    setSelectedTicketProduct(ticketProduct);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedTicketProduct(null);
    setSelectedFile(null);
  };

  const handleFileChange = (info) => {
    if (info.fileList.length > 0) {
      setSelectedFile(info.fileList[0].originFileObj);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!selectedTicketProduct?.id) {
      toast.error("No ticket product selected.");
      return;
    }

    uploadFile({ id: selectedTicketProduct.id, file: selectedFile });
  };

  const filteredTicketProducts = listTicketProducts?.filter((ticketProduct) =>
    ticketProduct.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toFixed(2)}`, // Keep 2 decimals for display
    },
    {
      title: "Ticket",
      dataIndex: "ticketId",
      key: "ticketId",
      render: (ticketId) => {
        const ticket = listTickets?.find((t) => t.id === ticketId);
        return ticket ? ticket.title : ticketId;
      },
    },
    {
      title: "Max Purchase",
      dataIndex: "maxPurchasePerAccount",
      key: "maxPurchasePerAccount",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                label: (
                  <p onClick={() => handleSetForm("update", record)}>Edit</p>
                ),
                key: "0",
              },
              {
                label: (
                  <p onClick={() => openUploadModal(record)}>Upload File</p>
                ),
                key: "1",
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen p-6 bg-white flex flex-col gap-4 overflow-x-hidden">
      <div className="flex flex-row justify-between items-center">
        <Input
          placeholder="Search ticket products by name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => handleSetForm("create")}>
          Create Ticket Product
        </Button>
      </div>

      {error && (
        <div className="text-red-500">
          Error:{" "}
          {error.response?.data?.message || "Failed to load ticket products"}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredTicketProducts}
        rowKey="id"
        loading={isLoadingTicketProducts}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        className="w-full"
      />

      {/* Create/Update Modal */}
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        title={
          typeModal === "create"
            ? "Create New Ticket Product"
            : "Update Ticket Product"
        }
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="w-full"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input product name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please input quantity!" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input price!" }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              className="w-full"
              formatter={(value) => `${value}`} // Display as entered
              parser={(value) => parseFloat(value) || 0} // Parse to float
            />
          </Form.Item>
          <Form.Item
            label="Ticket"
            name="ticketId"
            rules={[{ required: true, message: "Please select a ticket!" }]}
          >
            <Select
              placeholder="Select a ticket"
              loading={isLoadingTickets}
              options={listTickets?.map((ticket) => ({
                value: ticket.id,
                label: ticket.title,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Max Purchase Per Account"
            name="maxPurchasePerAccount"
            rules={[{ required: true, message: "Please input max purchase!" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button danger onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                typeModal === "create"
                  ? isLoadingCreateTicketProduct
                  : isLoadingUpdateTicketProduct
              }
            >
              {typeModal === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Upload File Modal */}
      <Modal
        open={isUploadModalOpen}
        onCancel={closeUploadModal}
        footer={null}
        title="Upload File for Ticket Product"
      >
        <div className="mb-4">
          <p>
            Uploading file for:{" "}
            {selectedTicketProduct?.name || "Selected Product"}
          </p>
        </div>
        <Upload
          beforeUpload={() => false} // Prevent auto-upload
          onChange={handleFileChange}
          fileList={
            selectedFile ? [{ name: selectedFile.name, status: "done" }] : []
          }
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
          <Button danger onClick={closeUploadModal}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={isUploadingFile}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TicketProduct;
