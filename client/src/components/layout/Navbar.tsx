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

      <div className="flex-none flex items-center gap-2">
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

            <div className="hidden sm:flex items-center gap-2 max-w-[140px]">
              <span className="text-xs text-base-content/60 truncate">
                {user.name}
              </span>
              <span className="badge badge-primary badge-sm shrink-0">
                {user.role}
              </span>
            </div>

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
