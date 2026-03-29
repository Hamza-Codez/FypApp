import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import AIScreener from "./pages/AIScreener";
import Login from "./pages/Auth/Login";
import SignupHR from "./pages/Auth/SignupHR";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "./features/auth/authSlice";
import { LayoutDashboardIcon, FolderOpenIcon, UsersIcon, SettingsIcon, BrainCircuitIcon } from 'lucide-react';
import Home from "./pages/Home";

import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    if (!token) return <Navigate to="/login" />;
    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token && !user) {
            dispatch(fetchMe());
        }
    }, [dispatch, token, user]);
    return (
        <>
            <Toaster />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup-hr" element={<SignupHR />} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                    <Route path="ai-screener" element={<AIScreener />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;
