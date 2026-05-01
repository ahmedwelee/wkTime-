import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("wk_user") || "{}");

  const logout = () => {
    localStorage.removeItem("wk_user");
    localStorage.removeItem("wk_token");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div>
        <h1>WK Time</h1>
        <p>{user.fullName || "User"}</p>
      </div>
      <button className="btn btn-outline" onClick={logout}>Logout</button>
    </header>
  );
}

