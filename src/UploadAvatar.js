import React, { useState, useEffect } from "react";
import { Upload, Avatar } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import firebase from "./firebase";

import "./UploadAvatar.scss";

const UploadAvatar = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const storage = firebase.storage().ref();

  const handleChange = (info, id) => {
    setLoading(true);
    const uploadTask = storage.child(id).put(info.file.originFileObj);
    uploadTask.on("state_changed", console.log, console.error, () => {
      storage
        .child(id)
        .getDownloadURL()
        .then((url) => {
          setLoading(false);
          setImageUrl(url);
        });
    });
  };

  useEffect(() => {
    setLoading(true);
    storage
      .child(id)
      .getDownloadURL()
      .then((url) => {
        setImageUrl(url);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  return (
    <div className="avatar-group">
      <Avatar className="avatar-pic" size={64} src={imageUrl} />
      <Upload
        className="avatar-uploader"
        showUploadList={false}
        onChange={(e) => handleChange(e, id)}
      >
        <PlusOutlined />
      </Upload>
      {loading && <LoadingOutlined className="avatar-load" />}
    </div>
  );

  //   return imageUrl ? (
  //     <Avatar size={64} src={imageUrl} />
  //   ) : (
  //     <Upload
  //       name="avatar"
  //       listType="picture-card"
  //       className="avatar-uploader"
  //       showUploadList={false}
  //       //   action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
  //       onChange={(e) => handleChange(e, id)}
  //       // style={{ width: "50px" }}
  //     >
  //       {uploadButton}
  //     </Upload>
  //   );
};

export default UploadAvatar;
