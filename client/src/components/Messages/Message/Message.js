import React, { useEffect, useState } from "react";
import ReactEmoji from "react-emoji";

import "./Message.css";

const Message = ({ message: { user, text }, name }) => {
  let isSentByCurrentUser = false;

  const [trimmedName, setTrimmedName] = useState("");

  useEffect(() => {
    setTrimmedName(name.trim().toLowerCase());
  }, [name, user]);

  if (user === trimmedName) isSentByCurrentUser = true;

  return isSentByCurrentUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">{trimmedName}</p>
      <div className="messageBox backgroundBlue">
        <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
      </div>
    </div>
  ) : (
    <div className="messageContainer justifyStart">
      <div className="messageBox backgroundLight">
        <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
        <p className="sentText pl-10">{user}</p>
      </div>
    </div>
  );
};

export default Message;
