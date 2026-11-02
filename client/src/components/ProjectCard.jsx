import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { deleteProject } from "../features/workspaceSlice";

const statusColors = {
    PLANNING: "bg-gray-200 dark:bg-zinc-600 text-gray-900 dark:text-zinc-200",
    ACTIVE: "bg-emerald-200 dark:bg-emerald-500 text-emerald-900 dark:text-emerald-900",
    ON_HOLD: "bg-amber-200 dark:bg-amber-500 text-amber-900 dark:text-amber-900",
    COMPLETED: "bg-blue-200 dark:bg-blue-500 text-blue-900 dark:text-blue-900",
    CANCELLED: "bg-red-200 dark:bg-red-500 text-red-900 dark:text-red-900",
};

const ProjectCard = ({ project }) => {
    const dispatch = useDispatch();
    const { getToken } = useAuth();

    const handleDelete = async () => {
        if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;

        toast.loading("Deleting...");
        try {
            const { data } = await api.delete(`/api/projects/${project.id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            dispatch(deleteProject(project.id));
            toast.dismissAll();
            toast.success(data.message);
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className="relative bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200 group">
            <button
                onClick={handleDelete}
                title="Delete project"
                className="absolute top-4 right-4 z-10 p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
                <Trash2 className="size-4" />
            </button>

            <Link to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 pr-6">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2 mb-3">
                            {project.description || "No description"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[project.status]}`} >
                        {project.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
                        {project.priority} priority
                    </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-zinc-500">Progress</span>
                        <span className="text-gray-400 dark:text-zinc-400">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded">
                        <div className="h-1.5 rounded bg-blue-500" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProjectCard;
