import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace, deleteWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk, useOrganizationList, useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/api";

function WorkspaceDropdown() {

    const { setActive, userMemberships } = useOrganizationList({ userMemberships: true });
    const { getToken, userId } = useAuth();
    const { openCreateOrganization } = useClerk()

    const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAdmin = (workspace) =>
        workspace.members?.some((member) => member.userId === userId && member.role === "ADMIN");

    const onSelectWorkspace = (workspaceId) => {
        setActive({ organization: workspaceId });
        dispatch(setCurrentWorkspace(workspaceId))
        setIsOpen(false);
        navigate('/dashboard')
    }

    const onDeleteWorkspace = async (e, workspace) => {
        e.stopPropagation();
        if (!window.confirm(`Delete workspace "${workspace.name}"? This will delete all projects and tasks inside it.`)) return;

        toast.loading("Deleting workspace...");
        try {
            const { data } = await api.delete(`/api/workspaces/${workspace.id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            dispatch(deleteWorkspace(workspace.id));
            userMemberships?.revalidate?.();
            toast.dismissAll();
            toast.success(data.message);
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (currentWorkspace) {
            setActive({ organization: currentWorkspace.id });
        }
    }, [currentWorkspace?.id]);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    <img src={currentWorkspace?.image_url} alt={currentWorkspace?.name} className="w-8 h-8 rounded shadow" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        <div className="max-h-64 overflow-y-auto">
                            {workspaces.map((workspace) => (
                                <div key={workspace.id} onClick={() => onSelectWorkspace(workspace.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 group" >
                                    <img src={workspace.image_url} alt={workspace.name} className="w-6 h-6 rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                            {workspace.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                            {workspace.members?.length || 0} members
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {currentWorkspace?.id === workspace.id && (
                                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        )}
                                        {isAdmin(workspace) && (
                                            <button
                                                onClick={(e) => onDeleteWorkspace(e, workspace)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                                title="Delete Workspace"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div onClick={() => { openCreateOrganization(); setIsOpen(false); }} className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                            <Plus className="w-4 h-4" /> Create Workspace
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
