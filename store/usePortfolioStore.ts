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
    hasLoadedOnce: boolean;
    setHasLoadedOnce: (val: boolean) => void;
    carSpeed: number;
    setCarSpeed: (speed: number) => void;
    teleportTarget: Vector3Tuple | null;
    setTeleportTarget: (pos: Vector3Tuple | null) => void;
    carPos: { x: number; y: number; z: number };
    setCarPos: (pos: { x: number; y: number; z: number }) => void;
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
    footballScore: number;
    footballHighScore: number;
    setFootballScore: (n: number) => void;

    // Maze modes & stats
    mazeHits: number;
    incrementMazeHits: () => void;
    resetMazeHits: () => void;
    mazeBestTime: number | null;
    mazeBestHits: number | null;
    setMazeRecord: (type: 'time' | 'hits', value: number) => boolean; // returns true if new record

    // Unified Maze/Game State
    gameState: {
        status: 'idle' | 'playing' | 'completed';
        startTime: number;
        time: number;
    };
    setGameState: (state: Partial<PortfolioStore['gameState']>) => void;

    // Maze state (legacy/compatibility)
    mazeRunning: boolean;
    setMazeRunning: (val: boolean) => void;

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
        title: "HAXEUS",
        description: "Fully functional e-commerce application with modern frontend–backend integration, focusing on performance and UX.",
        tech: ["Next.js", "Supabase", "React", "Upstash"],
        liveUrl: "https://www.haxeus.in",
        githubUrl: "#"
    },
    {
        id: generateId(),
        title: "WhiteMatrix",
        description: "Candidate voting system with a secure admin panel, role-based access, and reliable one-time vote management.",
        tech: ["React", "Supabase", "OAuth", "Role-Based Access"],
        liveUrl: "https://whitematrix-voting.netlify.app",
        githubUrl: "https://github.com/THEJAS-KRISHNA-P-R/whitematrix-voting"
    },
    {
        id: generateId(),
        title: "inthenow.",
        description: "Contributed to UI/UX design and responsive web development for a production-level platform.",
        tech: ["React", "Responsive Web", "UI/UX Design"],
        liveUrl: "https://www.inthenow.world"
    },
    {
        id: generateId(),
        title: "Digital Repair Café",
        description: "First Prize, Project Expo — Christ College of Engineering, Oct 2025. Award-winning platform promoting sustainable electronics repair and reuse.",
        tech: ["Next.js", "Full-Stack", "Sustainability"],
        liveUrl: "https://digitalrepaircafe.netlify.app/",
        githubUrl: "https://github.com/THEJAS-KRISHNA-P-R/repairhub"
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
        date: "Feb 2026",
        url: "https://coursera.org/share/9fc10a87d926d25a60f5e6ad4ad9578e"
    },
    {
        id: generateId(),
        name: "Google Cybersecurity Professional",
        issuer: "Google (Coursera)",
        date: "Feb 2026",
        url: "https://www.coursera.org/account/accomplishments/professional-cert/SU4OWOKL929U"
    },
    {
        id: generateId(),
        name: "Demysifying Networking",
        issuer: "IIT Bombay (NPTEL)",
        date: "Jul-Aug 2025",
        url: "https://archive.nptel.ac.in/content/noc/NOC25/SEM2/Ecertificates/106/noc25-cs125/Course/NPTEL25CS125S64880044109160941.pdf"
    },
    {
        id: generateId(),
        name: "Introduction to Python Programming",
        issuer: "IISc Bangalore (NPTEL)",
        date: "Aug-Oct 2025",
        url: "https://archive.nptel.ac.in/content/noc/NOC25/SEM2/Ecertificates/106/noc25-cs137/Course/NPTEL25CS137S97030015510935006.pdf"
    }
];

// Persistent Store
export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
    // Non-persisted transient state overrides (handled by set below)
    activeZone: null,
    setActiveZone: (zone) => set({ activeZone: zone }),

    isGameMode: true,
    setIsGameMode: (val) => set({ isGameMode: val }),

    hasLoadedOnce: false,
    setHasLoadedOnce: (val) => set({ hasLoadedOnce: val }),

    carSpeed: 0,
    setCarSpeed: (speed) => set({ carSpeed: speed }),

    teleportTarget: null,
    setTeleportTarget: (pos) => set({ teleportTarget: pos }),

    carPos: { x: 0, y: 0, z: 0 },
    setCarPos: (pos) => set({ carPos: pos }),

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
    footballScore: 0,
    footballHighScore: 0,
    setFootballScore: (n: number) => set((s) => ({
        footballScore: n,
        footballHighScore: Math.max(n, s.footballHighScore),
    })),

    mazeHits: 0,
    incrementMazeHits: () => set((s) => ({ mazeHits: s.mazeHits + 1 })),
    resetMazeHits: () => set({ mazeHits: 0 }),
    mazeBestTime: null,
    mazeBestHits: null,
    setMazeRecord: (type, value) => {
        const s = get();
        if (type === 'time') {
            const current = s.mazeBestTime;
            const isNewBest = current === null || value < current;
            if (isNewBest) set({ mazeBestTime: value });
            return isNewBest;
        } else {
            const current = s.mazeBestHits;
            const isNewBest = current === null || value < current;
            if (isNewBest) set({ mazeBestHits: value });
            return isNewBest;
        }
    },

    mazeRunning: false,
    setMazeRunning: (val) => set({ mazeRunning: val }),

    gameState: {
        status: 'idle',
        startTime: 0,
        time: 0,
    },
    setGameState: (updates) => set((s) => ({
        gameState: { ...s.gameState, ...updates }
    })),

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
