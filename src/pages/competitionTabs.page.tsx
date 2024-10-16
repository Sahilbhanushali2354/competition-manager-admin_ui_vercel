import { Button, Spin, Tabs, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ActiveParticipantATOM,
  ActiveRoundAtom,
  AllCompetitionAtom,
  SelectedCompetitionAtom,
  SelectedRoundAtom,
} from "../store/atom.store";
import { useRecoilState, useRecoilValue } from "recoil";
import { CompetitionDTO, RoundsDataDTO } from "../types/input.types";
import { useEffect, useState } from "react";
import "../tab.css";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import Participants from "../components/participants.component";
import Rules from "../components/rules.component";
import LeaderBoard from "../components/leaderboard.component";
import PresentationDetail from "../components/Presentations.component";

const CompetitionTabs = () => {
  const [loader, setLoader] = useState(false);
  const [selectedCompetition, setSelectedCompetition] =
    useRecoilState<CompetitionDTO>(SelectedCompetitionAtom);
  const allcompetitionData = useRecoilValue(AllCompetitionAtom);
  const [activeRound, setActiveRound] = useRecoilState(ActiveRoundAtom);
  const { id } = useParams();
  const [selectedRound, setSelectedRound] = useRecoilState(SelectedRoundAtom);
  const activeParticipant = useRecoilValue(ActiveParticipantATOM);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: any;
    console.log(unsubscribe);

    if (!allcompetitionData.length) {
      navigate("/competition");
    } else {
      const _matchid = allcompetitionData.find((x) => x.id == id);

      if (_matchid) {
        unsubscribe = onSnapshot(doc(FStore, "DEFAULT", id), (doc) => {
          const activeRoundData = doc.data()?.activeRound;
          setActiveRound(activeRoundData ?? {});
          const _activeRound =
            activeRoundData &&
            _matchid.rounds &&
            _matchid.rounds.find((round) => round.id === activeRoundData.id);
          setSelectedRound(_activeRound ? _activeRound.id : "1");
        });
      }
    }
    return () => console.log("clean id");
  }, [id]);

  const data = [
    {
      id: "1",
      label: "Participants",
    },
    {
      id: "2",
      label: "Rules",
    },
    {
      id: "3",
      label: "LeaderBoard",
    },
    {
      id: "4",
      label: "Presenatations",
    },
  ];

  const ParantTabChange = (key: string) => {
    setSelectedRound(key as string);
  };

  const addround = async () => {
    const lastRoundLabel =
      selectedCompetition.rounds &&
      selectedCompetition.rounds[selectedCompetition.rounds.length - 1]?.label;

    const lastRoundNumber =
      (lastRoundLabel && parseInt(lastRoundLabel.split(" ")[1])) || 0;

    const newRoundLabel = `Round ${lastRoundNumber + 1}`;
    const newRound: RoundsDataDTO = {
      id: Math.random().toString(),
      label: newRoundLabel,
    };

    let _selectedCompetition = { ...selectedCompetition };
    let _selectedRounds = [...(_selectedCompetition.rounds ?? [])];
    _selectedRounds.push(newRound);
    _selectedCompetition.rounds = _selectedRounds;
    setSelectedCompetition(_selectedCompetition);
    if (selectedCompetition && selectedCompetition.id) {
      const UpdateRef = doc(
        FStore,
        "COMPETITION",
        _selectedCompetition.id as string
      );

      await updateDoc(UpdateRef, _selectedCompetition);
    }
  };

  const makeRoundActive = async (roundId: string) => {
    setLoader(true);
    const x = selectedCompetition.rounds?.find((round) => round.id == roundId);
    setActiveRound((x as RoundsDataDTO) ?? {});
    await setDoc(
      doc(FStore, "DEFAULT", id),
      {
        activeRound: { label: x?.label, id: x?.id },
        selectedCompetition,
      },
      { merge: true }
    )
      .then(() => {
        setLoader(false);
        message.success(`${x?.label} Activated SuccessFully`);
      })
      .catch((error) => {
        setLoader(false);
        message.error(error);
      });
  };

  return (
    <Spin spinning={loader}>
      <div style={{ padding: "10px" }}></div>
      <div style={{ float: "left" }}>
        {activeRound.id !== selectedRound && (
          <Button
            type="primary"
            onClick={() => makeRoundActive(selectedRound ?? "")}
          >
            Make This Round Active
          </Button>
        )}

        {activeRound.id == selectedRound && (
          <Button
            type="primary"
            onClick={async () => {
              setLoader(true);
              if (activeParticipant.uname?.length) {
                setLoader(false);
                message.error(
                  `You can't Deactive Round With Selected Participant`
                );
                return;
              }
              await setDoc(
                doc(FStore, "DEFAULT", id),
                {
                  activeRound: null,
                },
                { merge: true }
              )
                .then(() => {
                  setActiveRound({} as RoundsDataDTO);
                  setLoader(false);
                  message.success("Round Deactived SuccessFully");
                })
                .catch((error) => {
                  setLoader(false);
                  message.error(error);
                });
            }}
          >{`DeActive ${activeRound.label}`}</Button>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" onClick={addround}>
          ADD ROUNDS
        </Button>
      </div>
      {selectedCompetition.rounds?.length ? (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Tabs
            onChange={(key: string) => ParantTabChange(key)}
            activeKey={selectedRound ?? activeRound.id}
            items={selectedCompetition.rounds?.map((round: RoundsDataDTO) => {
              return {
                label: round.label,
                key: round.id,
                children: (
                  <div>
                    <Tabs
                      items={data.map((rounds) => {
                        return {
                          label: rounds.label,
                          key: rounds.id,
                          children:
                            rounds.label === "Participants" ? (
                              <Participants />
                            ) : rounds.label === "Rules" ? (
                              <Rules />
                            ) : rounds.label === "LeaderBoard" ? (
                              <LeaderBoard />
                            ) : (
                              <PresentationDetail />
                            ),
                        };
                      })}
                    />
                  </div>
                ),
              };
            })}
          />
        </div>
      ) : null}
    </Spin>
  );
};
export default CompetitionTabs;
