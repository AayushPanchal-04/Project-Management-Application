import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { ArrowLeftIcon } from 'lucide-react'

const SignInPage = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 dark:bg-zinc-950">
            <Link
                to="/"
                className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
                <ArrowLeftIcon size={15} />
                Back to home
            </Link>

            <SignIn fallbackRedirectUrl="/dashboard" />
        </div>
    )
}

export default SignInPage
