import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectIssuesPage from "./pages/ProjectIssuesPage.jsx";
import IssueDetailPage from "./pages/IssueDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 인증이 필요한 라우트: Layout(헤더+컨테이너) 안에서 렌더 */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectIssuesPage />} />
        <Route
          path="/projects/:projectId/issues/:issueId"
          element={<IssueDetailPage />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
