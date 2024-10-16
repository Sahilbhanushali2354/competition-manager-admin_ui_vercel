import { collection, onSnapshot } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { useRecoilValue } from "recoil";
import {
  SelectedCompetitionAtom,
  SelectedRoundAtom,
} from "../store/atom.store";
import { useEffect, useState } from "react";
import { Spin, Table } from "antd";
import { useParams } from "react-router-dom";

const Leaderboard = () => {
  const selectedCompetition = useRecoilValue(SelectedCompetitionAtom);
  const [allResponseData, setAllResponseData] = useState([]);
  const selectedRound = useRecoilValue(SelectedRoundAtom);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  useEffect(() => {
    if (selectedRound) getResponseData();
  }, [id, selectedRound]);

  const getResponseData = () => {
    setLoader(true);
    const _allData: any[] = [] as any[];
    const unsubscribe = onSnapshot(
      collection(
        FStore,
        "RESPONSES",
        selectedCompetition.id as string,
        selectedRound as string
      ),
      (snapshot) => {
        snapshot.forEach((doc) => {
          const _data = doc.data().response;
          let totalpoint = 0;
          Object.entries(_data).map(([key, value]: any) => {
            if (key !== "participantDetail") totalpoint += value.totalPoints;
          });

          _data.id = doc.id;
          _allData.push({
            id: doc.id,
            point: totalpoint,
            name: _data.participantDetail.name,
          });
        });
        _allData.sort((a, b) => b.point - a.point);
        setAllResponseData(_allData as any);
        setLoader(false);
      }
    );
    return () => unsubscribe();
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "index",
      key: "index",
      render: (_text: any, _record: any, index: number) => index + 1,
      // sorter: (a: any, b: any) => a.index - b.index,
    },
    {
      title: "Participant Name",
      dataIndex: "name",
      key: "name",
      // sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Points",
      dataIndex: "point",
      key: "point",
      sorter: (a: any, b: any) => a.point - b.point,
    },
  ];
  return (
    <Spin spinning={loader}>
      <Table columns={columns as any} dataSource={allResponseData} />
    </Spin>
  );
};

export default Leaderboard;
