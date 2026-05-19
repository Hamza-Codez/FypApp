import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { fetchMe } from "./features/auth/authSlice";
import { loadTheme } from "./features/themeSlice";

// Pages
const Layout = lazy(() => import("./pages/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Team = lazy(() => import("./pages/Team"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const TaskDetails = lazy(() => import("./pages/TaskDetails"));
const AIScreener = lazy(() => import("./pages/AIScreener"));
const Login = lazy(() => import("./pages/Auth/Login"));
const SignupHR = lazy(() => import("./pages/Auth/SignupHR"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const MyTasks = lazy(() => import("./pages/MyTasks"));
const TaskReports = lazy(() => import("./pages/TaskReports"));
const Notifications = lazy(() => import("./pages/Notifications"));

const ChangePassword = lazy(() => import("./pages/Auth/ChangePassword"));

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Loading workspace...</p>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { token, user } = useSelector((state) => state.auth);
    if (!token) return <Navigate to="/" />;
    
    // Redirect if password change is required, but allow access to the change-password page itself
    if (user?.must_change_password && window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" />;
    }
    
    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(loadTheme());
        if (token && !user) {
            dispatch(fetchMe());
        }
    }, [dispatch, token, user]);

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Toaster />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup-hr" element={<SignupHR />} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                    <Route path="ai-screener" element={<AIScreener />} />
                    <Route path="my-tasks" element={<MyTasks />} />
                    <Route path="task-reports" element={<TaskReports />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="notifications" element={<Notifications />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default App;
