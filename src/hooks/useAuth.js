import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();
import axios from "../configs/axios"
console.log(axios)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  const login = async (data) => {
    axios.post("api/login", data).then((res) => {
    const dataLogin = res.data;
    if(dataLogin.status_code == 200) {
      setUser(dataLogin.user)
      localStorage.setItem("user", JSON.stringify(dataLogin.user))
      localStorage.setItem("access_token", dataLogin.access_token)
      localStorage.setItem("refresh_token", dataLogin.refresh_token)
      navigate("/dashboard/profile", { replace: true });
    }
  })
  };

  const logout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
