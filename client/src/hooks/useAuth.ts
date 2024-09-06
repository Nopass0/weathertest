import { useDispatch, useSelector } from "react-redux";
import api from "@/api/axiosConfig";

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
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", token });
      dispatch({ type: "SET_USER", user });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Перебрасываем ошибку, чтобы обработать её в компоненте
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/register", {
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
      throw error; // Перебрасываем ошибку, чтобы обработать её в компоненте
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "SET_TOKEN", token: "" });
    dispatch({ type: "SET_USER", user: null });
  };

  const checkToken = async (): Promise<User | null> => {
    try {
      const response = await api.get("/api/auth/check", {
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
