import { KeyboardEvent } from "react";
import { Card, Button, Modal, Input, Spin, message } from "antd";
import { Link, Outlet } from "react-router-dom";
import { IoAddSharp } from "react-icons/io5";
import { ChangeEvent, useEffect, useState } from "react";
import { CompetitionDTO, TError } from "../types/input.types";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { useRecoilState } from "recoil";
import {
  AllCompetitionAtom,
  SelectedCompetitionAtom,
} from "../store/atom.store";

const Competitionlayout = () => {
  const [loader, setLoader] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [competitionName, setCompetitionName] = useState<CompetitionDTO>(
    {} as CompetitionDTO
  );
  const [allcompetitionData, setAllCompetitionData] =
    useRecoilState(AllCompetitionAtom);
  const [selectedCompetition, setSelectedCompetition] =
    useRecoilState(SelectedCompetitionAtom);
  const [errorMessage, setErrorMessage] = useState<TError>({} as TError);
  const [selectedCardId, setSelectedCardId] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    getdata();
  }, [selectedCompetition.id]);

  const showModal = () => {
    setIsModalOpen(true);
    setLoader(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCompetitionName({} as CompetitionDTO);
    setErrorMessage({} as TError);
  };

  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/ /g, "_");

    const x = { ...competitionName };
    x.cname = e.target.value;
    x.cid = val.toLowerCase();
    setCompetitionName(x);
    let _error = { ...errorMessage };
    if (!val) _error = { ..._error, ["cname"]: "Enter Competition Name" };
    if (val) _error = { ..._error, ["cname"]: "" };
    setErrorMessage(_error);
  };

  const handlesubmit = async () => {
    setLoader(true);
    if (!competitionName?.cname) {
      setLoader(false);
      setErrorMessage({
        ...errorMessage,
        ["cname"]: "First Enter Competition Name",
      });
    } else {
      addData();
    }
  };

  const addData = async () => {
    setLoader(true);
    let competitionround = {
      ...competitionName,
      rounds: [{ id: "1", label: "Round 1" }],
    };
    await addDoc(collection(FStore, "COMPETITION"), competitionround)
      .then(() => {
        setLoader(false);
        handleCancel();
        message.success("Competition Added SuccessFully");
        getdata();
      })
      .catch((error) => {
        setLoader(false);
        message.error(error);
      });
  };

  const getdata = () => {
    setLoader(true);
    const unsubscribe = onSnapshot(
      collection(FStore, "COMPETITION"),
      (querySnapshot) => {
        const x: CompetitionDTO[] = [];
        querySnapshot.forEach((doc) => {
          const _data = doc.data();
          _data.id = doc.id;
          x.push(_data as CompetitionDTO);
        });
        setAllCompetitionData(x);
        setLoader(false);
      }
    );

    return unsubscribe;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      handlesubmit();
    }
  };

  return (
    <Spin spinning={loader}>
      <div style={{ float: "right" }}>
        <Button
          style={{ backgroundColor: "#69b1ff" }}
          icon={<IoAddSharp />}
          onClick={() => {
            setLoader(true);
            showModal();
          }}
        ></Button>
      </div>
      {!allcompetitionData.length ? (
        <h2 style={{ color: "#69b1ff" }}>CLICK ON ADD BUTTON TO ADD CARDS</h2>
      ) : (
        <div style={{ display: "flex", flexDirection: "row" }}>
          {allcompetitionData.map((selectedCard) => {
            return (
              <Link
                key={selectedCard.id}
                onClick={() => {
                  setSelectedCompetition(selectedCard);
                  setSelectedCardId(selectedCard.id ?? undefined);
                }}
                to={`/competition/${selectedCard.id}`}
              >
                <div style={{ padding: "2px" }}>
                  <Card
                    key={selectedCard.id}
                    style={{
                      width: "auto",
                      border: "1px solid #69b1ff",
                      background:
                        selectedCardId === selectedCard.id
                          ? "#69b1ff"
                          : "white",
                    }}
                  >
                    <span>{selectedCard.cname}</span>
                  </Card>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        onCancel={handleCancel}
        footer={false}
        title="ADD COMPETITION"
        open={isModalOpen}
        closable={true}
      >
        <label>Competition Name </label>
        <Input
          onKeyDown={handleKeydown}
          name="cname"
          onChange={handlechange}
          value={competitionName?.cname}
        ></Input>
        <div style={{ color: "red", fontSize: "12px" }}>
          {errorMessage.cname}
        </div>
        <label>Competition ID</label>
        <Input
          disabled
          name="id"
          value={competitionName?.cid}
          onChange={handlechange}
        ></Input>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <Button onClick={handlesubmit} type="primary">
            ADD COMPETITION
          </Button>
          <Button type="default" onClick={handleCancel}>
            Back
          </Button>
        </div>
      </Modal>
      <div>
        <Outlet />
      </div>
    </Spin>
  );
};

export default Competitionlayout;
