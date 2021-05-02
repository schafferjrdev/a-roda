import React, { useEffect, useState } from "react";
import firebase from "./firebase";
import "./App.css";
import { Empty, message } from "antd";
import List from "./List";
import Login from "./Login";

function App() {
  const database = firebase.database().ref().child("participantes");

  const [items, setItems] = useState(null);
  const [logged, setlogged] = useState(false);
  const [allPeople, setAllPeople] = useState(null);

  useEffect(() => {
    database.on(
      "value",
      function (snapshot) {
        const response = snapshot.val();

        const people = response
          ? Object.keys(response).map((key) => {
              return {
                id: key,
                content: response[key].content,
                able: response[key].able,
              };
            })
          : [];

        console.log("Mudou database");
        setAllPeople(people);

        setItems(
          people.filter((p) => p.able).filter((p) => p.id !== logged.id)
        );
        database.off();
      },
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );

    document.title = "Avaliador";
    // eslint-disable-next-line
  }, [logged]);

  const handleSubmit = (id) => {
    const person = allPeople?.find((item) => item.id === id);

    // setItems()
    if (person) {
      setlogged(person);
    } else {
      message.error("Código não confere");
    }
  };

  const person = allPeople?.find((p) => p.id === logged.id);

  return !logged ? (
    <Login onSubmit={handleSubmit} />
  ) : (
    <div className="App">
      {items ? (
        <List
          onExit={() => setlogged(false)}
          person={person}
          items={items}
          onSort={setItems}
        />
      ) : (
        <Empty
          description="Sem participantes"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
}

export default App;
