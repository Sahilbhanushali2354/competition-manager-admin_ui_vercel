import { Select, Table, Image, Button, message, Spin, Dropdown } from "antd";
import { UserDTO } from "../types/input.types";
import { collection, doc, onSnapshot, query, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FStore } from "../common/config/router/firebase.config";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ActiveParticipantATOM,
  ActiveRoundAtom,
  AtomAllPeople,
  AtomSelectedParticipants,
  SelectedRoundAtom,
} from "../store/atom.store";
import { useParams } from "react-router-dom";

const Participants = () => {
  const selectedRound = useRecoilValue(SelectedRoundAtom);
  const [loader, setLoader] = useState<boolean>(false);
  const { id } = useParams();
  const [peopleList, setPeopleList] = useRecoilState(AtomAllPeople);
  const [selectedParticipants, setSelectedParticipants] = useRecoilState(
    AtomSelectedParticipants
  );
  const activeRound = useRecoilValue(ActiveRoundAtom);

  const [activeParticipant, setActiveParticipant] = useRecoilState(
    ActiveParticipantATOM
  );
  const [tempSelectedParticipants, setTempSelectedParticipants] = useState<
    UserDTO[]
  >([] as UserDTO[]);

  useEffect(() => {
    if (!peopleList.length) {
      getParticipantsData();
    }
  }, []);

  useEffect(() => {
    if (activeRound?.id === selectedRound) {
      fetchActiveParticipant();
    }
  }, [activeRound, selectedRound]);

  useEffect(() => {
    if (selectedRound) fetchSelectedParticipants();
  }, [selectedRound, id]);

  const handleChange = (_: string, option: any) => {
    setSelectedParticipants(option ? option : {});
  };
  const getParticipantsData = async () => {
    const unsubscribe = onSnapshot(
      query(collection(FStore, "PEOPLE")),
      (snapshot) => {
        const updatedPeopleList: UserDTO[] = [];
        snapshot.forEach((doc) => {
          const _data = doc.data();
          _data.id = doc.id;
          updatedPeopleList.push(_data as UserDTO);
        });
        setPeopleList(updatedPeopleList);
      }
    );

    return () => unsubscribe();
  };

  const SaveData = async () => {
    setLoader(true);

    setDoc(
      doc(FStore, "COMPETITION", id, selectedRound as string, "PARTICIPANTS"),
      { ["DATA"]: selectedParticipants }
    )
      .then(() => {
        selectedParticipants.length > 1
          ? message.success("Participants Stored SuccessFully")
          : selectedParticipants.length == 1
          ? message.success("Participant Stored SuccessFully")
          : message.success("All Participants Removed SuccessFully");
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        message.error(error);
      });
  };

  const fetchSelectedParticipants = async () => {
    const docRef = doc(
      FStore,
      "COMPETITION",
      id as string,
      selectedRound as string,
      "PARTICIPANTS"
    );

    const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const x = data?.DATA ?? [];

        setSelectedParticipants(x);
        setTempSelectedParticipants(x);
      } else {
        setSelectedParticipants([]);
      }
    });

    return () => unsubscribe();
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
    // {
    //   render: () => (
    //     <Button type="link" onClick={() => navigate("/feedback")}>
    //       Feedback
    //     </Button>
    //   ),
    // },
  ];

  const fetchActiveParticipant = async () => {
    setLoader(true);
    if (activeRound?.id === selectedRound) {
      const docRef = doc(FStore, "DEFAULT", id);
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setActiveParticipant(data.activeParticipant || {});
          setLoader(false);
        } else {
          setActiveParticipant({});
          setLoader(false);
        }
      });

      return () => unsubscribe();
    }
  };

  const handleItemClick = async (name: string) => {
    setLoader(true);
    const _activeSelectedPartcipant = selectedParticipants.find(
      (participant) => participant.uname === name
    );

    await setDoc(
      doc(FStore, "DEFAULT", id),
      {
        activeParticipant: _activeSelectedPartcipant,
      },
      { merge: true }
    )
      .then(() => {
        setActiveParticipant(_activeSelectedPartcipant as any);
        setLoader(false);
        message.success("Participant Selected");
      })

      .catch((error) => {
        setLoader(false);
        message.error("Error selecting participant:", error);
      });
  };
  const itemList =
    tempSelectedParticipants && tempSelectedParticipants.length > 0
      ? tempSelectedParticipants.map((participant, index) => ({
          key: index + 1,
          label: participant.uname?.length
            ? participant.uname
            : "There are no selected participants for this round",
          onClick: () => handleItemClick(participant.uname ?? ""),
        }))
      : [
          {
            key: 0,
            label: "There are no selected participants for this round",
            onClick: () => handleItemClick(""),
          },
        ];

  const dataSource = selectedParticipants.map((participant) => ({
    ...participant,
    key: participant.id,
  }));
  const filteredOptions = peopleList.map((participant) => ({
    ...participant,
    label: participant.uname,
    value: participant.uname,
    disabled: participant.uname === activeParticipant.uname,
  }));
  return (
    <Spin spinning={loader}>
      {activeRound?.id == selectedRound && (
        <div>
          <span>
            <span>
              {activeParticipant?.uname
                ? `Selected Active Participant : `
                : `Select Active Participant`}
            </span>
            <span style={{ margin: "5px" }}></span>
            <span>
              <b>{activeParticipant?.uname}</b>
            </span>

            <Dropdown
              menu={{ items: itemList }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <span style={{ margin: "5px" }}>
                {activeParticipant?.uname ? (
                  <Button type="primary">Change</Button>
                ) : (
                  <Button type="primary">Select</Button>
                )}
              </span>
            </Dropdown>
          </span>
          {activeParticipant.uname?.length ? (
            <Button
              type="primary"
              onClick={async () => {
                setLoader(true);
                await setDoc(
                  doc(FStore, "DEFAULT", id),
                  {
                    activeParticipant: null,
                  },
                  { merge: true }
                )
                  .then(() => {
                    setActiveParticipant({} as UserDTO);
                    setLoader(false);
                    message.success("Participant Deactivated SuccessFully");
                  })
                  .catch((error) => {
                    setLoader(false);
                    message.error(error);
                  });
              }}
            >
              REMOVE
            </Button>
          ) : null}
        </div>
      )}
      <div style={{ padding: "12px" }}></div>
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Search or Select Participant Data"
        onChange={handleChange}
        options={filteredOptions}
        value={selectedParticipants as any}
      />
      <Table dataSource={dataSource} columns={columns as any} />
      <div key="asdsfs" style={{ float: "right" }}>
        <Button type="primary" onClick={SaveData}>
          SAVE
        </Button>
      </div>
    </Spin>
  );
};

export default Participants;
