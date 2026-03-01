# Portfolio Content Reference

All content for Thejas Krishna P R's portfolio sections.
This is the single source of truth for all text, data, and copy in the project.

---

## Projects (Zustand seed data)

```typescript
const INITIAL_PROJECTS = [
  {
    id: 'proj-001',
    title: 'HAXEUZ',
    subtitle: 'Full-Stack E-Commerce App',
    description: 'Fully functional e-commerce application with modern frontend–backend integration, focusing on performance and user experience.',
    tech: ['Next.js', 'MongoDB Atlas', 'Supabase', 'React'],
    liveUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'proj-002',
    title: 'WhiteMatrix',
    subtitle: 'Secure Voting System',
    description: 'Candidate voting system with a secure admin panel, role-based access control, and reliable one-time vote management logic.',
    tech: ['React', 'Firebase', 'OAuth', 'Role-Based Access'],
    liveUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'proj-003',
    title: 'inthenow.',
    subtitle: 'E-Commerce App',
    description: 'Contributed to UI/UX design and responsive web development for a production-level e-commerce platform.',
    tech: ['React', 'Responsive Web', 'UI/UX Design'],
    liveUrl: '#',
  },
  {
    id: 'proj-004',
    title: 'Digital Repair Café',
    subtitle: 'Sustainability Platform 🥇',
    description: 'First Prize, Project Expo — Christ College of Engineering, Oct 2025. Award-winning full-stack platform promoting sustainable electronics repair and reuse. Recognized for real-world impact and technical execution.',
    tech: ['Next.js', 'Full-Stack', 'Sustainability'],
    liveUrl: '#',
  },
  {
    id: 'proj-005',
    title: 'Radar System',
    subtitle: 'Object Detection Hardware',
    description: 'Independently designed and built an ultrasonic radar system capable of detecting and mapping objects within a 3-meter range.',
    tech: ['Arduino', 'Ultrasonic Sensors', 'Hardware', 'C++'],
  },
]
```

---

## Certifications (Zustand seed data)

```typescript
const INITIAL_CERTIFICATIONS = [
  {
    id: 'cert-001',
    name: 'React Native',
    issuer: 'Meta via Coursera',
    date: '2024',
    url: '#',
  },
  {
    id: 'cert-002',
    name: 'Google Cybersecurity Professional',
    issuer: 'Google via Coursera',
    date: '2024–2025',
    url: '#',
  },
]
```

Static highlight (not from zustand, always shown):
```
🥇 AI Workshop — "From Pixels to Patterns"
Issuer: Christ College of Engineering
Date: February 2026
Type: Competition Win (not a certificate)
Color: gold #f5a623
```

---

## Skills (grouped, for AboutSkills.tsx)

```typescript
const SKILLS = [
  {
    category: 'Languages',
    color: '#4fc3f7',
    items: ['Python', 'C', 'C++', 'JavaScript', 'HTML'],
  },
  {
    category: 'Frameworks',
    color: '#06b6d4',
    items: ['React.js', 'Next.js'],
  },
  {
    category: 'Mobile Development',
    color: '#6366f1',
    items: ['Flutter', 'React Native'],
  },
  {
    category: 'Databases & Backend',
    color: '#22c55e',
    items: ['MongoDB Atlas', 'Supabase', 'Firebase'],
  },
  {
    category: 'AI & Emerging Tech',
    color: '#9b59b6',
    items: ['Deep Learning', 'Generative AI', 'CNNs (learning)'],
  },
  {
    category: 'Cybersecurity',
    color: '#f97316',
    items: ['Google Cybersecurity Cert', 'NPTEL (in progress)'],
  },
  {
    category: 'Professional Skills',
    color: '#eab308',
    items: ['Analytical Thinking', 'Adaptability', 'Teamwork', 'Discipline'],
  },
]
```

---

## Education Timeline (for AboutSkills.tsx)

```typescript
const EDUCATION = [
  {
    level: 'B.Tech CSE',
    institution: 'Christ College of Engineering',
    university: 'APJ Abdul Kalam Technological University',
    location: 'Thiruvananthapuram',
    year: '2024 – present',
    grade: 'Pursuing',
    icon: '🎓',
  },
  {
    level: 'Class XII — Computer Science',
    institution: 'Sree Narayana Gupta Samajam Higher Secondary School',
    board: 'Department of Higher Secondary Education, Kerala',
    year: '2023–24',
    grade: '95.3%',
    icon: '📚',
  },
  {
    level: 'Class X',
    institution: 'Kamala Nehru Memorial Vocational Higher Secondary School',
    board: 'General Department of Education',
    location: 'Thiruvananthapuram',
    year: '2021–22',
    grade: '98.7%',
    icon: '📖',
  },
]
```

---

## About Bio

```
Motivated Computer Science Engineering student with hands-on experience in
full-stack web development using Flutter, JavaScript, React, Next.js, MongoDB
Atlas, Supabase, and Firebase. Skilled in Python and C with a strong
understanding of algorithms, networking, and emerging technologies including
Generative AI. Currently enhancing cybersecurity expertise through Coursera
and NPTEL. Known for discipline, teamwork, and resilience, complemented by
state-level achievements in karate (1× Gold, 4× Silver).
```

---

## Counter Stats (for AboutSkills.tsx)

```typescript
const STATS = [
  { value: 98.7, label: 'Class X %',    color: '#4fc3f7', suffix: '%' },
  { value: 95.3, label: 'Class XII %',  color: '#22c55e', suffix: '%' },
  { value: 5,    label: 'Projects',     color: '#f5a623', suffix: ''  },
  { value: 2,    label: 'Certificates', color: '#9b59b6', suffix: ''  },
]
```

---

## Achievements (for Achievements.tsx, most recent first)

```typescript
const ACHIEVEMENTS = [
  {
    emoji: '🥇',
    title: '1st Place — AI Workshop: "From Pixels to Patterns"',
    date: 'February 2026',
    location: 'Christ College of Engineering',
    badge: 'Deep Learning',
    badgeColor: '#9b59b6',
    description: 'Secured first place in a competitive deep learning workshop, demonstrating excellence in CNN architectures and applied AI.',
  },
  {
    emoji: '🥇',
    title: 'First Prize — Digital Repair Café, Project Expo',
    date: 'October 2025',
    location: 'Christ College of Engineering',
    badge: 'Full-Stack',
    badgeColor: '#4fc3f7',
    description: 'Award-winning platform promoting sustainable electronics repair and reuse. Recognized for real-world impact and technical execution.',
  },
  {
    emoji: '🎖️',
    title: 'Google Cybersecurity Professional Certificate',
    date: '2024–2025',
    location: 'Google via Coursera',
    badge: 'Certification',
    badgeColor: '#22c55e',
    description: 'Comprehensive cybersecurity training covering network security, threat analysis, vulnerability assessment, and incident response.',
  },
  {
    emoji: '🎖️',
    title: 'React Native Certificate — Meta',
    date: '2024',
    location: 'Meta via Coursera',
    badge: 'Certification',
    badgeColor: '#4fc3f7',
    description: "Completed Meta's official React Native course covering mobile development, navigation, state management, and native APIs.",
  },
  {
    emoji: '📡',
    title: 'Radar System Build',
    date: 'December 2024',
    location: 'Personal Project',
    badge: 'Hardware',
    badgeColor: '#f97316',
    description: 'Independently designed and built an ultrasonic radar capable of detecting and mapping objects within a 3-meter range.',
  },
  {
    emoji: '🌿',
    title: 'SUSTAINX 2025 — CUSAT',
    date: 'March 2024',
    location: 'Cochin University of Science and Technology',
    badge: 'Seminar',
    badgeColor: '#22c55e',
    description: 'Attended sustainability seminar on green building solutions organized by the IGBC Student Chapter.',
  },
  {
    emoji: '🥋',
    title: 'State-Level Karate Achievements',
    date: 'Ongoing',
    location: 'Kerala State',
    badge: 'Sports',
    badgeColor: '#e94560',
    description: 'State-level competitive karate athlete with 1× Gold Medal and 4× Silver Medals across multiple tournaments.',
  },
]
```

---

## Entrepreneurship — The Shop Zone

```typescript
const SHOP_CONTENT = {
  businessName: 'Golden Crown Arts & Crafts',
  tagline: "Preserving Kerala's Cultural Heritage, One Nettipattam at a Time",
  description: `Founder of a handcraft business specializing in traditional Keralan
Nettipattams — intricately designed ceremonial elephant headgear pieces that are
central to Kerala's vibrant festival culture. Each piece is handcrafted with
authentic materials, honoring centuries of artisan tradition.`,
  productType: 'Traditional Handicrafts 🎨',
  location: 'Kerala, India 📍',
  contactEmail: 'thejas2124@gmail.com',
  contactSubject: 'Nettipattam Order Inquiry',

  whatIsNettipattam: `A Nettipattam (നെറ്റിപ്പട്ടം) is an ornate golden headpiece worn
by elephants during Kerala's grand temple festivals and processions. Crafted from
brass, mirrors, and precious stones, it is one of Kerala's most iconic symbols
of ceremonial artistry.`,
}
```

---

## Marquee Tech Strip Content

```
Python • React.js • Next.js • Flutter • React Native • MongoDB Atlas •
Supabase • Firebase • Deep Learning • Generative AI • Cybersecurity •
Arduino • JavaScript • C/C++ • HTML • Tailwind CSS •
```

---

## SEO Metadata

```typescript
const METADATA = {
  title: 'Thejas Krishna P R | 3D Portfolio',
  description: 'Full-Stack Developer & CS Engineering Student at Christ College of Engineering. Drive around my interactive 3D portfolio.',
  openGraphTitle: 'Thejas Krishna P R — 3D Gamified Portfolio',
  openGraphDescription: 'Explore my work in an interactive 3D world. Full-stack dev, deep learning, cybersecurity.',
}
```
