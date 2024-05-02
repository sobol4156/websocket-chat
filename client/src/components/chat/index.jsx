import React, { useRef, useState, useEffect } from "react";
import tg from '../../assets/img/telegram.png';
import './chat.css'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const socket = useRef();
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  function connect() {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      setConnected(true);
      const message = {
        event: "connection",
        username,
        id: Date.now(),
      };
      socket.current.send(JSON.stringify(message));
    };
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [message, ...prev]);
    };
    socket.current.onclose = () => {
      console.log("Socket закрыт");
    };
    socket.current.onerror = () => {
      console.log("Socket произошла ошибка");
    };
  }

  // функция отправки сообщения на сокет
  const sendMessage = async () => {
    const message = {
      username,
      message: value,
      id: Date.now(),
      event: "message",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.current.send(JSON.stringify(message));
    setValue("");
  };
  //Остановка превычного поведения textarea для отправки сообщения через Enter
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.ctrlKey && value) {
      event.preventDefault(); // Отменяем действие по умолчанию при нажатии Enter
      sendMessage();
    } else if (event.key === "Enter" && event.ctrlKey) {
      setValue((prev) => prev + "\n"); // Добавляем перенос строки в поле ввода при нажатии Ctrl+Enter
    }
  };
  //UX подключение через Enter
  const connectedChat = (event) => {
    if (event.key === "Enter") {
      connect();
    }
  };

  if (!connected) {
    return (
      <div className="center">
        <div className="flex gap-4">
          <input
            className="text-[#282828] rounded-sm outline-none pl-3 "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Введите ваше имя"
            onKeyDown={connectedChat}
          />
          
          <button className="bg-slate-700 rounded-3xl p-2" onClick={connect}>
            Вход
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-100 border rounded bg-[#03161f] text-base flex flex-col">
      <div className="h-80 rounded-tl-2xl rounded-tr-2xl px-4 pb-3 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef}></div>
        {messages.map((mess) => (
          <div className="" key={mess.id}>
            {mess.event === "connection" ? (
              <div className="opacity-30 text-sm">
                Пользователь {mess.username} подключился
              </div>
            ) : (
              <div
                className={
                  mess.username === username
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <span
                  className="text-start bg-blue mt-1 p-2 rounded-2xl"
                  style={{
                    maxWidth: "calc(100% - 60px)",
                    overflowWrap: "break-word",
                    background: "#1376a8",
                  }}
                >
                  
                  {mess.message} <small>{mess.time}</small>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex relative items-center">
        <textarea
          className="rounded-tl-none rounded py-4 h-14 w-full bg-[#17212b] pl-2 pr-16 outline-none resize-none pt-4"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder="Введите сообщение"
          onKeyDown={handleKeyDown}
          
        ></textarea>
        <div>
          {value? <img src={tg} alt="Message" className="rotate-45 absolute right-5 bottom-3 cursor-pointer" onClick={sendMessage}/> : ""}
        
        </div>
      </div>
    </div>
  );
};

export default Chat;
