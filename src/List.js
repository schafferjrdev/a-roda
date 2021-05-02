import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Typography, Alert, Avatar, message } from "antd";
import firebase from "./firebase";

const { Text } = Typography;

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "rgb(8, 225, 242)" : "rgb(220, 255, 254)",
  border: "2px solid",
  borderColor: isDragging ? "rgb(9, 30, 66)" : "transparent",

  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "#aaa" : "#ddd",
  padding: grid,
  width: 300,
});

const List = (props) => {
  const { person, onExit } = props;

  const storage = firebase.storage().ref();
  const database = firebase
    .database()
    .ref()
    .child("participantes")
    .child(person.id);

  const [listText, setListText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState("");

  // const [today, setToday] = useState(false)
  // const [whois, setWhois] = useState('')

  useEffect(() => {
    storage
      .child(person?.id)
      .getDownloadURL()
      .then((url) => {
        setImgUrl(url);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const onDragEnd = async (result) => {
    // dropped outside the list
    setListText(null);
    if (!result.destination) {
      setLoading(false);
      return;
    }

    const items = reorder(
      props.items,
      result.source.index,
      result.destination.index
    );

    await props.onSort(items);
    setLoading(false);
  };

  const avaliar = () => {
    const persons = person.able ? [...props.items, person] : props.items;

    database
      .update({ ratings: btoa(JSON.stringify(persons)) })
      .then(() => message.success("Sua avaliação foi enviada"))
      .catch(() => message.error("Tente novamente"));
  };

  return (
    <>
      {listText && (
        <Alert
          style={{ width: "90vmin", marginBottom: "20px" }}
          message={<Text copyable>{listText}</Text>}
        />
      )}

      {/* <Input placeholder="Digite seu @" style={{ width: 250, marginBottom: '16px', marginRight: '16px' }} value={whois} onChange={e => setWhois(e.target.value)} />
            <div>
                <span style={{ marginRight: '8px' }}>Você entrou no jogo hoje?</span>
                <Switch checked={today} onChange={e => setToday(e)} checkedChildren="Sim" unCheckedChildren="Não" />
            </div> */}
      <Avatar size={64} src={imgUrl} />
      <p>{person?.content}</p>
      <DragDropContext
        onDragStart={() => setLoading(true)}
        onDragEnd={onDragEnd}
      >
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {props.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          marginRight: "12px",
                        }}
                      >
                        {index + 1}º -
                      </span>
                      <Avatar
                        size={75}
                        src={`https://firebasestorage.googleapis.com/v0/b/roda-bcec6.appspot.com/o/${item.id}?alt=media`}
                      />
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          marginLeft: "12px",
                        }}
                      >
                        {item.content}
                      </span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="buttons">
        <Button onClick={avaliar} disabled={loading}>
          Enviar avaliação
        </Button>
        <Button type="danger" onClick={onExit}>
          Sair
        </Button>
      </div>
    </>
  );
};

export default List;
