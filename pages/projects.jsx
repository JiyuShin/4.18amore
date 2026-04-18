import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  createProject as createProjectRequest,
  deleteProjects as deleteProjectsRequest,
  fetchProjects,
} from "@/lib/thinkingMachine/apiClient";
import { readCurrentUser } from "@/lib/thinkingMachine/clientUser";

const LOGIN_STORAGE_KEY = "isLoggedIn";

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function createProjectDraft() {
  return {
    title: "Untitled Project",
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);

  useEffect(() => {
    const isLoggedIn = typeof window !== "undefined" && window.localStorage.getItem(LOGIN_STORAGE_KEY) === "true";

    if (!isLoggedIn) {
      void router.replace("/");
      return;
    }

    const run = async () => {
      try {
        const nextProjects = await fetchProjects();
        startTransition(() => {
          setProjects(nextProjects);
          setIsLoading(false);
        });
      } catch {
        startTransition(() => {
          setProjects([]);
          setIsLoading(false);
        });
      }
    };
    void run();
  }, [router]);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = new Date(a?.updatedAt || 0).getTime();
      const bTime = new Date(b?.updatedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [projects]);

  const handleCreateProject = async () => {
    if (isDeleteMode) return;

    const draftProject = createProjectDraft();
    const currentUser = readCurrentUser();
    const nextProject = await createProjectRequest({
      title: draftProject.title,
      actor: {
        ...currentUser,
        role: "owner",
      },
    });
    setProjects((prev) => [nextProject, ...prev]);
    void router.push(`/projects/${nextProject.id}`);
  };

  const handleOpenProject = (projectId) => {
    void router.push(`/projects/${projectId}`);
  };

  const handleToggleProjectSelection = (projectId) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleDeleteProjects = async () => {
    if (!isDeleteMode) {
      setIsDeleteMode(true);
      setSelectedProjectIds([]);
      return;
    }

    if (!selectedProjectIds.length) return;

    const shouldDelete =
      typeof window === "undefined" ||
      window.confirm(`Delete ${selectedProjectIds.length} selected project(s)?`);
    if (!shouldDelete) return;

    const remainingProjects = await deleteProjectsRequest(selectedProjectIds);
    setProjects(remainingProjects);
    setIsDeleteMode(false);
    setSelectedProjectIds([]);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFEFEF] text-slate-900">
        <div className="rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading projects...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFEFEF] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.28em] text-sky-700">
              Thinking Machine
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Projects</h1>
            <p className="mt-2 text-sm text-slate-600">
              Open an existing project or create a new one to continue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={isDeleteMode}
              className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50 disabled:hover:bg-sky-400"
            >
              Create New Project
            </button>
            <button
              type="button"
              onClick={handleDeleteProjects}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950 transition ${
                isDeleteMode
                  ? "bg-sky-300 hover:bg-sky-200"
                  : "bg-sky-400 hover:bg-sky-300"
              }`}
            >
              Delete Project
            </button>
          </div>
        </div>

        {sortedProjects.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white px-8 py-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="text-lg font-semibold text-slate-900">No projects yet</div>
            <p className="mt-2 text-sm text-slate-600">
              Start your first project and we&apos;ll take you straight into it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className={`relative rounded-[28px] border border-black/10 p-5 text-left shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition ${
                  selectedProjectIds.includes(project.id)
                    ? "bg-sky-50 ring-2 ring-sky-400"
                    : "bg-white hover:-translate-y-0.5 hover:bg-slate-50"
                }`}
              >
                {isDeleteMode ? (
                  <button
                    type="button"
                    onClick={() => handleToggleProjectSelection(project.id)}
                    className={`absolute right-4 top-4 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
                      selectedProjectIds.includes(project.id)
                        ? "border-sky-500 bg-sky-100"
                        : "border-black/10 bg-white hover:bg-slate-100"
                    }`}
                    aria-label={`Select ${project.title || "Untitled Project"}`}
                    aria-pressed={selectedProjectIds.includes(project.id)}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        selectedProjectIds.includes(project.id) ? "bg-sky-600" : "bg-transparent"
                      }`}
                    />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    isDeleteMode ? handleToggleProjectSelection(project.id) : handleOpenProject(project.id)
                  }
                  className={`block w-full text-left ${isDeleteMode ? "pr-10" : ""}`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                    Project
                  </div>
                  <div className="mt-3 line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                    {project.title || "Untitled Project"}
                  </div>
                  <div className="mt-6 text-xs text-slate-600">
                    Updated {formatDate(project.updatedAt)}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
