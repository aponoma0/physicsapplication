import { Unit, Course, Badge } from './types';

export const INITIAL_HEARTS = 3;
export const XP_PER_LESSON = 20;

// Cute Physics Cloud Logo - Recalibrated for better centering
export const APP_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTUwIj4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgMjApIj4KICAgIDwhLS0gQ2xvdWQgQm9keSAtLT4KICAgIDxwYXRoIGQ9Ik0zMCw4MCBDMzAsNTUgNTAsNDAgNzAsNDAgQzcwLDE1IDEwMCwxNSAxMjAsNDAgQzE0MCwxNSAxNzAsNDAgMTcwLDcwIEMxOTAsNzAgMTkwLDExMCAxNzAsMTEwIEwzMCwxMTAgQzEwLDExMCAxMCw4MCAzMCw4MFoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiM0QTlGRkYiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgCiAgICA8IS0tIEZhY2UgLS0+CiAgICA8Y2lyY2xlIGN4PSI3NSIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjMkM3M0RDIi8+CiAgICA8Y2lyY2xlIGN4PSIxMjUiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzJDNzNEQyIvPgogICAgPHBhdGggZD0iTTkwLDg1IEM5NSw5MiAxMDUsOTIgMTEwLDg1IiBmaWxsPSJub25lIiBzdHJva2U9IiMyQzczREMiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgICA8Y2lyY2xlIGN4PSI2NSIgY3k9Ijc4IiByPSI0IiBmaWxsPSIjRkZBMURFIiBvcGFjaXR5PSIwLjYiLz4KICAgIDxjaXJjbGUgY3g9IjEzNSIgY3k9Ijc4IiByPSI0IiBmaWxsPSIjRkZBMURFIiBvcGFjaXR5PSIwLjYiLz4KICAgIAogICAgPCEtLSBBdG9tIFN5bWJvbCBvbiB0aGUgcmlnaHQgLS0+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjAsIDYwKSBzY2FsZSgwLjQpIj4KICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iNTAiIHJ5PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNEE5RkZGIiBzdHJva2Utd2lkdGg9IjUiIHRyYW5zZm9ybT0icm90YXRlKDApIi8+CiAgICAgIDxlbGxpcHNlIGN4PSIwIiBjeT0iMCIgcng9IjUwIiByeT0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRBOUZGRiIgc3Ryb2tlLXdpZHRoPSI1IiB0cmFuc2Zvcm09InJvdGF0ZSg2MCkiLz4KICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iNTAiIHJ5PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNEE5RkZGIiBzdHJva2Utd2lkdGg9IjUiIHRyYW5zZm9ybT0icm90YXRlKDEyMCkiLz4KICAgICAgPGNpcmNsZSByPSIxMCIgZmlsbD0iIzRBOUZGRiIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+";

export const BADGES: Badge[] = [
  {
    id: 'high-voltage',
    name: 'High Voltage',
    description: 'Earn 100 XP',
    icon: '⚡',
    condition: (user) => user.xp >= 100
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    condition: (user) => user.streak >= 3
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Complete 5 lessons',
    icon: '📚',
    condition: (user) => user.completedLessons.length >= 5
  },
  {
    id: 'quantum-leap',
    name: 'Quantum Leap',
    description: 'Complete an entire Unit',
    icon: '🌌',
    condition: (user) => user.completedLessons.length >= 4 // Simplified check
  }
];

export const PERSONALIZATION_OPTIONS = {
  interests: [
    { id: 'cars', label: 'Cars & Transport', icon: '🚗' },
    { id: 'sports', label: 'Sports', icon: '🏀' },
    { id: 'space', label: 'Space & Astronomy', icon: '🚀' },
    { id: 'games', label: 'Games & Tech', icon: '🎮' },
    { id: 'rides', label: 'Rollercoasters', icon: '🎢' },
    { id: 'life', label: 'Everyday Life', icon: '🌍' },
    { id: 'science', label: 'Experiments', icon: '🔬' },
    { id: 'machines', label: 'Machines', icon: '⚙️' },
  ],
  confidence: [
    { id: 'high', label: 'Fun and exciting', icon: '🤩' },
    { id: 'medium', label: 'OK but confusing', icon: '🤔' },
    { id: 'low', label: 'Hard', icon: '🤯' },
    { id: 'unknown', label: 'Not sure yet', icon: '🤷‍♂️' },
  ],
  goals: [
    { id: 'school', label: 'Learn for school', icon: '🏫' },
    { id: 'grades', label: 'Improve grades', icon: '📈' },
    { id: 'exam', label: 'Prepare for exam', icon: '📝' },
    { id: 'fun', label: 'Learn for fun', icon: '🎈' },
    { id: 'world', label: 'Understand world', icon: '🌎' },
  ]
};

// SVG Data URI for a Ruler Icon
const RULER_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIxMCIgeT0iMzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgcng9IjUiIGZpbGw9IiNmYmJmMjQiIHN0cm9rZT0iI2Q5NzcwNiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGxpbmUgeDE9IjIwIiB5MT0iMzAiIHgyPSIyMCIgeTI9IjQ1IiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMyIvPjxsaW5lIHgxPSIzMCIgeTE9IjMwIiB4Mj0iMzAiIHkyPSI0MCIgc3Ryb2tlPSIjZDk3NzA2IiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNDAiIHkxPSIzMCIgeDI9IjQwIiB5Mj0iNDUiIHN0cm9rZT0iI2Q5NzcwNiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGxpbmUgeDE9IjUwIiB5MT0iMzAiIHgyPSI1MCIgeTI9IjQwIiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMyIvPjxsaW5lIHgxPSI2MCIgeTE9IjMwIiB4Mj0iNjAiIHkyPSI0NSIgc3Ryb2tlPSIjZDk3NzA2IiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNzAiIHkxPSIzMCIgeDI9IjcwIiB5Mj0iNDAiIHN0cm9rZT0iI2Q5NzcwNiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGxpbmUgeDE9IjgwIiB5MT0iMzAiIHgyPSI4MCIgeTI9IjQ1IiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg==";

const MECHANICS_UNITS: Unit[] = [
  {
    id: 'mech-u1',
    title: 'Unit 1: Foundations',
    description: 'Start your physics journey with the basics of motion.',
    color: 'green',
    lessons: [
      {
        id: 'mech-u1-l1',
        title: 'Scalars & Vectors',
        topic: 'physics scalars and vectors basic definition mass time force (avoid speed vs velocity)',
        description: 'Magnitude vs. Direction.',
        icon: RULER_ICON, // Replaced Emoji with Image
        color: 'green',
        locked: false,
        completed: false,
        stars: 0
      },
      {
        id: 'mech-u1-l2',
        title: 'Distance & Displacement',
        topic: 'distance vs displacement physics (do not include a sorting game)',
        description: 'How far vs. How far from start.',
        icon: '👣',
        color: 'green',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'mech-u1-l3',
        title: 'Speed & Velocity',
        topic: 'speed vs velocity physics difference',
        description: 'Fast vs. Fast with direction.',
        icon: '🚀',
        color: 'green',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'mech-u1-l4',
        title: 'Acceleration',
        topic: 'physics acceleration concept calculation',
        description: 'Speeding up and slowing down.',
        icon: '🏎️',
        color: 'green',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'mech-u1-l5',
        title: 'Motion Graphs',
        topic: 'physics motion graphs position velocity time',
        description: 'Reading the story of motion.',
        icon: '📈',
        color: 'green',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'mech-u1-rev',
        title: 'Unit Revision',
        topic: 'physics kinematics basics review quiz',
        description: 'Final Unit Challenge!',
        icon: '🏆',
        color: 'yellow',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  },
  {
    id: 'mech-u2',
    title: 'Unit 2: Forces',
    description: 'Understand why things move the way they do.',
    color: 'pink',
    lessons: [
      {
        id: 'l2-1',
        title: "Newton's First Law",
        topic: "Newton's First Law of Motion inertia",
        description: 'The law of inertia.',
        icon: '🛑',
        color: 'pink',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'l2-2',
        title: "Newton's Second Law",
        topic: "Newton's Second Law F=ma calculation",
        description: 'Force equals mass times acceleration.',
        icon: '⚖️',
        color: 'pink',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'l2-3',
        title: "Newton's Third Law",
        topic: "Newton's Third Law action reaction",
        description: 'Action and reaction.',
        icon: '🥊',
        color: 'pink',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  },
  {
    id: 'mech-u3',
    title: 'Unit 3: Energy',
    description: 'The capacity to do work.',
    color: 'yellow',
    lessons: [
      {
        id: 'l3-1',
        title: 'Kinetic Energy',
        topic: 'kinetic energy formula and concepts',
        description: 'Energy of motion.',
        icon: '⚡',
        color: 'yellow',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'l3-2',
        title: 'Potential Energy',
        topic: 'gravitational potential energy',
        description: 'Stored energy.',
        icon: '🔋',
        color: 'yellow',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  }
];

const THERMO_UNITS: Unit[] = [
  {
    id: 'thermo-u1',
    title: 'Unit 1: Heat Basics',
    description: 'It is getting hot in here.',
    color: 'red',
    lessons: [
      {
        id: 'thermo-l1-1',
        title: 'Temperature',
        topic: 'physics temperature vs heat',
        description: 'What is temperature really?',
        icon: '🌡️',
        color: 'red',
        locked: false,
        completed: false,
        stars: 0
      },
      {
        id: 'thermo-l1-2',
        title: 'Heat Transfer',
        topic: 'conduction convection radiation',
        description: 'How heat moves around.',
        icon: '🔥',
        color: 'red',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  },
  {
    id: 'thermo-u2',
    title: 'Unit 2: Laws of Thermo',
    description: 'The rules of the universe.',
    color: 'orange',
    lessons: [
      {
        id: 'thermo-l2-1',
        title: 'First Law',
        topic: 'first law of thermodynamics conservation energy',
        description: 'Energy conservation.',
        icon: '🔄',
        color: 'orange',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'thermo-l2-2',
        title: 'Entropy',
        topic: 'entropy and second law of thermodynamics',
        description: 'Why things get messy.',
        icon: '🎲',
        color: 'orange',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  }
];

const ELECTROMAGNETISM_UNITS: Unit[] = [
  {
    id: 'em-u1',
    title: 'Unit 1: Electrostatics',
    description: 'Zap! The basics of electric charge.',
    color: 'blue',
    lessons: [
      {
        id: 'em-l1-1',
        title: 'Electric Charge',
        topic: 'electric charge proton electron',
        description: 'Positive and negative charges.',
        icon: '⚛️',
        color: 'blue',
        locked: false,
        completed: false,
        stars: 0
      },
      {
        id: 'em-l1-2',
        title: "Coulomb's Law",
        topic: "Coulomb's Law force between charges",
        description: 'Forces between charges.',
        icon: '⚡',
        color: 'blue',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  },
  {
    id: 'em-u2',
    title: 'Unit 2: Circuits',
    description: 'Flowing electrons.',
    color: 'purple',
    lessons: [
      {
        id: 'em-l2-1',
        title: "Current & Voltage",
        topic: "electric current and voltage definition",
        description: 'The flow and the push.',
        icon: '🔋',
        color: 'purple',
        locked: true,
        completed: false,
        stars: 0
      },
      {
        id: 'em-l2-2',
        title: "Ohm's Law",
        topic: "Ohm's Law resistance",
        description: 'V = IR',
        icon: '💡',
        color: 'purple',
        locked: true,
        completed: false,
        stars: 0
      }
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: 'mechanics',
    title: 'Mechanics',
    icon: '🍎',
    description: 'Motion, Forces, and Energy',
    units: MECHANICS_UNITS
  },
  {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    icon: '🔥',
    description: 'Heat, Entropy, and Engines',
    units: THERMO_UNITS
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    icon: '⚡',
    description: 'Electricity, Magnetism, and Light',
    units: ELECTROMAGNETISM_UNITS
  }
];