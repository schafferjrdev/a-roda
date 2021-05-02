import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";

import "./App.css";
import {
  Typography,
  Input,
  Card,
  Avatar,
  Skeleton,
  Switch,
  Popconfirm,
  Popover,
  Button,
  message,
} from "antd";

import firebase from "./firebase";
import "./Evaluate.css";
import {
  UserAddOutlined,
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import UploadAvatar from "./UploadAvatar";
import Login from "./Login";

const VisibleText = ({ text }) => {
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible((prev) => !prev);
  };
  return (
    <p>
      <Typography.Text
        copyable
        className={`password${visible ? " hided" : ""}`}
      >
        {text}
      </Typography.Text>
      <span className="hide-btn" onClick={toggleVisible}>
        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
      </span>
    </p>
  );
};

const LoadingCard = () => (
  <Card
    size="small"
    className="participante-card"
    actions={[<DeleteOutlined />]}
    style={{ width: 250 }}
  >
    <Skeleton loading={true} avatar active>
      <Card.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title="Name"
        description="description"
      />
      <p>Texto interno</p>
    </Skeleton>
  </Card>
);

const Admin = () => {
  const database = firebase.database().ref().child("participantes");
  const storage = firebase.storage().ref();

  const [participantes, setPariticpantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPerson, setNewPerson] = useState("");

  const [logged, setLogged] = useState(false);

  const [result, setResult] = useState([]);

  useEffect(() => {
    setLoading(true);

    database.on(
      "value",
      function (snapshot) {
        const response = snapshot.val();
        setPariticpantes(
          response
            ? Object.keys(response).map((key) => ({
                id: key,
                ...response[key],
              }))
            : []
        );

        setLoading(false);
      },
      function (errorObject) {
        setLoading(false);
        console.log("The read failed: " + errorObject.code);
      }
    );

    document.title = "Dashboard";

    const pass = localStorage.getItem("login");

    if (pass === "666") {
      console.log("Login salvo!");
      setLogged(true);
    }
    // eslint-disable-next-line
  }, []);

  const handleAdd = (name) => {
    if (name) {
      const birth = new Date().toLocaleString();
      database.push().set({
        content: name,
        eval: 0,
        firsts: 0,
        date: birth,
        able: false,
      });
      setNewPerson("");
    }
  };

  const handleRemove = (id, name) => {
    database
      .child(id)
      .remove()
      .then(() => {
        message.success(`${name} removido!`);
        storage.child(id).delete();
      });
  };

  const handleChangeStatus = (val, id) => {
    database.child(id).update({ able: val });
  };

  const handleSubmit = (val) => {
    if (val === "666") {
      localStorage.setItem("login", val);
      setLogged(true);
    }
  };

  const rates = (ratings, able) => {
    if (ratings) {
      return able
        ? JSON.parse(atob(ratings)).slice(0, -1)
        : JSON.parse(atob(ratings));
    }
  };

  const resetEval = (id) => {
    database.child(id).child("ratings").remove();
  };

  const avaliacao = (data) => {
    let parsed = data.map((d) => {
      const voted = JSON.parse(atob(d.ratings)).map((el, i) => {
        return {
          ...el,
          nota: (el.nota ?? 0) + i,
          firsts: i !== 0 ? (el.firsts ?? 0) + 1 : (el.firsts ?? 0) + 0,
        };
      });
      return voted;
    });

    parsed = parsed.map((el) => {
      return _.sortBy(el, "id");
    });

    let result = [];
    parsed.forEach((element) => {
      result = element.map((el, i) => {
        let sum = el.nota + (result[i]?.nota ?? 0);
        let fst = el.firsts + (result[i]?.firsts ?? 0);
        return { ...el, nota: sum, firsts: fst };
      });
    });

    setResult(_.sortBy(result, ["nota", "firsts"]));
  };

  useEffect(() => {
    const finalVotes = [...participantes];
    console.log("finalVotes", finalVotes);

    if (finalVotes.every((el) => el.ratings) && finalVotes.length > 0) {
      message.success("Avaliações finalizadas");
      avaliacao(finalVotes);
    } else {
      setResult([]);
    }

    // eslint-disable-next-line
  }, [participantes]);

  const resetAllEval = () => {
    participantes.forEach((p) => resetEval(p.id));
  };

  const getOrders = (array, val) => {
    const finalNotes = _.uniq(
      array.map((e) => e.map((p) => p.nota + p.firsts))[0]
    );
    const dic = {};

    finalNotes.forEach((e, i) => {
      dic[e] = i + 1;
    });

    return `${dic[val]}º - `;
  };

  const hasOneEval = useMemo(() => participantes.some((el) => el.ratings), [
    participantes,
  ]);

  return !logged ? (
    <Login onSubmit={handleSubmit} />
  ) : (
    <div className="App">
      <h2>Participantes</h2>
      <div className="participantes">
        {loading && <LoadingCard />}
        {participantes.map((p) => (
          <Card
            size="small"
            className="participante-card"
            key={p.id}
            actions={[
              <Popconfirm
                title={`Deseja remover ${p.content}?`}
                onConfirm={() => handleRemove(p.id, p.content)}
                okText="Sim"
                cancelText="Não"
              >
                <DeleteOutlined />
              </Popconfirm>,
              <Switch
                checked={p.able}
                checkedChildren="Disponível"
                unCheckedChildren="Indisponível"
                onChange={(e) => handleChangeStatus(e, p.id)}
              />,
            ]}
          >
            <Card.Meta
              avatar={<UploadAvatar id={p.id} />}
              title={p.content}
              description={p.date}
            />
            <VisibleText text={p.id} />
            <Popover
              placement="topLeft"
              content={
                <div>
                  {rates(p.ratings, p.able)?.map((e, i) => (
                    <p>
                      {i + 1}º - {e.content}
                    </p>
                  ))}
                </div>
              }
            >
              <span className="avaliacao" onClick={() => resetEval(p.id)}>
                Avaliação:{" "}
                {p.ratings ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <WarningOutlined style={{ color: "#ddaa00" }} />
                )}
              </span>
            </Popover>
          </Card>
        ))}
        {!loading && (
          <Card size="small" className="participante-card">
            <p>Novo participante</p>
            <Input.Search
              onSearch={handleAdd}
              enterButton={<UserAddOutlined />}
              value={newPerson}
              allowClear
              onChange={(e) => setNewPerson(e.target.value)}
            />
            <Button onClick={resetAllEval} style={{ marginTop: "50px" }}>
              Limpar avaliações
            </Button>
          </Card>
        )}
      </div>
      {result.length > 0 ? (
        <>
          <h2>Resultado</h2>
          <div>
            {result.map((p, i) => (
              <Popover
                content={
                  <div>
                    <p>Nota: {p.nota}</p>
                    <p>Primeiros: {p.firsts}</p>
                    <p>Soma: {p.nota + p.firsts}</p>
                  </div>
                }
                placement="left"
                title="Avaliação"
              >
                <p key={i} className="result-item">
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginRight: "24px",
                    }}
                  >
                    {getOrders([result], p.nota + p.firsts)}
                  </span>
                  <Avatar
                    size={200}
                    src={`https://firebasestorage.googleapis.com/v0/b/roda-bcec6.appspot.com/o/${p.id}?alt=media`}
                  />{" "}
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginLeft: "24px",
                    }}
                  >
                    {p.content}
                  </span>
                </p>
              </Popover>
            ))}
          </div>
        </>
      ) : hasOneEval ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginRight: "20px" }}>Aguardando avaliações</h2>{" "}
          <LoadingOutlined />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Admin;
