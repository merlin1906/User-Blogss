
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyAdmin } from "../services/adminService";

function AdminProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        await verifyAdmin();

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="admin-loading">Verifying admin access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
