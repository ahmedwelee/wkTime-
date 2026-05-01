import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PendingPage from "./pages/PendingPage";
import EmployeePage from "./pages/EmployeePage";
import EmployeeCalendarPage from "./pages/EmployeeCalendarPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const user = JSON.parse(localStorage.getItem("wk_user") || "null");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/pending"
        element={
          <ProtectedRoute role="ADMIN">
            <PendingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/calendar"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeeCalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "ADMIN" ? "/admin" : "/employee"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
