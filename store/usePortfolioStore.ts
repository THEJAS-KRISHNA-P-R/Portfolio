import { create } from "zustand";
import { Vector3Tuple } from "three";

export type Project = {
    id: string;
    title: string;
    description: string;
    tech: string[];
    liveUrl?: string;
    githubUrl?: string;
};

export type Certification = {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
};

interface PortfolioStore {
    // Game state
    activeZone: string | null;
    setActiveZone: (zone: string | null) => void;
    isGameMode: boolean;
    setIsGameMode: (val: boolean) => void;
    carSpeed: number;
    setCarSpeed: (speed: number) => void;
    teleportTarget: Vector3Tuple | null;
    setTeleportTarget: (pos: Vector3Tuple | null) => void;
    turboCharge: number;
    setTurboCharge: (v: number) => void;
    mobileTurbo: boolean;
    setMobileTurbo: (v: boolean) => void;
    pendingZone: string | null;
    setPendingZone: (id: string | null) => void;
    scrollTarget: string | null;
    setScrollTarget: (id: string | null) => void;
    goals: number;
    incrementGoals: () => void;

    // Projects (persisted)
    projects: Project[];
    addProject: (p: Omit<Project, "id">) => void;
    updateProject: (id: string, p: Partial<Project>) => void;
    deleteProject: (id: string) => void;

    // Certifications (persisted)
    certifications: Certification[];
    addCertification: (c: Omit<Certification, "id">) => void;
    deleteCertification: (id: string) => void;
}

// Generate uuid-style id helper
const generateId = () => Math.random().toString(36).substring(2, 9);

const initialProjects: Project[] = [
    {
        id: generateId(),
        title: "HAXEUZ",
        description: "Fully functional e-commerce application with modern frontend–backend integration, focusing on performance and UX.",
        tech: ["Next.js", "MongoDB Atlas", "Supabase", "React"],
        liveUrl: "#",
        githubUrl: "#"
    },
    {
        id: generateId(),
        title: "WhiteMatrix",
        description: "Candidate voting system with a secure admin panel, role-based access, and reliable one-time vote management.",
        tech: ["React", "Firebase", "OAuth", "Role-Based Access"],
        liveUrl: "#",
        githubUrl: "#"
    },
    {
        id: generateId(),
        title: "inthenow.",
        description: "Contributed to UI/UX design and responsive web development for a production-level platform.",
        tech: ["React", "Responsive Web", "UI/UX Design"],
        liveUrl: "#"
    },
    {
        id: generateId(),
        title: "Digital Repair Café",
        description: "First Prize, Project Expo — Christ College of Engineering, Oct 2025. Award-winning platform promoting sustainable electronics repair and reuse.",
        tech: ["Next.js", "Full-Stack", "Sustainability"],
        liveUrl: "#"
    },
    {
        id: generateId(),
        title: "Radar System",
        description: "Independently designed and built a radar system capable of detecting objects within 3 meters. Dec 2024.",
        tech: ["Arduino", "Ultrasonic Sensors", "Hardware"]
    }
];

const initialCerts: Certification[] = [
    {
        id: generateId(),
        name: "React Native",
        issuer: "Meta (Coursera)",
        date: "2024",
        url: "#"
    },
    {
        id: generateId(),
        name: "Google Cybersecurity Professional",
        issuer: "Google (Coursera)",
        date: "2024–25",
        url: "#"
    }
];

// Persistent Store
export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
    // Non-persisted transient state overrides (handled by set below)
    activeZone: null,
    setActiveZone: (zone) => set({ activeZone: zone }),

    isGameMode: true,
    setIsGameMode: (val) => set({ isGameMode: val }),

    carSpeed: 0,
    setCarSpeed: (speed) => set({ carSpeed: speed }),

    teleportTarget: null,
    setTeleportTarget: (pos) => set({ teleportTarget: pos }),

    turboCharge: 100,
    setTurboCharge: (v) => set({ turboCharge: v }),

    mobileTurbo: false,
    setMobileTurbo: (val) => set({ mobileTurbo: val }),

    pendingZone: null,
    setPendingZone: (id) => set({ pendingZone: id }),

    scrollTarget: null,
    setScrollTarget: (id) => set({ scrollTarget: id }),

    goals: 0,
    incrementGoals: () => set((state) => ({ goals: state.goals + 1 })),

    // Persisted initial state
    projects: initialProjects,
    addProject: (p) => set((state) => ({
        projects: [...state.projects, { id: generateId(), ...p }]
    })),
    updateProject: (id, p) => set((state) => ({
        projects: state.projects.map((proj) =>
            proj.id === id ? { ...proj, ...p } : proj
        )
    })),
    deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
    })),

    certifications: initialCerts,
    addCertification: (c) => set((state) => ({
        certifications: [...state.certifications, { id: generateId(), ...c }]
    })),
    deleteCertification: (id) => set((state) => ({
        certifications: state.certifications.filter((c) => c.id !== id)
    }))
}));
