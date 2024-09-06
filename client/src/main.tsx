import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AuthPage from "@/pages/Auth";
import AdminPage from "@/pages/Admin";
import WeatherPage from "@/pages/Weather";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import { IRouterLink } from "./types";
import {
  Navigate,
  useNavigate,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

// Redux store
const defaultState = {
  token: localStorage.getItem("token") || "",
  user: null,
};

const reducer = (state = defaultState, action: any) => {
  switch (action.type) {
    case "SET_TOKEN":
      return {
        ...state,
        token: action.token,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

const store = createStore(reducer);

// Router links
const publicLinks: IRouterLink[] = [
  {
    element: <AuthPage />,
    path: "/auth",
  },
];

const privateLinks: IRouterLink[] = [
  {
    element: <WeatherPage />,
    path: "/weather",
  },
  {
    element: <AdminPage />,
    path: "/admin",
  },
];

// Loader component
const Loader: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// AppContent component
const AppContent: React.FC = () => {
  const { checkToken } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.token);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const user = await checkToken();
          if (user) {
            dispatch({ type: "SET_USER", user });
            toast({
              title: "Авторизация успешна",
              description: `Добро пожаловать, ${user.email}!`,
            });
          } else {
            throw new Error("Invalid token");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          dispatch({ type: "SET_TOKEN", token: "" });
          localStorage.removeItem("token");
          navigate("/auth");
          toast({
            title: "Ошибка авторизации",
            description: "Пожалуйста, войдите снова.",
            variant: "destructive",
          });
        }
      } else {
        navigate("/auth");
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      {publicLinks.map((link) => (
        <Route key={link.path} path={link.path} element={link.element} />
      ))}
      {privateLinks.map((link) => (
        <Route key={link.path} path={link.path} element={link.element} />
      ))}
      <Route path="/" element={<Navigate to="/weather" replace />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

// App component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
};

// Render
console.log("Starting to render app");
const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
