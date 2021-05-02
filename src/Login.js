import React, { useState } from "react";
import { Input, Card, Button } from "antd";
import "./Login.scss";

const Login = ({ onSubmit }) => {
  const [inputValue, setinputValue] = useState("");

  const handlePressEnter = (e) => {
    if (e.key === "Enter") {
      onSubmit(inputValue);
    }
  };
  return (
    <div className="background">
      <Card className="card-login">
        <Input.Password
          placeholder="Insira o código"
          onChange={(e) => setinputValue(e.target.value)}
          value={inputValue}
          onKeyDown={handlePressEnter}
          allowClear
        />
        <Button onClick={() => onSubmit(inputValue)}>Entrar</Button>
      </Card>
    </div>
  );
};

export default Login;
