import {
  Button,
  Modal,
  Popconfirm,
  Table,
  message,
  Image,
  Spin,
  Space,
  Input,
} from "antd";
import { useEffect, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import { UserDTO } from "../types/input.types";
import People from "./peopleRegistration.page";
import { useNavigate } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { useRecoilState } from "recoil";
import { AtomAllPeople, AtomFilterUser } from "../store/atom.store";
import { SearchOutlined } from "@ant-design/icons";

const AllPeople = () => {
  const [loader, setLoader] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useRecoilState(AtomAllPeople);
  const [selectedRow, setSelectedRow] = useState<UserDTO>({} as UserDTO);
  const [filteredUsers, setFilteredUsers] = useRecoilState(AtomFilterUser);

  const navigate = useNavigate();
  useEffect(() => {
    getdata();
  }, []);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = (rowData: UserDTO) => {
    setIsModalOpen(true);
    setSelectedRow(rowData);
  };

  const handleDelete = async (rowData: UserDTO) => {
    await deleteDoc(doc(FStore, "PEOPLE", rowData.id as string));

    let _tableData = [...tableData];
    let x = _tableData.findIndex((x) => x.id == rowData.id);
    if (x !== -1) {
      _tableData.splice(x, 1);
      setTableData(_tableData);
      setFilteredUsers(_tableData);
      message.success("Participant Data Deleted Successfully");
    }
  };

  const columns = [
    {
      title: "Profile",
      dataIndex: "profile",
      render: (profile: string) => {
        return <Image width={50} src={profile} />;
      },
    },
    {
      title: "Username",
      dataIndex: "uname",
      sorter: (a: UserDTO, b: UserDTO) =>
        a.uname?.localeCompare(b.uname as string),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a: UserDTO, b: UserDTO) =>
        a.email?.localeCompare(b.email as string),
    },
    {
      title: "Phone Number",
      dataIndex: "contact",
      sorter: (a: UserDTO, b: UserDTO) =>
        a.contact?.localeCompare(b.contact as string),
    },
    {
      title: "Address",
      dataIndex: "address",
      sorter: (a: UserDTO, b: UserDTO) =>
        a.address?.localeCompare(b.address as string),
    },
    {
      title: "Edit",
      render: (rowData: UserDTO) => {
        return (
          <Button
            icon={<FaUserEdit />}
            style={{ backgroundColor: "gray" }}
            onClick={() => showModal(rowData)}
          ></Button>
        );
      },
    },
    {
      title: "Delete",
      render: (rowData: UserDTO) => {
        return (
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Data?"
            onConfirm={() => handleDelete(rowData)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<MdDeleteForever />}
              style={{ backgroundColor: "gray" }}
            ></Button>
          </Popconfirm>
        );
      },
    },
  ];

  const getdata = async () => {
    setLoader(true);

    const q = collection(FStore, "PEOPLE");

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedData: UserDTO[] = [];
      querySnapshot.forEach((doc) => {
        let _data = doc.data();
        _data.id = doc.id;
        updatedData.push(_data);
      });
      setTableData(updatedData);
      setFilteredUsers(updatedData);
      setLoader(false);
    });

    return unsubscribe;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value.toLowerCase();
    const filtered = tableData.filter((Item) =>
      Object.values(Item).some((value) =>
        String(value).toLowerCase().includes(search)
      )
    );
    setFilteredUsers(filtered);
  };
  return (
    <Spin spinning={loader}>
      <Space.Compact size="middle">
        <Input
          addonBefore={<SearchOutlined />}
          placeholder="Search Participant"
          style={{ width: "400px", float: "right" }}
          onChange={handleSearchChange}
        />
      </Space.Compact>
      <div style={{ padding: "10px" }}></div>
      <Table dataSource={filteredUsers} columns={columns as any}></Table>
      <Modal
        footer={false}
        closable={true}
        open={isModalOpen}
        onCancel={handleCancel}
      >
        <People
          data={selectedRow}
          setData={setTableData}
          setIsModalOpen={setIsModalOpen}
          disable={!!selectedRow}
        />
      </Modal>
      <Button
        type="primary"
        onClick={() => navigate("/participantregistration")}
      >
        ADD PARTICIPANT
      </Button>
    </Spin>
  );
};

export default AllPeople;
