import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

interface User {
  email: string;
  role: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.token);
  const user = useSelector((state: any) => state.user);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", token });
      dispatch({ type: "SET_USER", user });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/register", {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", token });
      dispatch({ type: "SET_USER", user });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "SET_TOKEN", token: "" });
    dispatch({ type: "SET_USER", user: null });
  };

  const checkToken = async (): Promise<User | null> => {
    try {
      const response = await axios.get("/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user: User = response.data.user;
      dispatch({ type: "SET_USER", user });
      return user;
    } catch (error) {
      console.error("Token check error:", error);
      logout();
      return null;
    }
  };

  return { token, user, login, register, logout, checkToken };
};
