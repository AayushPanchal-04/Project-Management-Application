import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Team from './pages/Team'
import ProjectDetails from './pages/ProjectDetails'
import TaskDetails from './pages/TaskDetails'
import Landing from './pages/Landing'
import SignInPage from './pages/SignInPage'
import { useAuth } from '@clerk/clerk-react'
import { Loader2Icon } from 'lucide-react'

// Guards the app routes: signed-out visitors are sent to the sign-in page
const ProtectedApp = () => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!isSignedIn) {
        return <Navigate to="/signin" replace />
    }

    return <Layout />
}

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<SignInPage />} />

                {/* Protected - all share the app shell from Layout */}
                <Route element={<ProtectedApp />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/projectsDetail" element={<ProjectDetails />} />
                    <Route path="/taskDetails" element={<TaskDetails />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
