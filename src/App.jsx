import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Showcase from "./pages/Showcase";
import Comunidade from "./pages/Comunidade";
import Post from "./pages/Post";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PushTokenBridge from "./components/PushTokenBridge";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PushTokenBridge />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Showcase />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/blog" element={<Navigate to="/comunidade" replace />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/notificacoes" element={<Notifications />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
