import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { SelectedRoundAtom } from "../store/atom.store";
import { FStore } from "../common/config/router/firebase.config";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Button, Spin, Table } from "antd";
import { PresentationDTO } from "../types/input.types";

const Presentations = () => {
  const { id } = useParams();
  const selectedRound = useRecoilValue(SelectedRoundAtom);
  const [presentationData, setPresentationData] = useState<PresentationDTO[]>(
    [] as PresentationDTO[]
  );
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    getPresentationDetail();
  }, [selectedRound, id]);
  const getPresentationDetail = () => {
    const q = query(
      collection(FStore, "PRESENTATION"),
      where("competitionData.id", "==", id),
      where("roundData.id", "==", selectedRound)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setLoader(true);
      let x: any = [];
      querySnapshot.forEach((doc) => {
        const _data = doc.data();
        _data.id = doc.id;
        x.push(_data);
      });
      setPresentationData(x);
      setLoader(false);
    });
    return () => unsubscribe();
  };
  const columns = [
    { title: "Username", dataIndex: "name" },
    {
      title: "Topic",
      dataIndex: "topic",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Presentation File",
      dataIndex: "url",
      render: (_: any, rowData: PresentationDTO) => (
        <Button type="link" onClick={() => window.open(rowData.url)}>
          DOWNLOAD
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loader}>
      <Table dataSource={presentationData as any} columns={columns}></Table>
    </Spin>
  );
};

export default Presentations;
