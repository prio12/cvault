import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const userParam = searchParams.get("user");

  useEffect(() => {
    if (token && userParam) {
      try {
        const realUser = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(realUser));

        useAuthStore.setState({ user: realUser });

        navigate("/positions");
      } catch (error) {
        console.error("Failed to parse OAuth user data", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [token, userParam, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Completing secure sign-in...
        </p>
      </div>
    </div>
  );
}
