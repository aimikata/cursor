import type { Project } from '../types';

const STORAGE_KEY = 'aiMangaStoryWeaverProjects';

export function getProjects(): Project[] {
  try {
    const projectsJson = localStorage.getItem(STORAGE_KEY);
    if (projectsJson) {
      const projects = JSON.parse(projectsJson) as Project[];
      // Sort projects by most recently updated
      return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (error) {
    console.error("Failed to load projects from localStorage", error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return [];
}

export function saveProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  projectId: string | null
): Project {
  const allProjects = getProjects();
  const now = Date.now();
  let projectToSave: Project;

  if (projectId) {
    // Update existing project
    const existingProject = allProjects.find(p => p.id === projectId);
    if (existingProject) {
      projectToSave = { ...existingProject, ...projectData, updatedAt: now };
    } else {
      // If ID exists but project not found, treat as new
      projectToSave = { ...projectData, id: `proj_${now}`, createdAt: now, updatedAt: now };
    }
  } else {
    // Create new project
    projectToSave = { ...projectData, id: `proj_${now}`, createdAt: now, updatedAt: now };
  }

  const otherProjects = allProjects.filter(p => p.id !== projectToSave.id);
  const updatedProjects = [...otherProjects, projectToSave];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.error("Failed to save project to localStorage", error);
    alert("プロジェクトの保存に失敗しました。ブラウザのストレージ容量が上限に達している可能性があります。");
  }

  return projectToSave;
}


export function deleteProject(id: string): void {
  try {
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to delete project from localStorage", error);
  }
}
