import { Vector3Tuple } from "three";

export const ZONES = {
  about: { id: 'about', label: 'About', name: 'About', icon: '', color: '#4fc3f7', position: [20, 0, -20] as Vector3Tuple },
  projects: { id: 'projects', label: 'Projects', name: 'Projects', icon: '', color: '#e94560', position: [-20, 0, -20] as Vector3Tuple },
  achievements: { id: 'achievements', label: 'Achievements', name: 'Achievements', icon: '', color: '#f5a623', position: [20, 0, 20] as Vector3Tuple },
  certifications: { id: 'certifications', label: 'Certifications', name: 'Certifications', icon: '', color: '#9b59b6', position: [0, 0, -35] as Vector3Tuple },
  contact: { id: 'contact', label: 'Contact', name: 'Contact', icon: '', color: '#7ed321', position: [-20, 0, 20] as Vector3Tuple },
};

// Also export as array for iteration backwards compatibility during refactor
export const ZONES_ARRAY = [
  ZONES.about,
  ZONES.projects,
  ZONES.achievements,
  ZONES.certifications,
  ZONES.contact
];
