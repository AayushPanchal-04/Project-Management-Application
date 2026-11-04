import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { loadTheme, toggleTheme } from '../features/themeSlice'
import {
    LayoutDashboardIcon,
    ArrowRightIcon,
    MoonIcon,
    SunIcon,
    FolderOpenIcon,
    ListChecksIcon,
    UsersIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
    BarChart3Icon,
    BellRingIcon,
    MessageSquareIcon,
    CheckIcon,
    CheckCircle,
    Clock,
    Lock,
    PlusIcon,
    SearchIcon,
    SettingsIcon,
} from 'lucide-react'

const cardStyle =
    'bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-lg'

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 active:scale-[0.98]'

const secondaryButton =
    'inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98]'

const mutedText = 'text-zinc-500 dark:text-zinc-400'

// Reveals an element once it scrolls into view
function useReveal() {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15 },
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }) {
    const { ref, visible } = useReveal()

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.97]'} ${className}`}
        >
            {children}
        </div>
    )
}

function useCountUp(target, active, duration = 1200) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (!active) return

        let frame
        const start = performance.now()

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))))
            if (progress < 1) frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target, active, duration])

    return value
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                {title}
            </h2>
            <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>{description}</p>
        </Reveal>
    )
}

const stats = [
    { value: 5, label: 'Project statuses', detail: 'Active, planning, on hold, completed, cancelled' },
    { value: 3, label: 'Task stages', detail: 'To do, in progress and done' },
    { value: 5, label: 'Task types', detail: 'Task, bug, feature, improvement, other' },
    { value: 3, label: 'Priority levels', detail: 'Low, medium and high' },
]

function StatItem({ value, label, detail, active, delay }) {
    const count = useCountUp(value, active)

    return (
        <Reveal delay={delay} className="px-6 py-8 text-center lg:text-left">
            <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{count}</p>
            <p className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</p>
            <p className={`mt-1.5 text-xs leading-relaxed ${mutedText}`}>{detail}</p>
        </Reveal>
    )
}

const techStack = [
    'React',
    'Vite',
    'Tailwind CSS',
    'Redux Toolkit',
    'Express',
    'Prisma',
    'PostgreSQL',
    'Clerk',
    'Inngest',
]

const projectProgress = [
    { name: 'Mobile app revamp', progress: 82 },
    { name: 'Billing migration', progress: 45 },
    { name: 'Design system', progress: 96 },
]

const throughput = [42, 68, 35, 84, 58, 72, 95, 51]

const features = [
    {
        icon: FolderOpenIcon,
        title: 'Projects with real progress',
        description: 'Give every project a status, priority, lead and delivery window, then track completion as the work moves.',
        accent: 'bg-blue-500/10 text-blue-500',
        span: 'lg:col-span-3',
        visual: 'progress',
    },
    {
        icon: BarChart3Icon,
        title: 'Analytics that stay current',
        description: 'Workload, completion and overdue counts are derived from live task data, so reporting never goes stale.',
        accent: 'bg-rose-500/10 text-rose-500',
        span: 'lg:col-span-3',
        visual: 'chart',
    },
    {
        icon: UsersIcon,
        title: 'Tasks and assignees',
        description: 'Type, status, priority and due dates on every task, with one clear owner.',
        accent: 'bg-purple-500/10 text-purple-500',
        span: 'lg:col-span-2',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Role-based access',
        description: 'Admins manage the workspace and destructive actions; members focus on their own work.',
        accent: 'bg-amber-500/10 text-amber-500',
        span: 'lg:col-span-2',
    },
    {
        icon: CalendarDaysIcon,
        title: 'Calendar view',
        description: 'Every due date on a single timeline so the week is planned, not guessed.',
        accent: 'bg-sky-500/10 text-sky-500',
        span: 'lg:col-span-2',
    },
    {
        icon: BellRingIcon,
        title: 'Notifications',
        description: 'Assignment and due-date reminders reach the right person automatically.',
        accent: 'bg-indigo-500/10 text-indigo-500',
        span: 'lg:col-span-2',
    },
    {
        icon: MessageSquareIcon,
        title: 'Task comments',
        description: 'Decisions stay next to the task instead of getting buried in a chat thread.',
        accent: 'bg-teal-500/10 text-teal-500',
        span: 'lg:col-span-2',
    },
    {
        icon: ListChecksIcon,
        title: 'Clean data model',
        description: 'Cascade deletes keep workspaces, projects and tasks consistent as things change.',
        accent: 'bg-emerald-500/10 text-emerald-500',
        span: 'lg:col-span-2',
    },
]

function FeatureVisual({ kind }) {
    if (kind === 'progress') {
        return (
            <div className="mt-6 space-y-4">
                {projectProgress.map((project) => (
                    <div key={project.name}>
                        <div className="flex items-center justify-between gap-4">
                            <span className="truncate text-xs text-zinc-600 dark:text-zinc-300">{project.name}</span>
                            <span className="shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">{project.progress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${project.progress}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="mt-6">
            <div className="flex h-24 items-end gap-2">
                {throughput.map((height, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t bg-blue-500/80 transition-all duration-500 dark:bg-blue-500/70"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
            </div>
        </div>
    )
}

const steps = [
    {
        title: 'Create a workspace',
        description: 'Sign in and set up your first workspace. Invite the people you work with and set their role.',
    },
    {
        title: 'Plan the delivery',
        description: 'Add projects with a lead and dates, then break the work into tasks with clear owners.',
    },
    {
        title: 'Track and ship',
        description: 'Follow progress on the dashboard and calendar, act on overdue work, deliver on time.',
    },
]

const highlights = [
    { icon: Lock, title: 'Secure by default', description: 'Clerk handles sign-in and sessions; every API route requires a valid token.' },
    { icon: Clock, title: 'Nothing goes overdue silently', description: 'Due-date reminders reach assignees before a deadline slips.' },
    { icon: CheckCircle, title: 'One source of truth', description: 'Projects, tasks and comments live together instead of across tools.' },
]

const faqs = [
    {
        question: 'How do I get started?',
        answer: 'Sign in with Clerk, create your first workspace and you are ready to add projects and tasks. Existing team members can be invited straight into the workspace.',
    },
    {
        question: 'How are permissions handled?',
        answer: 'Each workspace has its own members and roles. Admins can create, update and delete projects and manage the workspace, while members work on the tasks assigned to them.',
    },
    {
        question: 'Is the workspace shared with my team?',
        answer: 'Yes. A workspace is the shared boundary for a team — its projects, tasks and comments are visible to everyone in that workspace.',
    },
    {
        question: 'What happens when I delete a workspace?',
        answer: 'Deleting a workspace removes its projects and their tasks and comments with it, so nothing is left orphaned in the database.',
    },
]

const previewTasks = [
    { name: 'Finalise design system tokens', meta: 'Due 12 Nov', status: 'DONE' },
    { name: 'Wire up the reporting API', meta: 'Due 14 Nov', status: 'IN PROGRESS' },
    { name: 'Fix onboarding redirect bug', meta: 'Due 15 Nov', status: 'TODO' },
]

const statusStyle = {
    DONE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'IN PROGRESS': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    TODO: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400',
}

const heroStats = [
    { label: 'Projects', value: '12' },
    { label: 'Completed', value: '7' },
    { label: 'Overdue', value: '2' },
]

const navItems = [
    { icon: LayoutDashboardIcon, label: 'Dashboard', active: true },
    { icon: FolderOpenIcon, label: 'Projects', active: false },
    { icon: UsersIcon, label: 'Team', active: false },
    { icon: SettingsIcon, label: 'Settings', active: false },
]

const Landing = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { theme } = useSelector((state) => state.theme)
    const { ref: statsRef, visible: statsVisible } = useReveal()
    const { isSignedIn } = useAuth()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const goToSignIn = () => navigate('/signin')
    // Signed-in visitors should never be sent back through the sign-in page
    const goToApp = () => navigate(isSignedIn ? '/dashboard' : '/signin')
    const ctaLabel = isSignedIn ? 'Go to dashboard' : 'Get started'

    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Header */}
            <header
                className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-200 ${
                    scrolled
                        ? 'border-zinc-200 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950/80'
                        : 'border-transparent bg-white/60 dark:bg-zinc-950/60'
                }`}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-md bg-blue-600 text-white">
                            <LayoutDashboardIcon size={18} />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                            Project Management
                        </span>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex">
                        <a href="#platform" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                            Platform
                        </a>
                        <a href="#features" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                            Features
                        </a>
                        <a href="#workflow" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                            How it works
                        </a>
                        <a href="#faq" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            aria-label="Toggle theme"
                            className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white transition hover:scale-105 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            {theme === 'light'
                                ? <MoonIcon className="size-4 text-zinc-700" />
                                : <SunIcon className="size-4 text-yellow-400" />}
                        </button>

                        {!isSignedIn && (
                            <button
                                onClick={goToSignIn}
                                className={`hidden text-sm transition hover:text-zinc-900 sm:block dark:hover:text-white ${mutedText}`}
                            >
                                Sign in
                            </button>
                        )}

                        <button onClick={goToApp} className={primaryButton}>
                            {ctaLabel}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative isolate">
                {/* Subtle grid backdrop */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(228,228,231,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(228,228,231,0.65)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(39,39,42,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.6)_1px,transparent_1px)]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-[860px] max-w-full -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
                />

                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
                    <div>
                        <Reveal>
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Built for modern product teams
                            </div>
                        </Reveal>

                        <Reveal delay={80}>
                            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.4rem] dark:text-white">
                                Plan, track and ship your team&rsquo;s work in one place.
                            </h1>
                        </Reveal>

                        <Reveal delay={160}>
                            <p className={`mt-6 max-w-xl text-base leading-relaxed sm:text-lg ${mutedText}`}>
                                Workspaces, projects, tasks and people in a single system. Assign clear owners,
                                follow progress as it happens and keep every deadline visible.
                            </p>
                        </Reveal>

                        <Reveal delay={240}>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button onClick={goToApp} className={primaryButton}>
                                    {ctaLabel}
                                    <ArrowRightIcon size={16} />
                                </button>
                                {!isSignedIn && (
                                    <button onClick={goToSignIn} className={secondaryButton}>
                                        Sign in
                                    </button>
                                )}
                            </div>
                        </Reveal>

                        <Reveal delay={320}>
                            <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                {[
                                    'Secure sign-in with Clerk',
                                    'Role-based permissions',
                                    'Assignment and due-date emails',
                                    'Dark and light themes',
                                ].map((item) => (
                                    <li key={item} className={`flex items-center gap-2 text-sm ${mutedText}`}>
                                        <CheckIcon size={15} className="shrink-0 text-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>

                    {/* Product mock */}
                    <Reveal delay={200} className="relative">
                        <div className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-full bg-blue-500/10 blur-2xl lg:block" />

                        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_20px_60px_-24px_rgba(24,24,27,0.25)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)]">
                            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                <span className="ml-3 text-xs text-zinc-400 dark:text-zinc-500">
                                    Product Launch / Sprint 12
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-[168px_1fr]">
                                <div className="hidden flex-col border-r border-zinc-200 bg-zinc-50/50 p-3 sm:flex dark:border-zinc-800 dark:bg-zinc-950/40">
                                    <div className="mb-3 flex items-center gap-2.5 rounded-md px-2 py-2">
                                        <div className="grid size-7 place-items-center rounded bg-blue-600 text-[10px] font-semibold text-white">
                                            PL
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">
                                                Product Launch
                                            </p>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">8 members</p>
                                        </div>
                                    </div>

                                    {navItems.map(({ icon: Icon, label, active }) => (
                                        <div
                                            key={label}
                                            className={`flex items-center gap-2 rounded px-2.5 py-2 text-xs ${
                                                active
                                                    ? 'bg-white font-medium text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-white'
                                                    : 'text-zinc-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </div>
                                    ))}

                                    <div className="mt-auto pt-4">
                                        <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            My tasks
                                        </p>
                                        <div className="mt-2 space-y-1.5 px-2.5">
                                            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Review launch checklist
                                            </p>
                                            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Sync billing webhooks
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                                            <div className="rounded-md border border-zinc-200 bg-white py-2 pl-8 pr-3 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
                                                Search projects, tasks...
                                            </div>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {['A', 'J', 'O'].map((initial) => (
                                                <div
                                                    key={initial}
                                                    className="grid size-6 place-items-center rounded-full border-2 border-white bg-zinc-200 text-[9px] font-medium text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-200"
                                                >
                                                    {initial}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {heroStats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-md border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950/50"
                                            >
                                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                                                <p className="mt-1 text-lg font-bold text-zinc-800 dark:text-white">
                                                    {stat.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                                        {previewTasks.map((task) => (
                                            <div key={task.name} className="flex items-center justify-between gap-3 px-3 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs text-zinc-700 dark:text-zinc-200">
                                                        {task.name}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                                                        {task.meta}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wide ${statusStyle[task.status]}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating card */}
                        <div className="absolute -bottom-5 -left-4 hidden rounded-lg border border-zinc-200 bg-white/80 p-3 shadow-lg backdrop-blur-xl sm:block dark:border-zinc-700 dark:bg-zinc-900/80">
                            <div className="flex items-center gap-2.5">
                                <div className="grid size-8 place-items-center rounded-full bg-emerald-500/10">
                                    <CheckIcon size={15} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-800 dark:text-white">Task completed</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Design system · just now</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Tech strip */}
                <div className="border-t border-zinc-200 dark:border-zinc-800">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <Reveal className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                                Built with
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                                {techStack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="text-sm font-medium text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Platform / stats */}
            <section id="platform" ref={statsRef} className="scroll-mt-20 border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
                    <SectionHeading
                        eyebrow="The platform"
                        title="A complete work model, out of the box"
                        description="Statuses, types and priorities are already defined, so your team can start working immediately instead of configuring the tool first."
                    />

                    <div className="mt-12 grid grid-cols-1 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                        {stats.map((stat, i) => (
                            <StatItem key={stat.label} {...stat} active={statsVisible} delay={i * 80} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-28">
                <SectionHeading
                    eyebrow="Features"
                    title="Everything your team needs"
                    description="One place for planning, execution and reporting, with permissions that scale as the team grows."
                />

                <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-6">
                    {features.map(({ icon: Icon, title, description, accent, span, visual }, i) => (
                        <Reveal
                            key={title}
                            delay={(i % 3) * 90}
                            className={`${cardStyle} ${span} hover:-translate-y-0.5`}
                        >
                            <div className="flex h-full flex-col p-6">
                                <div className={`grid size-10 place-items-center rounded-xl ${accent}`}>
                                    <Icon size={20} />
                                </div>
                                <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">{title}</p>
                                <p className={`mt-2 text-sm leading-relaxed ${mutedText}`}>{description}</p>
                                {visual && <FeatureVisual kind={visual} />}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Workflow */}
            <section id="workflow" className="scroll-mt-20 border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
                    <SectionHeading
                        eyebrow="How it works"
                        title="From an empty workspace to shipped work"
                        description="Three steps to get a team running, without a setup project of its own."
                    />

                    <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {steps.map((step, i) => (
                            <Reveal key={step.title} delay={i * 110} className={`${cardStyle} relative overflow-hidden`}>
                                <div className="p-7">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-9 place-items-center rounded-md bg-blue-600 text-sm font-semibold text-white">
                                            {i + 1}
                                        </span>
                                        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                                    </div>
                                    <p className="mt-5 text-base font-semibold text-zinc-900 dark:text-white">{step.title}</p>
                                    <p className={`mt-2.5 text-sm leading-relaxed ${mutedText}`}>{step.description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {highlights.map(({ icon: Icon, title, description }, i) => (
                            <Reveal key={title} delay={i * 90} className="flex items-start gap-4">
                                <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-800 dark:text-white">{title}</p>
                                    <p className={`mt-1 text-sm leading-relaxed ${mutedText}`}>{description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-28">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
                    <SectionHeading
                        eyebrow="FAQ"
                        title="Questions, answered"
                        description="The details teams usually ask about before they start."
                    />

                    <Reveal delay={100}>
                        <div className="border-t border-zinc-200 dark:border-zinc-800">
                            {faqs.map((faq) => (
                                <details key={faq.question} className="group border-b border-zinc-200 dark:border-zinc-800">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                                        <span className="text-sm font-medium text-zinc-800 transition group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                                            {faq.question}
                                        </span>
                                        <PlusIcon
                                            size={16}
                                            className="shrink-0 text-zinc-400 transition duration-200 group-open:rotate-45"
                                        />
                                    </summary>
                                    <p className={`pb-5 pr-8 text-sm leading-relaxed ${mutedText}`}>{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Call to action */}
            <section className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
                    <Reveal className="relative isolate overflow-hidden rounded-xl border border-zinc-200 bg-white p-10 text-center md:p-16 dark:border-zinc-800 dark:bg-zinc-900">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(228,228,231,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(228,228,231,0.5)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_40%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(39,39,42,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.55)_1px,transparent_1px)]"
                        />

                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                            Start organising your work today
                        </h2>
                        <p className={`mx-auto mt-4 max-w-xl text-base leading-relaxed ${mutedText}`}>
                            Create your first workspace and bring your team, projects and tasks onto one system.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <button onClick={goToApp} className={primaryButton}>
                                {ctaLabel}
                                <ArrowRightIcon size={16} />
                            </button>
                            {!isSignedIn && (
                                <button onClick={goToSignIn} className={secondaryButton}>
                                    Sign in
                                </button>
                            )}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto max-w-6xl px-6 py-14">
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="grid size-8 place-items-center rounded-md bg-blue-600 text-white">
                                    <LayoutDashboardIcon size={16} />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                    Project Management
                                </span>
                            </div>
                            <p className={`mt-4 max-w-xs text-sm leading-relaxed ${mutedText}`}>
                                Workspaces, projects, tasks and people kept in one place for teams that ship.
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                                Product
                            </p>
                            <div className="mt-4 flex flex-col gap-3">
                                <a href="#platform" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                                    Platform
                                </a>
                                <a href="#features" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                                    Features
                                </a>
                                <a href="#workflow" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                                    How it works
                                </a>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                                Account
                            </p>
                            <div className="mt-4 flex flex-col items-start gap-3">
                                <button
                                    onClick={goToApp}
                                    className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}
                                >
                                    {isSignedIn ? 'Dashboard' : 'Sign in'}
                                </button>
                                {!isSignedIn && (
                                    <button
                                        onClick={goToApp}
                                        className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}
                                    >
                                        Get started
                                    </button>
                                )}
                                <a href="#faq" className={`text-sm transition hover:text-zinc-900 dark:hover:text-white ${mutedText}`}>
                                    FAQ
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row dark:border-zinc-800">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            Project Management — built with React, Express and Prisma.
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            Secure authentication by Clerk.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
