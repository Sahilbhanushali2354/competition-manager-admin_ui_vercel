import { Button, Input, Space, Spin, message } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { PeopleErrorDTO, UserDTO } from "../types/input.types";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { useRecoilState } from "recoil";
import { AtomAllPeople, AtomFilterUser } from "../store/atom.store";

interface Props {
  data?: UserDTO;
  setData?: (d: UserDTO[]) => void;
  setIsModalOpen?: (d: boolean) => void;
  disable?: boolean;
}

const People = (props: Props) => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useRecoilState(AtomAllPeople);
  const [filteredUsers, setFilteredUsers] = useRecoilState(AtomFilterUser);
  const [fields, setFields] = useState<UserDTO>(props.data || ({} as UserDTO));
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState<PeopleErrorDTO>({});
  const [userProfile, setUserProfile] = useState<File>();
  const isAllPeoplePage = props.data;
  const isPeoplePage = props.data;
  useEffect(() => {
    setFields(props.data || ({} as UserDTO));
  }, [props.data]);
  console.log(filteredUsers);

  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFields((prevfields) => ({ ...prevfields, [name]: value }));

    const generateErrorMessage = (fieldName: string, fieldValue: string) => {
      if (!fieldValue) {
        return `Enter ${fieldName}`;
      } else if (fieldName === "contact" && fieldValue.length !== 10) {
        return "Phone Number must be 10 digits";
      } else {
        return "";
      }
    };

    setErrorMessage((prevError) => ({
      ...prevError,
      [name]: generateErrorMessage(name, value),
    }));
  };

  const handleProfile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    let { name, value } = e.target;

    if (files && files.length > 0) {
      const selectedFile = files[0];
      setUserProfile(selectedFile);
      let _error = { ...errorMessage };

      if (name === "profile")
        _error = {
          ...errorMessage,
          profile: name === "profile" && !value ? "Select Profile Photo" : "",
        };
      setErrorMessage(_error);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result?.toString();
        if (base64String) {
          setFields((prevfields) => ({
            ...prevfields,
            profile: base64String,
          }));
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlesubmit = async () => {
    let _error = { ...errorMessage };

    if (!fields.uname) _error = { ..._error, uname: "Enter Username" };

    if (!fields.email) {
      _error = { ..._error, email: "Enter Email" };
    } else if (!/^\S+@(gmail\.com|gmail\.in)$/.test(fields.email)) {
      _error = { ..._error, email: "Enter Valid Email" };
    }

    if (!fields.contact) _error = { ..._error, contact: "Enter Phone Number" };
    else if (fields.contact.length !== 10)
      _error = { ..._error, contact: "Enter Valid Phone Number" };

    if (!userProfile) {
      _error = { ..._error, profile: "Select Profile Photo" };
    } else {
      const extensions = [
        "image/apng",
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      if (!extensions.includes(userProfile.type)) {
        _error = { ..._error, profile: "Enter Valid Profile Photo" };
      }
      if (userProfile.size < 1048.487) {
        _error = { ..._error, profile: "Enter Valid Profile Photo" };
      }
    }

    if (!fields.address) {
      _error = { ..._error, address: "Enter Address" };
    }
    const noErrors = Object.values(_error).every((value) => value === "");

    if (noErrors) {
      setLoader(true);
      await addData();
      setFields({} as UserDTO);
      navigate("/allparticipants");
      message.success("Participant Data Added Successfully");
    } else {
      setErrorMessage(_error);
    }
  };

  const addData = async () => {
    await addDoc(collection(FStore, "PEOPLE"), fields);
  };

  const handleupdate = async () => {
    setLoader(true);

    let _error = { ...errorMessage };
    if (!fields.uname) _error = { ..._error, ["uname"]: "Enter Username" };
    if (!fields.email) _error = { ..._error, ["email"]: "Enter Email" };
    if (!fields.contact)
      _error = { ..._error, ["contact"]: "Enter Phone Number" };

    if (!fields.address) {
      _error = { ..._error, ["address"]: "Enter Address" };
      setErrorMessage(_error);
    } else {
      if (props.data?.id && props.setData) {
        setLoader(false);
        const washingtonRef = doc(FStore, "PEOPLE", props.data?.id);
        let _tableData = [...tableData];
        let _data = _tableData.findIndex((x) => x.id == props.data?.id);
        if (_data !== -1) {
          _tableData.splice(_data, 1, fields);
          await updateDoc(washingtonRef, fields as {});
          setTableData(_tableData);
          setFilteredUsers(_tableData);
          props.setIsModalOpen && props.setIsModalOpen(false);
          message.success("Participant Updated SuccessFully");
        }
      }
    }
  };

  return (
    <Spin size="large" spinning={loader} className="main-container">
      <div className="container">
        <div className="form-container">
          <div className="input-container">
            <div className="inputs">
              <label>Name</label>
              <Input
                type="text"
                name="uname"
                onChange={handlechange}
                value={fields.uname}
              ></Input>
            </div>
          </div>
          <div style={{ color: "red", fontSize: "12px" }}>
            {errorMessage.uname}
          </div>
          <div className="input-container">
            <div className="inputs">
              <label>Email</label>
              <Input
                type="email"
                name="email"
                onChange={handlechange}
                value={fields.email}
                disabled={!!props.data}
              ></Input>
            </div>
          </div>
          <div style={{ color: "red", fontSize: "12px" }}>
            {errorMessage.email}
          </div>

          <div className="input-container">
            <div className="inputs">
              <label>Phone Number</label>
              <Input
                type="number"
                name="contact"
                onChange={handlechange}
                value={fields.contact}
              ></Input>
            </div>
          </div>
          <div style={{ color: "red", fontSize: "12px" }}>
            {errorMessage.contact}
          </div>

          <div className="input-container">
            <div className="inputs">
              <label>Photo</label>
              <Input
                type="file"
                name="profile"
                // value={fields.profile}
                onChange={handleProfile}
              ></Input>
            </div>
          </div>
          <div style={{ color: "red", fontSize: "12px" }}>
            {errorMessage.profile}
          </div>

          <div className="input-container">
            <div className="inputs">
              <label>Address</label>
              <Input
                type="text"
                name="address"
                onChange={handlechange}
                value={fields.address}
              ></Input>
            </div>
          </div>
          <div style={{ color: "red", fontSize: "12px" }}>
            {errorMessage.address}
          </div>

          <div style={{ padding: "10px" }}>
            <div className="inputs">
              {isAllPeoplePage ? null : (
                <Space>
                  <>
                    <Button type="primary" onClick={handlesubmit}>
                      Submit
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        navigate("/allparticipants");
                      }}
                    >
                      Back To ALL PARTICIPANTS
                    </Button>
                  </>
                </Space>
              )}
              {isPeoplePage ? (
                <Button type="primary" onClick={handleupdate}>
                  Update
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default People;
