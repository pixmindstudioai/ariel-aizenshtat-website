import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProjectById, listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "עריכת פרויקט" };

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  await requireEditor();
  const { id } = await params;
  const [project, categories] = await Promise.all([
    getProjectById(id),
    listCategories("project"),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={`עריכה: ${project.title}`}
        description="כל שינוי שנשמר מתעדכן מיד באתר הציבורי"
      />
      <ProjectForm categories={categories} project={project} />
    </div>
  );
}
