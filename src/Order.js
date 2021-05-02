import React, { useEffect, useState } from "react";
import firebase from "./firebase";
import "./App.css";
import { Button, Input, Empty } from "antd";
import _ from "lodash";
import List from "./List";

// database.push().set({});

// database.on(
//   "value",
//   function (snapshot) {
//     const response = snapshot.val();
//     database.off();
//   },
//   function (errorObject) {
//     console.log("The read failed: " + errorObject.code);
//   }
// );

function Order() {
  const database = firebase.database().ref().child("participantes");

  useEffect(() => {
    // database.push().set({ content: "Schaffer", eval: 0, firsts: 0 });

    database.on(
      "value",
      function (snapshot) {
        const response = snapshot.val();
        console.log("res", response);
        // setItems(
        //   response.map((res, i) => ({ content: res, id: i.toString() }))
        // );
      },
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );
    // eslint-disable-next-line
  }, []);

  const [listText, setListText] = useState("");
  const [items, setItems] = useState(null);
  console.log(items);
  const inserir = () => {
    let sep = listText.split(";");
    sep = _.compact(sep);
    sep = sep.map((el, i) => {
      if (el.trim()) {
        return { content: el.trim().toLowerCase(), id: i.toString() };
      } else {
        return null;
      }
    });
    sep = _.compact(sep);
    setItems(sep);
  };

  return (
    <div className="App">
      {!items && (
        <div className="ui">
          <Input
            className="solo-texto"
            placeholder="Participantes"
            value={listText}
            onChange={(e) => setListText(e.target.value)}
          />

          <Button onClick={inserir} disabled={!listText}>
            Inserir
          </Button>
        </div>
      )}
      {items ? (
        <List items={items} onSort={setItems} />
      ) : (
        <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
}

export default Order;
