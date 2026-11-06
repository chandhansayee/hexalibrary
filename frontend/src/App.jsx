import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import LaunchPage from "./pages/launchpage";
import Registration from "./pages/registration";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/adminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LaunchPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;