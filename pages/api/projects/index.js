import { createProject, deleteProjects, listProjects } from "@/lib/thinkingMachine/projectStore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const projects = await listProjects();
    return res.status(200).json({ projects });
  }

  if (req.method === "POST") {
    const project = await createProject(req.body || {});
    return res.status(201).json({ project });
  }

  if (req.method === "DELETE") {
    const projects = await deleteProjects(req.body?.projectIds || []);
    return res.status(200).json({ projects });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
