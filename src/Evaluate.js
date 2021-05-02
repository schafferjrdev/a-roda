import React, { useState } from "react";
import "./App.css";
import { Button, Input } from "antd";
import _ from "lodash";
import CryptoJS from "crypto-js";

import "./Evaluate.css";

const { TextArea } = Input;

function App() {
  const [people, setPeople] = useState([]);
  const [encrypted, setEncrypted] = useState("");
  const [count, setCount] = useState(0);
  const [listText, setListText] = useState("");
  const [error, setError] = useState(false);
  const avaliacao = (data) => {
    // let sep = JSON.parse(data);
    // sep = _.compact(sep);
    // sep = sep.map((el, i) => {
    //   return {
    //     ...el,
    //     nota: i,
    //     firsts: i !== 0 ? 1 : 0,
    //   };
    // });
    // // sep = _.compact(sep);
    // if (people.length < 1) {
    //   setResult(sep);
    // } else {
    //   let sortPeople = _.sortBy(people, ["id"]);
    //   let sortSep = _.sortBy(sep, ["id"]);
    //   console.log(sortPeople, sortSep);
    //   if (sortPeople.length === sortSep.length) {
    //     let newArray = sortSep.map((el, i) => {
    //       let sum = el.nota + sortPeople[i].nota;
    //       let fst = el.firsts + sortPeople[i].firsts;
    //       return { ...el, nota: sum, firsts: fst };
    //     });
    //     setResult(_.sortBy(newArray, ["nota", "firsts"]));
    //   } else {
    //     console.log("TEM UM ERRO");
    //   }
    // }
  };

  const handleChange = (e) => {
    setListText(e.target.value);
    // console.log("Crypto", e.target.value);

    // const bytes = CryptoJS.AES.decrypt(e.target.value, "roda");
    // const originalText = bytes.toString(CryptoJS.enc.Utf8);
    const originalText = atob(e.target.value);
    setEncrypted(originalText);
    console.log("Decrypt", originalText);
  };

  const handleClear = () => {
    setListText("");
  };

  return (
    <div className="App">
      <div className="ui">
        <div className="grupo-texto">
          <TextArea
            onFocus={handleClear}
            className="texto"
            placeholder="Código"
            value={listText}
            onChange={handleChange}
          />
          <TextArea
            className="texto"
            placeholder="Participantes"
            value={encrypted}
            onChange={(e) => setEncrypted(e.target.value)}
          />
        </div>
        <Button onClick={avaliacao}>Avaliar ({count})</Button>
      </div>

      <div>
        {error && (
          <p style={{ color: "#ff1122" }}>Quantidade de pessoas está errada</p>
        )}
        Ordem
        {people.map((p, i) => (
          <p key={i}>
            {i + 1}º - {p.content} ({p.nota}) ({p.firsts}) ({p.nota + p.firsts})
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
