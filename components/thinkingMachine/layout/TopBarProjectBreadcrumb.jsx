"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const TOPBAR_CENTER_TEXT_STYLE = {
  fontFamily: '"Instrument Sans", sans-serif',
  lineHeight: "110%",
  letterSpacing: "-0.32px",
};

function HomeLayerIcon() {
  return (
    <span className="relative block h-[28px] w-[28px]" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 12.5L14 4.6L24 12.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 11.6V22H11.8V16H16.2V22H21V11.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function TopBarProjectBreadcrumb({
  projectMetaHref,
  projectMetaLabel,
  isEditingTitle,
  projectTitle,
  draftTitle,
  setDraftTitle,
  setIsEditingTitle,
  commitTitle,
}) {
  return (
    <div className="pointer-events-auto flex w-[382px] justify-self-start pt-0.5">
      <motion.div
        layout
        className="flex w-full max-w-[420px] items-center gap-2.5 text-[14px] font-medium text-slate-700/88"
        style={TOPBAR_CENTER_TEXT_STYLE}
        transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      >
        <Link
          href={projectMetaHref}
          className="relative -left-px -top-[0.8px] ml-1 inline-flex shrink-0 items-center justify-center text-[#404045] transition hover:text-slate-900"
          aria-label="Go to projects"
          title="Go to projects"
        >
          <HomeLayerIcon />
        </Link>
        <Link
          href={projectMetaHref}
          className="inline-flex shrink-0 text-[16px] transition hover:text-slate-900"
          style={TOPBAR_CENTER_TEXT_STYLE}
        >
          {projectMetaLabel}
        </Link>
        <span className="text-slate-400/80">/</span>
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <motion.input
              layout="position"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitTitle();
                }
                if (event.key === "Escape") {
                  setDraftTitle(projectTitle || "Untitled Project");
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="w-full border-none bg-transparent px-0 py-0 text-[16px] font-medium text-slate-800 outline-none shadow-none"
              style={TOPBAR_CENTER_TEXT_STYLE}
              aria-label="Project title"
              transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
            />
          ) : (
            <motion.button
              layout="position"
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="max-w-full truncate text-left text-[16px] font-medium text-slate-700/88 transition hover:text-slate-900"
              style={TOPBAR_CENTER_TEXT_STYLE}
              aria-label="Edit project title"
              title="Rename project"
              transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
            >
              {projectTitle || "Untitled Project"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

