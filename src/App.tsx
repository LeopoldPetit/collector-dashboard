import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import DashboardPage from "@/pages/DashboardPage";
import TechnicalPage from "@/pages/TechnicalPage";
import ProjectsPage from "@/pages/ProjectsPage";
import DevOpsPage from "@/pages/DevOpsPage";
import BusinessPage from "@/pages/BusinessPage";
import SettingsPage from "@/pages/SettingsPage";
import CollectorPage from "@/pages/CollectorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="technical" element={<TechnicalPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="devops" element={<DevOpsPage />} />
          <Route path="business" element={<BusinessPage />} />
          <Route path="collector" element={<CollectorPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
