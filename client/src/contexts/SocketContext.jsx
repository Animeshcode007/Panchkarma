import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) socketRef.current.disconnect();
      return;
    }
    const token = localStorage.getItem("token");
    socketRef.current = io("http://localhost:5000", { auth: { token } });

    socketRef.current.on("connect", () => console.log("socket connected"));
    socketRef.current.on("notification", (n) => {
      setNotifications((prev) => [n, ...prev]);
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, notifications, setNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
};
