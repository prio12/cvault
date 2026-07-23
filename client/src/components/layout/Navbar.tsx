import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="flex-1">
        <Link to="/" className="text-lg font-bold text-primary">
          CVault
        </Link>
      </div>

      <div className="flex-none gap-2">
        <Link to="/positions" className="btn btn-ghost btn-sm">
          Positions
        </Link>

        {user && (
          <>
            <Link to="/attributes" className="btn btn-ghost btn-sm">
              Attributes
            </Link>
            <Link to="/profile" className="btn btn-ghost btn-sm">
              Profile
            </Link>
            <span className="text-sm text-base-content/60 hidden sm:inline">
              {user.name} · {user.role}
            </span>
            <button className="btn btn-sm btn-error" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
