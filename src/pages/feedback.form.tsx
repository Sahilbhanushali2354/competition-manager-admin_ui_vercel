import { Button, Input, Spin, message } from "antd";
import { ChangeEvent, useState } from "react";
import "../feedback.css";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { FStore } from "../common/config/router/firebase.config";
import { FieldValueDTO, OptionDTO } from "../types/input.types";
import { JsonData } from "../formData";
import { useRecoilValue } from "recoil";
import { SelectedCompetitionAtom } from "../store/atom.store";

const Feedback = () => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState<{ [k: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<{ [k: string]: string }>({});
  const selectedCompetition = useRecoilValue(SelectedCompetitionAtom);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, id, value } = e.target;
    setFields((prevFields) => ({
      ...prevFields,
      [`${name}_${id}`]: value,
    }));

    const data: { [k: string]: any } = JsonData.formData;
    const _data: FieldValueDTO = data[name];
    const _optionid = _data.Options.find((option: any) => option.id == id);

    if (!_optionid) return;

    const numericValue = Number(value);

    if (
      !value ||
      isNaN(numericValue) ||
      numericValue < 1 ||
      numericValue > 100
    ) {
      setErrorMessage((prevErrors) => ({
        ...prevErrors,
        [`${name}_${id}`]: "error",
      }));
      message.error(
        `Value for ${name}'s ${id}st box should be between 1 and 100`
      );
    } else {
      setErrorMessage((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[`${name}_${id}`];
        return updatedErrors;
      });
    }
    _optionid.point = numericValue;
  };

  const handleSubmit = async () => {
    setLoader(true);
    const errors: { [key: string]: string } = {};
    const data: { [k: string]: any } = JsonData.formData;
    let isError = false;
    console.log(isError);
    console.log(selectedCompetition);

    for (const key in JsonData.formData) {
      if (Object.prototype.hasOwnProperty.call(JsonData.formData, key)) {
        const element: FieldValueDTO = data[key];
        element.Options.forEach((option: OptionDTO) => {
          const inputValue = fields[`${key}_${option.id}`];
          const numericValue = Number(inputValue);
          if (!inputValue) {
            errors[`${key}_${option.id}`] = "error";
            isError = true;
          } else if (
            isNaN(numericValue) ||
            numericValue < 1 ||
            numericValue > 100
          ) {
            message.error(
              `Value for ${key}'s ${option.id}st box should be between 1 and 100`
            );
            errors[`${key}_${option.id}`] = "error";
            isError = true;
          }
        });
      }
    }

    setErrorMessage(errors);

    if (Object.keys(errors).length > 0) {
      setLoader(false);
      return;
    }
    const feedbackData = {
      formData: JsonData.formData,
    };

    const querySnapshot = await getDocs(collection(FStore, "FEEDBACK"));
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      await setDoc(
        doc(FStore, "FEEDBACK", docId),
        { feedbackData },
        { merge: true }
      )
        .then(async () => {
          await setDoc(
            doc(FStore, "DEFAULT", "7TAUwqn8Ha9UVWwvrMKb"),
            { activeForm: feedbackData },
            { merge: true }
          );
        })
        .then(() => {
          setLoader(false);
          message.success("Form Updated Successfully");
        })
        .catch((error) => {
          setLoader(false);
          message.error(error);
        });
    } else {
      await addDoc(collection(FStore, "FEEDBACK"), feedbackData)
        .then(() => {
          setLoader(false);
          message.success("Form Added Successfully");
        })
        .catch((error) => {
          setLoader(false);
          message.error(error);
        });
    }
  };

  return (
    <Spin spinning={loader}>
      <div className="feedback-container">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="dashed" onClick={handleSubmit}>
            Make This Form Active
          </Button>
        </div>
        <div style={{ padding: "5px" }}></div>
        <div className="feedback-item">
          <b>Clarity of Content:</b>
          <div>{JsonData.formData["Clarity of Content"].Description}</div>
          <br />
          <div style={{ width: "100%" }} key={"sadsa"}>
            {JsonData.formData["Clarity of Content"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                }}
              >
                <Input
                  variant="borderless"
                  style={{ width: "100%" }}
                  readOnly
                  key={option.id}
                  value={option.value}
                />

                <Input
                  onChange={handleChange}
                  type="text"
                  status={
                    errorMessage[`Clarity of Content_${option.id}`]
                      ? "error"
                      : ""
                  }
                  name="Clarity of Content"
                  id={option.id.toString()}
                  placeholder="Give Point"
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-item">
          <b>Engagement Level:</b>
          <div>{JsonData.formData["Engagement Level"].Description}</div>
          <br />
          <div style={{ width: "100%" }} key={"sdsadas"}>
            {JsonData.formData["Engagement Level"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                  width: "100%",
                }}
              >
                <Input
                  variant="borderless"
                  readOnly
                  key={option.id}
                  value={option.value}
                />

                <Input
                  onChange={handleChange}
                  name="Engagement Level"
                  id={option.id.toString()}
                  type="text"
                  placeholder="Give Point"
                  status={
                    errorMessage[`Engagement Level_${option.id}`] ? "error" : ""
                  }
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-item" key="asdasbj">
          <b>Use of Visuals:</b>
          <div>{JsonData.formData["Use of Visuals"].Description}</div>
          <br />
          <div style={{ width: "100%" }}>
            {JsonData.formData["Use of Visuals"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                  width: "100%",
                }}
              >
                <Input
                  variant="borderless"
                  style={{ width: "100%" }}
                  readOnly
                  key={option.id}
                  value={option.value}
                />
                <Input
                  onChange={handleChange}
                  name="Use of Visuals"
                  id={option.id.toString()}
                  type="text"
                  placeholder="Give Point"
                  status={
                    errorMessage[`Use of Visuals_${option.id}`] ? "error" : ""
                  }
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-item" key="sdsads">
          <b>Explanation Impact:</b>
          <div>{JsonData.formData["Explanation Impact"].Description}</div>
          <br />
          <div style={{ width: "100%" }} key={"oiuhs"}>
            {JsonData.formData["Explanation Impact"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                  width: "100%",
                }}
              >
                <Input
                  variant="borderless"
                  style={{ width: "100%" }}
                  readOnly
                  key={option.id}
                  value={option.value}
                />

                <Input
                  onChange={handleChange}
                  name="Explanation Impact"
                  id={option.id.toString()}
                  type="text"
                  placeholder="Give Point"
                  status={
                    errorMessage[`Explanation Impact_${option.id}`]
                      ? "error"
                      : ""
                  }
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-item">
          <b>Question & Answers:</b>
          <div>{JsonData.formData["Question & Answers"].Description}</div>
          <br />
          <div style={{ width: "100%" }}>
            {JsonData.formData["Question & Answers"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                  width: "100%",
                }}
              >
                <Input
                  variant="borderless"
                  style={{ width: "100%" }}
                  readOnly
                  key={option.id}
                  value={option.value}
                />

                <Input
                  onChange={handleChange}
                  name="Question & Answers"
                  id={option.id.toString()}
                  type="text"
                  placeholder="Give Point"
                  status={
                    errorMessage[`Question & Answers_${option.id}`]
                      ? "error"
                      : ""
                  }
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-item">
          <b>Your Perception:</b>
          <div>{JsonData.formData["Your Perception"].Description}</div>
          <br />
          <div style={{ width: "100%" }}>
            {JsonData.formData["Your Perception"].Options.map((option) => (
              <div
                key={option.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px",
                  width: "100%",
                }}
              >
                {/* <Radio key={option.value} value={option.value}>
                  {option.value}
                  <div></div>
                </Radio> */}
                <Input
                  variant="borderless"
                  style={{ width: "100%" }}
                  readOnly
                  key={option.id}
                  value={option.value}
                />

                <Input
                  onChange={handleChange}
                  name="Your Perception"
                  id={option.id.toString()}
                  type="text"
                  placeholder="Give Point"
                  status={
                    errorMessage[`Your Perception_${option.id}`] ? "error" : ""
                  }
                  style={{ marginLeft: "10px", width: "100px" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" onClick={handleSubmit}>
            SUBMIT
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default Feedback;
