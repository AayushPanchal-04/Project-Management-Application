import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Navigate, Outlet } from 'react-router-dom'
import { CreateOrganization, useAuth, useUser, useOrganizationList } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorkspaces } from '../features/workspaceSlice'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [ready, setReady] = useState(false)
    const { user, isLoaded } = useUser()
    const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({ userMemberships: true })
    const { workspaces } = useSelector((state) => state.workspace)
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const organizationCount = userMemberships?.data?.length ?? 0

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    // Load workspaces, and re-load whenever the user's organizations change
    // (e.g. right after a workspace/organization is created or deleted)
    useEffect(() => {
        if (!isLoaded || !orgsLoaded || !user?.id) return

        let cancelled = false
        dispatch(fetchWorkspaces({ getToken })).finally(() => {
            if (!cancelled) setReady(true)
        })

        return () => { cancelled = true }
    }, [user?.id, isLoaded, orgsLoaded, organizationCount])

    // Wait for Clerk before deciding anything, otherwise the shell would
    // briefly render while the session is still loading.
    if (!isLoaded) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/signin" replace />
    }

    if (!ready) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (workspaces.length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white dark:bg-zinc-950">
                <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
