import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTicketApi,
  updateTicketApi,
  getListTicketApi,
} from "../../api/ticket";
import { Button, Form, Input, Table, Modal, Dropdown, message } from "antd";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";
import UseCookie from "../../hooks/UseCookie";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Ticket = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeModal, setTypeModal] = useState("create");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { removeToken } = UseCookie();

  const queryClient = useQueryClient();

  const {
    data: listTicket,
    isLoading: isLoadingTickets,
    error,
  } = useQuery({
    queryKey: ["listTicket"],
    queryFn: () =>
      getListTicketApi({}).then((res) => {
        return res.data.content || res.data;
      }),
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch tickets";
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        removeToken();
        navigate("/login");
      }
    },
  });

  const { mutateAsync: createTicket, isLoading: isLoadingCreateTicket } =
    useMutation({
      mutationKey: ["createTicket"],
      mutationFn: createTicketApi,
      onSuccess: () => {
        toast.success("Ticket created successfully");
        queryClient.invalidateQueries("listTicket");
        form.resetFields();
        closeModal();
      },
      onError: (err) => {
        const errorMessage =
          err.response?.data?.message || "Failed to create ticket";
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          removeToken();
          navigate("/login");
        }
      },
    });

  const { mutateAsync: updateTicket, isLoading: isLoadingUpdateTicket } =
    useMutation({
      mutationKey: ["updateTicket"],
      mutationFn: updateTicketApi,
      onSuccess: () => {
        toast.success("Ticket updated successfully");
        queryClient.invalidateQueries("listTicket");
        form.resetFields();
        closeModal();
      },
      onError: (err) => {
        const errorMessage =
          err.response?.data?.message || "Failed to update ticket";
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          removeToken();
          navigate("/login");
        }
      },
    });

  const handleSubmit = (values) => {
    if (typeModal === "create") {
      createTicket({ title: values.title });
    } else {
      console.log("HUHU", selectedTicket);
      updateTicket({ id: selectedTicket.id, title: values.title });
    }
  };

  const handleSetForm = (type, ticket = null) => {
    setTypeModal(type);
    setSelectedTicket(ticket);
    if (type === "update" && ticket) {
      form.setFieldsValue({ title: ticket.title });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    form.resetFields();
  };

  const filteredTickets = listTicket?.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
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
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: "white",
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-row justify-between items-center">
        <Input
          placeholder="Search tickets by title"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => handleSetForm("create")}>
          Create Ticket
        </Button>
      </div>

      {error && (
        <div className="text-red-500">
          Error: {error.response?.data?.message || "Failed to load tickets"}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="id"
        loading={isLoadingTickets}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        title={typeModal === "create" ? "Create New Ticket" : "Update Ticket"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ minWidth: "100%" }}
        >
          <Form.Item
            label="Ticket Title"
            name="title"
            rules={[{ required: true, message: "Please input ticket title!" }]}
          >
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2 border-t border-t-[#ccc]">
            <Button danger onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                typeModal === "create"
                  ? isLoadingCreateTicket
                  : isLoadingUpdateTicket
              }
            >
              {typeModal === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Ticket;
