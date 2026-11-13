
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import BlogListing from "./pages/BlogListing";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddArticle from "./pages/AddArticle";
import AdminCategories from "./pages/AdminCategories";

import AdminProtectedRoute from "./components/AdminProtectedRoute";

import "./App.css";
import "./Admin.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Blog Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<BlogListing />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/articles/new"
          element={
            <AdminProtectedRoute>
              <AddArticle />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/articles/edit/:id"
          element={
            <AdminProtectedRoute>
              <AddArticle />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <AdminCategories />
            </AdminProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
