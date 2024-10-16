import { Button, Input, List, Spin, message } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { RuleError, RulesDTO } from "../types/input.types";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { MdDelete, MdOutlineCancel } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { SelectedRoundAtom } from "../store/atom.store";
import { RxReset } from "react-icons/rx";

const data = [
  {
    id: Math.random().toString(),
    // label: "",
    value: "",
  },
];
``;

const Rules = () => {
  const selectedRound = useRecoilValue(SelectedRoundAtom);
  const [allRules, setAllRules] = useState<RulesDTO[]>([] as RulesDTO[]);
  const [errorMessage, setErrorMessage] = useState<RuleError>({} as RuleError);
  const [newTextbox, setNewTexbox] = useState([{ id: "1", value: "" }]);
  const [readonly, setReadonly] = useState(false);
  const [border, setBorder] = useState<"borderless" | "outlined">("borderless");
  const [editButtonDisable, setEditButtonDisable] = useState<boolean>(false);
  const [AddRuleDisable, setAddRuleDisable] = useState<boolean>(true);
  const [showDeletebutton, setShowDeletebutton] = useState<boolean>(false);
  const [showCancelbutton, setShowCancelbutton] = useState<boolean>(false);
  const [disableResetButton, setDisableResetButton] = useState<boolean>(true);
  const [loader, setLoader] = useState<boolean>(false);

  const { id } = useParams();
  useEffect(() => {
    // Check if there are any changes in textbox values
    const hasChanges = newTextbox.some(
      (item, index) => item.value !== newTextbox[index].value
    );
    if (hasChanges) {
      setDisableResetButton(false);
    }
  }, [newTextbox]);


  useEffect(() => {
    if (id) getData();
  }, [id]);

  useEffect(() => {
    if (allRules.length === 0 && newTextbox.length === 0) {
      addFirstRule();
    }
  }, [allRules]);

  useEffect(() => {
    return () => {
      if (border == "borderless") setAddRuleDisable(true);
      setReadonly(true);
    };
  }, []);
  const addFirstRule = () => {
    setNewTexbox([{ id: "1", value: "First Rule" }]);
  };
  const AddRules = () => {
    if (newTextbox[newTextbox.length - 1].value) {
      setShowDeletebutton(true);
      setShowCancelbutton(false);
    }
    if (newTextbox[newTextbox.length - 1].value == "") {
      message.error(`Rule can't be Empty`);
    } else {
      const newID = newTextbox[newTextbox.length - 1].id + 1;
      setNewTexbox([...newTextbox, { id: newID, value: "" }]);
      setBorder("outlined");
      setShowDeletebutton(false);
      setShowCancelbutton(true);
      setReadonly(false);
    }
  };

  const handleTextbox = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    let name = event.target.name;
    const updateTextbox = newTextbox.map((textbox) =>
      textbox.id == id ? { ...textbox, value: event.target.value } : textbox
    );
    setAllRules((prevRules) => [
      ...prevRules,
      { ...prevRules[prevRules.length], [name]: event.target.value },
    ]);
    let _error = { ...errorMessage };
    if (!updateTextbox.length) {
      _error = { ..._error, ["rule"]: `Rule can't be Empty` };
      setErrorMessage(_error);
    } else {
      setNewTexbox(updateTextbox);
    }
  };

  const handleSubmit = async () => {
    setLoader(true);
    let _error = { ...errorMessage };
    const isEmpty = newTextbox.some((item) => !item.value);
    if (isEmpty) {
      setLoader(false);
      message.error(`Rule Can't be Empty`);
    } else {
      allRules.length > 1
        ? message.success("Rules Saved SuccessFully")
        : message.success("Rule Saved SuccessFully");
      _error = { ..._error, ["rule"]: "" };
      setErrorMessage(_error);
      await addData();
      getData();
      setBorder("borderless");
      setReadonly(true);
      setEditButtonDisable(false);
      setAddRuleDisable(true);
      setShowDeletebutton(false);
      setShowCancelbutton(false);
      setLoader(false);
      setDisableResetButton(true);
    }
  };
  const addData = async () => {
    setDoc(doc(FStore, "COMPETITION", id, selectedRound as string, "RULES"), {
      ["ALL_RULES"]: newTextbox,
    });
  };
  const getData = () => {
    const q = doc(FStore, "COMPETITION", id, selectedRound as string, "RULES");
    const unsubscribe = onSnapshot(q, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data1 = docSnapshot.data()["ALL_RULES"];
        setNewTexbox(data1);
      } else {
        setNewTexbox(data as []);
      }
      return () => unsubscribe();
    });
  };

  const handleEdit = () => {
    setDisableResetButton(false);
    setBorder("outlined");
    setEditButtonDisable(true);
    setReadonly(false);
    setAddRuleDisable(false);
    setShowDeletebutton(true);
    setShowCancelbutton(false);
  };
  const handleDelete = async (id: any) => {
    if (newTextbox.length > 1) {
      await deleteDoc(
        doc(FStore, "COMPETITION", id, selectedRound as string, "RULES")
      ).then(() => {
        const updatedRules = newTextbox.filter((rule) => rule.id !== id);
        setNewTexbox(updatedRules);
      });
    } else {
      message.error(`You can't delete all rules`);
    }
  };
  const handleCancel = (id: any) => {
    if (newTextbox.length > 1) {
      const updatedRules = newTextbox.filter((rule) => rule.id !== id);
      setNewTexbox(updatedRules);
    } else {
      message.error(`You can't cancel  all rules`);
    }
  };
  const handleReset = () => {
    getData();
    setDisableResetButton(true);
    setEditButtonDisable(false);
  };
  return (
    <Spin spinning={loader}>
      <List
        header={
          <div>
            <span>Rules</span>
            <div style={{ float: "right" }}>
              <Button
                type="primary"
                size="middle"
                icon={<RxReset />}
                onClick={handleReset}
                disabled={disableResetButton}
              ></Button>{" "}
              <Button
                type="primary"
                size="middle"
                icon={<FaRegEdit />}
                onClick={handleEdit}
                disabled={editButtonDisable}
              ></Button>
            </div>
          </div>
        }
        bordered
        dataSource={newTextbox}
        renderItem={(item, index) => (
          <List.Item>
            <div key={item.id}>
              <span>{`RULE : ${index + 1} `}</span>
              <Input
                readOnly={readonly}
                variant={border}
                value={item.value}
                style={{ width: "250px" }}
                onChange={(event) => handleTextbox(item.id, event)}
              />
              {showDeletebutton && (
                <Button
                  danger={true}
                  icon={<MdDelete />}
                  style={{ fontSize: "16px", marginLeft: "5px" }}
                  onClick={() => handleDelete(item.id)}
                />
              )}
              {showCancelbutton && (
                <Button
                  shape="circle"
                  onClick={() => handleCancel(item.id)}
                  icon={<MdOutlineCancel />}
                  style={{ fontSize: "16px", marginLeft: "5px" }}
                />
              )}
              <div
                style={{
                  marginLeft: "10px",
                  color: "red",
                  fontSize: "12px",
                }}
              >
                {errorMessage.rule}
              </div>
            </div>
          </List.Item>
        )}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <Button type="primary" onClick={handleSubmit}>
          SAVE
        </Button>{" "}
        <Button type="primary" onClick={AddRules} disabled={AddRuleDisable}>
          ADD RULES
        </Button>
      </div>
    </Spin>
  );
};

export default Rules;
