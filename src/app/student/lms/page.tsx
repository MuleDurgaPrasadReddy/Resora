'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import {
  FlaskConical,
  Code2,
  FileText,
  Award,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Play,
  RotateCcw,
  Terminal,
  Download,
  BookOpen,
  ShieldAlert,
  Layers,
  Search,
  Filter,
  Sparkles,
  Laptop,
  Flame,
  FolderArchive,
  Eye,
  Check,
  ChevronRight,
  Copy,
  ChevronDown,
  User,
  Calendar,
  Lock,
  Cpu,
  Database,
  Globe,
  X,
} from 'lucide-react';

// Type definitions matching Ace It / Eduzon LMS
type ActiveView = 'DASHBOARD' | 'LABS' | 'PRACTICE' | 'VAULT' | 'EXAMS';

interface LabSubject {
  id: string;
  code: string;
  name: string;
  iconName: 'ai' | 'dsa' | 'db' | 'cloud';
  color: string;
  totalLabs: number;
  completedLabs: number;
  experiments: {
    id: string;
    expNumber: number;
    title: string;
    type: 'coding' | 'sql' | 'web';
    points: number;
    status: 'completed' | 'in_progress' | 'pending';
    score?: number;
    description: string;
    starterCode: string;
    sampleOutput: string;
  }[];
}

interface ExamAssessment {
  id: string;
  title: string;
  subjectName: string;
  status: 'active' | 'scheduled' | 'submitted' | 'closed';
  duration: number; // in minutes
  questionsCount: number;
  date: string;
  time?: string;
  score?: number;
  passed?: boolean;
  isLockdown: boolean;
  challenges: {
    id: string;
    title: string;
    type: 'coding' | 'sql' | 'mcq';
    points: number;
    description: string;
    starterCode?: string;
    expectedOutput?: string;
  }[];
}

interface VaultManual {
  id: string;
  subjectCode: string;
  title: string;
  semester: string;
  fileSize: string;
  updatedDate: string;
  totalExperiments: number;
  hasVivaQuestions: boolean;
  downloadUrl: string;
}

// Sample Course & Lab Experiments Data
const LAB_SUBJECTS: LabSubject[] = [
  {
    id: 'sub-ai-ml',
    code: 'CSE-401',
    name: 'Artificial Intelligence & ML Lab',
    iconName: 'ai',
    color: 'from-violet-600 to-indigo-600',
    totalLabs: 10,
    completedLabs: 8,
    experiments: [
      {
        id: 'exp-ai-1',
        expNumber: 1,
        title: 'Implement A* Search Algorithm for Shortest Path',
        type: 'coding',
        points: 100,
        status: 'completed',
        score: 98,
        description: 'Implement the heuristic A* Search algorithm to find the optimal path in a weighted grid map.',
        starterCode: `import heapq\n\ndef a_star_search(graph, start, goal, heuristic):\n    # Initialize open set with start node\n    open_set = [(0 + heuristic[start], 0, start, [start])]\n    visited = set()\n    \n    while open_set:\n        f_score, g_score, current, path = heapq.heappop(open_set)\n        if current == goal:\n            return path, g_score\n        if current in visited:\n            continue\n        visited.add(current)\n        \n        for neighbor, weight in graph.get(current, []):\n            if neighbor not in visited:\n                heapq.heappush(open_set, (g_score + weight + heuristic[neighbor], g_score + weight, neighbor, path + [neighbor]))\n    return None, float('inf')\n\n# Driver code\ngraph = {'A': [('B', 1), ('C', 4)], 'B': [('D', 2)], 'C': [('D', 1)], 'D': []}\nh = {'A': 5, 'B': 2, 'C': 1, 'D': 0}\npath, cost = a_star_search(graph, 'A', 'D', h)\nprint(f"Optimal Path: {path}, Cost: {cost}")`,
        sampleOutput: `Optimal Path: ['A', 'B', 'D'], Cost: 3\nExecution Time: 4.2ms\nAll 5 Test Cases Passed [100/100]`,
      },
      {
        id: 'exp-ai-2',
        expNumber: 2,
        title: 'Decision Tree Classifier on Breast Cancer Dataset',
        type: 'coding',
        points: 100,
        status: 'completed',
        score: 95,
        description: 'Build and train a decision tree classifier with Gini index impurity criterion and calculate test accuracy.',
        starterCode: `from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\nimport numpy as np\n\nX_train = np.array([[1, 2], [2, 3], [3, 1], [6, 5], [7, 7], [8, 6]])\ny_train = np.array([0, 0, 0, 1, 1, 1])\n\nclf = DecisionTreeClassifier(criterion='gini', max_depth=3)\nclf.fit(X_train, y_train)\npreds = clf.predict([[2, 2], [7, 6]])\nprint("Predictions:", preds)`,
        sampleOutput: `Predictions: [0, 1]\nModel Accuracy: 96.4%\nAll 4 Test Cases Passed [95/100]`,
      },
      {
        id: 'exp-ai-3',
        expNumber: 3,
        title: 'Deep Convolutional Neural Network (CNN) for Image Classification',
        type: 'coding',
        points: 100,
        status: 'in_progress',
        description: 'Design a 3-layer CNN with MaxPool2D and Dropout layers for MNIST digit classification.',
        starterCode: `# Build Convolutional Neural Network\nimport torch\nimport torch.nn as nn\n\nclass ConvNet(nn.Module):\n    def __init__(self):\n        super(ConvNet, self).__init__()\n        self.conv1 = nn.Conv2d(1, 32, 3)\n        self.pool = nn.MaxPool2d(2, 2)\n        self.fc = nn.Linear(32 * 13 * 13, 10)\n    def forward(self, x):\n        return self.fc(torch.flatten(self.pool(torch.relu(self.conv1(x))), 1))\n\nmodel = ConvNet()\nprint("Model architecture ready:", model)`,
        sampleOutput: `Model architecture ready: ConvNet(\n  (conv1): Conv2d(1, 32, kernel_size=(3, 3), stride=(1, 1))\n  (pool): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)\n  (fc): Linear(in_features=5408, out_features=10, bias=True)\n)`,
      },
      {
        id: 'exp-ai-4',
        expNumber: 4,
        title: 'Reinforcement Learning: Q-Learning in FrozenLake Environment',
        type: 'coding',
        points: 100,
        status: 'pending',
        description: 'Implement tabular Q-Learning with epsilon-greedy exploration in a gridworld environment.',
        starterCode: `# Tabular Q-Learning Implementation\nimport numpy as np\n\nstates, actions = 16, 4\nq_table = np.zeros((states, actions))\nlr, gamma, eps = 0.8, 0.95, 0.2\nprint(f"Initialized Q-table shape: {q_table.shape}")`,
        sampleOutput: `Initialized Q-table shape: (16, 4)\nConvergence achieved at Episode 420.`,
      },
    ],
  },
  {
    id: 'sub-dsa',
    code: 'CSE-301',
    name: 'Data Structures & Algorithms Lab',
    iconName: 'dsa',
    color: 'from-blue-600 to-cyan-600',
    totalLabs: 12,
    completedLabs: 12,
    experiments: [
      {
        id: 'exp-dsa-1',
        expNumber: 1,
        title: 'LRU Cache Implementation using Doubly Linked List & Hash Map',
        type: 'coding',
        points: 100,
        status: 'completed',
        score: 100,
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity.',
        starterCode: `class Node:\n    def __init__(self, key, val):\n        self.key, self.val = key, val\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n        self.head, self.tail = Node(0, 0), Node(0, 0)\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._insert(node)\n            return node.val\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._insert(node)\n        if len(self.cache) > self.cap:\n            lru = self.head.next\n            self._remove(lru)\n            del self.cache[lru.key]\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _insert(self, node):\n        prev = self.tail.prev\n        prev.next = node\n        node.prev = prev\n        node.next = self.tail\n        self.tail.prev = node\n\ncache = LRUCache(2)\ncache.put(1, 1)\ncache.put(2, 2)\nprint("get(1):", cache.get(1))\ncache.put(3, 3)\nprint("get(2) [evicted]:", cache.get(2))`,
        sampleOutput: `get(1): 1\nget(2) [evicted]: -1\nExecution Time: 3.1ms\nAll 12 Test Cases Passed [100/100]`,
      },
      {
        id: 'exp-dsa-2',
        expNumber: 2,
        title: 'Trie Prefix Tree with Autocomplete Suggestions',
        type: 'coding',
        points: 100,
        status: 'completed',
        score: 96,
        description: 'Construct a Trie with insert, search, and startsWith operations.',
        starterCode: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    def insert(self, word):\n        curr = self.root\n        for ch in word:\n            if ch not in curr.children:\n                curr.children[ch] = TrieNode()\n            curr = curr.children[ch]\n        curr.is_end = True\n\nt = Trie()\nt.insert("apple")\nprint("Trie built successfully")`,
        sampleOutput: `Trie built successfully\nSearch("apple"): True\nSearch("app"): True (prefix)`,
      },
    ],
  },
  {
    id: 'sub-dbms',
    code: 'CSE-304',
    name: 'Database Management Systems Lab',
    iconName: 'db',
    color: 'from-amber-600 to-orange-600',
    totalLabs: 10,
    completedLabs: 9,
    experiments: [
      {
        id: 'exp-db-1',
        expNumber: 1,
        title: 'Complex Multi-Table Joins & Window Analytic Functions',
        type: 'sql',
        points: 100,
        status: 'completed',
        score: 94,
        description: 'Query student grades, rank per department using DENSE_RANK() and compute rolling averages.',
        starterCode: `SELECT \n    s.roll_no,\n    s.full_name,\n    d.dept_name,\n    e.marks,\n    DENSE_RANK() OVER (PARTITION BY d.dept_name ORDER BY e.marks DESC) as dept_rank\nFROM students s\nJOIN departments d ON s.dept_id = d.dept_id\nJOIN enrollments e ON s.student_id = e.student_id\nORDER BY d.dept_name, dept_rank;`,
        sampleOutput: `| roll_no | full_name   | dept_name | marks | dept_rank |\n|---------|-------------|-----------|-------|-----------|\n| 21CS042 | Aryan Reddy | CSE       | 96.5  | 1         |\n| 21CS018 | Sneha Roy   | CSE       | 94.0  | 2         |\n| 21CS089 | Vikram Sen  | CSE       | 91.0  | 3         |\nQuery executed in 1.4ms. 34 rows matched.`,
      },
    ],
  },
  {
    id: 'sub-cloud',
    code: 'CSE-402',
    name: 'Cloud Computing & DevOps Lab',
    iconName: 'cloud',
    color: 'from-emerald-600 to-teal-600',
    totalLabs: 8,
    completedLabs: 6,
    experiments: [
      {
        id: 'exp-cloud-1',
        expNumber: 1,
        title: 'Multi-Stage Dockerfile & Container Orchestration with Docker Compose',
        type: 'coding',
        points: 100,
        status: 'completed',
        score: 92,
        description: 'Create an optimized minimal alpine multi-stage Docker build for a microservice and run compose up.',
        starterCode: `# Multi-stage Dockerfile\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY --from=builder /app/.next/standalone ./\nEXPOSE 3000\nCMD ["node", "server.js"]`,
        sampleOutput: `Successfully tagged resora-service:v1.0\nImage size reduced from 840MB to 78MB (91% optimization).\nContainers started on port 3000.`,
      },
    ],
  },
];

// Sample Assessments matching Exam Mode
const EXAM_ASSESSMENTS: ExamAssessment[] = [
  {
    id: 'exam-live-1',
    title: 'Mid-Term Lab Practical & Coding Assessment',
    subjectName: 'ARTIFICIAL INTELLIGENCE & ML LAB',
    status: 'active',
    duration: 90,
    questionsCount: 3,
    date: 'Today • Oct 14, 2026',
    time: 'Live Now',
    isLockdown: true,
    challenges: [
      {
        id: 'ch-1',
        title: 'Binary Tree Invert & Max Depth Computation',
        type: 'coding',
        points: 100,
        description: 'Given the root of a binary tree, invert the tree, and return its maximum depth in O(n) time.',
        starterCode: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invert_and_max_depth(root):\n    # Write your solution here\n    if not root:\n        return 0\n    root.left, root.right = root.right, root.left\n    return 1 + max(invert_and_max_depth(root.left), invert_and_max_depth(root.right))\n\n# Test case\nroot = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, TreeNode(6), TreeNode(9)))\nprint("Max depth after inversion:", invert_and_max_depth(root))`,
        expectedOutput: `Max depth after inversion: 3\n[All 5 Test Cases Passed]`,
      },
      {
        id: 'ch-2',
        title: 'SQL: Find Second Highest Salary in Each Department',
        type: 'sql',
        points: 100,
        description: 'Write a SQL query to find the employee with the second highest salary in each department using Window Functions.',
        starterCode: `WITH RankedSalaries AS (\n    SELECT \n        emp_name,\n        dept_id,\n        salary,\n        DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank_num\n    FROM employees\n)\nSELECT emp_name, dept_id, salary\nFROM RankedSalaries\nWHERE rank_num = 2;`,
        expectedOutput: `| emp_name     | dept_id | salary  |\n|--------------|---------|---------|\n| Robert Chen  | 101     | 92,000  |\n| Ananya Iyer  | 102     | 88,500  |`,
      },
      {
        id: 'ch-3',
        title: 'MCQ: Time Complexity of Dijkstra with Min-Heap',
        type: 'mcq',
        points: 50,
        description: 'What is the tight worst-case time complexity of Dijkstra algorithm on a graph with V vertices and E edges using a binary min-heap?',
        starterCode: `# Selected: O((V + E) log V)`,
        expectedOutput: `Correct! O((V + E) log V) verified.`,
      },
    ],
  },
  {
    id: 'exam-sub-1',
    title: 'Design & Analysis of Algorithms Practical Exam',
    subjectName: 'DATA STRUCTURES & ALGORITHMS',
    status: 'submitted',
    duration: 90,
    questionsCount: 4,
    date: 'Oct 08, 2026',
    score: 96,
    passed: true,
    isLockdown: true,
    challenges: [],
  },
  {
    id: 'exam-sub-2',
    title: 'Database Systems SQL & Transaction Consistency Test',
    subjectName: 'DATABASE MANAGEMENT SYSTEMS',
    status: 'submitted',
    duration: 60,
    questionsCount: 3,
    date: 'Sep 29, 2026',
    score: 92,
    passed: true,
    isLockdown: true,
    challenges: [],
  },
  {
    id: 'exam-sub-3',
    title: 'Computer Networks Socket Programming & Packet Sniffer Lab',
    subjectName: 'COMPUTER NETWORKS',
    status: 'closed',
    duration: 75,
    questionsCount: 3,
    date: 'Sep 18, 2026',
    isLockdown: false,
    challenges: [],
  },
];

// Lab Manual Vault PDFs
const VAULT_MANUALS: VaultManual[] = [
  {
    id: 'vault-1',
    subjectCode: 'CSE-401',
    title: 'Artificial Intelligence & Machine Learning Lab Manual (2026 Edition)',
    semester: '7th Semester • B.Tech CSE',
    fileSize: '3.4 MB',
    updatedDate: 'Aug 2026',
    totalExperiments: 10,
    hasVivaQuestions: true,
    downloadUrl: '#',
  },
  {
    id: 'vault-2',
    subjectCode: 'CSE-301',
    title: 'Data Structures and Algorithms Laboratory Manual & Solutions',
    semester: '5th Semester • B.Tech CSE',
    fileSize: '4.8 MB',
    updatedDate: 'Jul 2026',
    totalExperiments: 12,
    hasVivaQuestions: true,
    downloadUrl: '#',
  },
  {
    id: 'vault-3',
    subjectCode: 'CSE-304',
    title: 'Database Management Systems SQL Queries & ER Diagram Manual',
    semester: '5th Semester • B.Tech CSE',
    fileSize: '2.9 MB',
    updatedDate: 'Jul 2026',
    totalExperiments: 10,
    hasVivaQuestions: true,
    downloadUrl: '#',
  },
  {
    id: 'vault-4',
    subjectCode: 'CSE-402',
    title: 'Cloud Computing, Docker & Kubernetes Orchestration Lab Manual',
    semester: '7th Semester • B.Tech CSE',
    fileSize: '5.2 MB',
    updatedDate: 'Sep 2026',
    totalExperiments: 8,
    hasVivaQuestions: true,
    downloadUrl: '#',
  },
];

export default function StudentLMSPortalPage() {
  const { currentUser } = useResora();

  // Active View State (mirrors original: DASHBOARD, LABS, PRACTICE, VAULT, EXAMS)
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  const [simulatedRole, setSimulatedRole] = useState<'student' | 'teacher'>('student');

  // Selected subject for Labs view
  const [selectedSubject, setSelectedSubject] = useState<LabSubject>(LAB_SUBJECTS[0]);
  const [selectedExperiment, setSelectedExperiment] = useState(LAB_SUBJECTS[0].experiments[0]);

  // Compiler / Playground state
  const [editorLanguage, setEditorLanguage] = useState<'python' | 'sql' | 'javascript'>('python');
  const [activeCode, setActiveCode] = useState<string>(LAB_SUBJECTS[0].experiments[0].starterCode);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Proctored Exam Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [activeExamChallengeIndex, setActiveExamChallengeIndex] = useState<number>(0);
  const [examCode, setExamCode] = useState<string>('');
  const [examTerminalOutput, setExamTerminalOutput] = useState<string | null>(null);
  const [isExamSubmitting, setIsExamSubmitting] = useState<boolean>(false);
  const [examSuccessNotification, setExamSuccessNotification] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Switch to Lab Experiment
  const handleOpenExperimentInCompiler = (exp: typeof LAB_SUBJECTS[0]['experiments'][0]) => {
    setSelectedExperiment(exp);
    setActiveCode(exp.starterCode);
    setTerminalOutput(null);
    setActiveView('PRACTICE');
  };

  // Handle Code Execution Simulation
  const handleRunCode = () => {
    setIsCompiling(true);
    setTerminalOutput(null);

    setTimeout(() => {
      setIsCompiling(false);
      setTerminalOutput(selectedExperiment.sampleOutput || `Execution successful!\nProcess exited with status 0.`);
    }, 60);
  };

  // Launch Proctored Exam
  const handleStartExamSession = (exam: ExamAssessment) => {
    setIsExamModalOpen(true);
    setActiveExamChallengeIndex(0);
    setExamCode(exam.challenges[0]?.starterCode || '# Write your exam answer here');
    setExamTerminalOutput(null);
  };

  // Run Code inside Exam Session
  const handleRunExamCode = () => {
    setIsCompiling(true);
    setExamTerminalOutput(null);

    setTimeout(() => {
      setIsCompiling(false);
      const activeExam = EXAM_ASSESSMENTS[0];
      const challenge = activeExam.challenges[activeExamChallengeIndex];
      setExamTerminalOutput(challenge?.expectedOutput || 'Execution completed with 0 errors. All test cases passed.');
    }, 60);
  };

  // Submit Exam Session
  const handleSubmitExamSession = () => {
    setIsExamSubmitting(true);
    setTimeout(() => {
      setIsExamSubmitting(false);
      setIsExamModalOpen(false);
      setExamSuccessNotification('Exam submitted successfully! Proctor verification recorded.');
      setTimeout(() => setExamSuccessNotification(null), 3000);
    }, 120);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Resora Main Sidebar */}
      <Sidebar />

      {/* Main LMS Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        {/* ============================================================== */}
        {/* EDUZON / I-LIFE ACE IT STICKY TOPBAR                           */}
        {/* ============================================================== */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            {/* Left: Ace It Brand & Workspace */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-200">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  i-Life Ace It
                  <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Coding Playground
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  AI Powered Learning • College
                </div>
              </div>
            </div>

            {/* Middle: LMS Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveView('DASHBOARD')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activeView === 'DASHBOARD'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveView('LABS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activeView === 'LABS'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Labs
              </button>

              <button
                onClick={() => setActiveView('PRACTICE')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activeView === 'PRACTICE'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Practice
              </button>

              <button
                onClick={() => setActiveView('VAULT')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activeView === 'VAULT'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderArchive className="h-3.5 w-3.5" />
                Lab Manual Vault
              </button>

              <button
                onClick={() => setActiveView('EXAMS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activeView === 'EXAMS'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                Exam Mode
              </button>
            </div>

            {/* Right: Role Switcher & Live External Portal Link */}
            <div className="flex items-center gap-2.5">
              {/* Role Switcher Pill */}
              <div className="hidden lg:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setSimulatedRole('teacher')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    simulatedRole === 'teacher'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Professor
                </button>
                <button
                  onClick={() => setSimulatedRole('student')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    simulatedRole === 'student'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
              </div>

              {/* Direct External Link */}
              <a
                href="https://lms.ilifeaceit.com/student-dashboard"
                target="_blank"
                rel="noreferrer"
                title="Launch original cloud Ace It portal"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold transition-all shadow-sm active:scale-95"
              >
                <span>Live Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              {/* Student Identity Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center ring-2 ring-indigo-100">
                  AR
                </div>
                <div className="hidden xl:block text-left leading-none">
                  <div className="text-xs font-extrabold text-slate-800">Aryan Reddy</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">B.Tech CSE</div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toast / Success Bar */}
        {(toastMessage || examSuccessNotification) && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-black flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMessage || examSuccessNotification}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: STUDENT DASHBOARD (THE EXACT 4 SQUARE CARDS DESIGN)    */}
        {/* ============================================================== */}
        {activeView === 'DASHBOARD' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col justify-between">
            {/* Header section matching https://lms.ilifeaceit.com/student-dashboard */}
            <div className="border-b border-slate-200/80 pb-5">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  Student Workspace
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                  <span>4th Year • Semester 7 • Computer Science & Engineering</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-slate-900">
                Welcome back, Aryan Reddy
              </h1>
            </div>

            {/* THE EXACT 4 ICONIC LARGE SQUARE CARDS */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[52vh] py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-2">
                {/* CARD 1: LAB EXPERIMENTS */}
                <button
                  onClick={() => setActiveView('LABS')}
                  className="relative flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white p-8 transition-all duration-500 shadow-xl shadow-indigo-200 group active:scale-[0.98] overflow-hidden aspect-square w-full max-w-[280px] mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <FlaskConical className="h-12 w-12 text-white drop-shadow-md" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                    <span className="font-extrabold text-lg tracking-tight">Lab Experiments</span>
                    <span className="text-indigo-200 font-bold text-xs flex items-center gap-1 group-hover:text-white transition-colors duration-300 mt-1">
                      Enter Workspace <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                    </span>
                  </div>
                </button>

                {/* CARD 2: PRACTICE EXPERIMENTS */}
                <button
                  onClick={() => setActiveView('PRACTICE')}
                  className="relative flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-amber-600 hover:bg-amber-700 text-white p-8 transition-all duration-500 shadow-xl shadow-amber-200 group active:scale-[0.98] overflow-hidden aspect-square w-full max-w-[280px] mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <Code2 className="h-12 w-12 text-white drop-shadow-md" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                    <span className="font-extrabold text-lg tracking-tight">Practice Experiments</span>
                    <span className="text-amber-200 font-bold text-xs flex items-center gap-1 group-hover:text-white transition-colors duration-300 mt-1">
                      Self Practice <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                    </span>
                  </div>
                </button>

                {/* CARD 3: LAB MANUAL VAULT */}
                <button
                  onClick={() => setActiveView('VAULT')}
                  className="relative flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-700 text-white p-8 transition-all duration-500 shadow-xl shadow-emerald-200 group active:scale-[0.98] overflow-hidden aspect-square w-full max-w-[280px] mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <FolderArchive className="h-12 w-12 text-white drop-shadow-md" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                    <span className="font-extrabold text-lg tracking-tight">Lab Manual Vault</span>
                    <span className="text-emerald-200 font-bold text-xs flex items-center gap-1 group-hover:text-white transition-colors duration-300 mt-1">
                      Download Records <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                    </span>
                  </div>
                </button>

                {/* CARD 4: EXAM MODE */}
                <button
                  onClick={() => setActiveView('EXAMS')}
                  className="relative flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-violet-600 hover:bg-violet-700 text-white p-8 transition-all duration-500 shadow-xl shadow-violet-200 group active:scale-[0.98] overflow-hidden aspect-square w-full max-w-[280px] mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <Award className="h-12 w-12 text-white drop-shadow-md" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                    <span className="font-extrabold text-lg tracking-tight">Exam Mode</span>
                    <span className="text-violet-200 font-bold text-xs flex items-center gap-1 group-hover:text-white transition-colors duration-300 mt-1">
                      Enter Workspace <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Activity Metric Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Lab Time</div>
                  <div className="text-lg font-black text-slate-800">4.5 hrs</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Login Frequency</div>
                  <div className="text-lg font-black text-slate-800">5.8 / week</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assignment Rate</div>
                  <div className="text-lg font-black text-slate-800">91.6%</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Active Streak</div>
                  <div className="text-lg font-black text-slate-800">14 Days Active 🔥</div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: EXAM MODE ASSESSMENTS (FROM EXACT SOURCE CODE)         */}
        {/* ============================================================== */}
        {activeView === 'EXAMS' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header with Back button */}
            <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
              <div>
                <button
                  onClick={() => setActiveView('DASHBOARD')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                </button>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3 text-slate-900">
                  Exam Mode Assessments
                </h1>
              </div>

              <button
                onClick={() => handleStartExamSession(EXAM_ASSESSMENTS[0])}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="h-4 w-4" />
                Launch Live Assessment
              </button>
            </div>

            {/* 4 Assessment KPI Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-2xl text-blue-600 bg-blue-50">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Lab Time</span>
                  <span className="text-xl font-bold text-slate-800">4.5h</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-2xl text-emerald-600 bg-emerald-50 animate-pulse">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Test Mode Exams</span>
                  <span className="text-xl font-bold text-slate-800">1</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-2xl text-amber-600 bg-amber-50">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Scheduled Upcoming</span>
                  <span className="text-xl font-bold text-slate-800">2</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-2xl text-violet-600 bg-violet-50">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Tests</span>
                  <span className="text-xl font-bold text-slate-800">3</span>
                </div>
              </div>
            </div>

            {/* Test Mode Assessments Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Test Mode Assessments
              </h2>

              {/* Live Assessment Card matching exact Eduzon markup */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-[2rem] p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-mono">
                    Assigned Assessment
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/85 backdrop-blur border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {EXAM_ASSESSMENTS[0].subjectName}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🟢 Live Now
                          </span>
                        </div>
                        <h3 className="text-slate-900 font-extrabold text-base mt-1.5">
                          {EXAM_ASSESSMENTS[0].title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {EXAM_ASSESSMENTS[0].duration} Minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Code2 className="h-3.5 w-3.5 text-slate-400" />
                            Solve exactly {EXAM_ASSESSMENTS[0].questionsCount} challenges
                          </span>
                          <span className="text-indigo-600 font-bold flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" />
                            Secure Lockdown Mode
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                          Proctored Assessment Session
                        </span>
                        <span className="text-sm font-semibold text-slate-700 mt-1 block">
                          Contains {EXAM_ASSESSMENTS[0].challenges.length} challenges (Coding, SQL, and MCQ).
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartExamSession(EXAM_ASSESSMENTS[0])}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Start Exam Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed / Submitted Assessments Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                {EXAM_ASSESSMENTS.slice(1).map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {exam.subjectName}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            exam.status === 'submitted'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </div>

                      <h3 className="text-slate-800 font-bold text-sm leading-snug line-clamp-2">
                        {exam.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{exam.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{exam.duration} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-5 space-y-3">
                      {exam.status === 'submitted' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">Status</div>
                              <div className="text-sm font-extrabold text-emerald-600">Submitted</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900">{exam.score}%</span>
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                                {exam.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => showToast(`Reviewing completed submission for: ${exam.title}`)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Review Submission
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-xs font-semibold text-slate-400 italic">
                          This assessment is closed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lab Recommendation Banner matching original Eduzon template */}
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/40 p-5 grid md:grid-cols-3 gap-6 items-center mt-6">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest">
                      Lab Recommendation
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-base leading-snug">
                    Ready to ace your upcoming lab exams?
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 max-w-xl">
                    We highly recommend practicing coding inside the <strong>Lab Hub</strong> and reviewing templates
                    to strengthen your skills before scheduled sessions!
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('LABS')}
                  className="h-11 px-5 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  Explore Learning Hub
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: LABS LEARNING HUB (SUBJECTS & EXPERIMENTS)             */}
        {/* ============================================================== */}
        {activeView === 'LABS' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-600">College Learning Hub</span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Lab Experiments & Syllabus
                </h1>
              </div>

              <button
                onClick={() => setActiveView('DASHBOARD')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm self-start md:self-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Subject Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAB_SUBJECTS.map((sub) => {
                const isSelected = selectedSubject.id === sub.id;
                const percent = Math.round((sub.completedLabs / sub.totalLabs) * 100);
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setSelectedExperiment(sub.experiments[0]);
                      setActiveCode(sub.experiments[0].starterCode);
                    }}
                    className={`rounded-2xl p-4 text-left border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {sub.code}
                        </span>
                        <span className="text-xs font-black text-indigo-600">{percent}%</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        {sub.completedLabs} of {sub.totalLabs} Labs Completed
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Experiments List for the selected subject */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    {selectedSubject.code} • Experiments
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {selectedSubject.name}
                  </h2>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {selectedSubject.experiments.length} Experiments in Syllabus
                </div>
              </div>

              <div className="space-y-4">
                {selectedSubject.experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                          Exp #{exp.expNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 font-mono">
                          {exp.type}
                        </span>
                        {exp.status === 'completed' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Completed ({exp.score}/100)
                          </span>
                        )}
                        {exp.status === 'in_progress' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            In Progress
                          </span>
                        )}
                        {exp.status === 'pending' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Pending
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                        {exp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenExperimentInCompiler(exp)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Open Compiler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: PRACTICE HUB / INTERACTIVE CODING IDE                 */}
        {/* ============================================================== */}
        {activeView === 'PRACTICE' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-600">Ace It Interactive IDE</span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Practice Experiments & Code Sandbox
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('LABS')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Change Lab
                </button>
                <button
                  onClick={() => setActiveView('DASHBOARD')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </button>
              </div>
            </div>

            {/* IDE Workspace Layout (Left: Description, Right: Code Editor & Console) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Problem Details & Test Cases */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {selectedSubject.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Exp #{selectedExperiment.expNumber}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedExperiment.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {selectedExperiment.description}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Experiment Specifications
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Language:</span>
                        <span className="font-bold text-slate-800 uppercase">{selectedExperiment.type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Total Marks:</span>
                        <span className="font-bold text-indigo-600">{selectedExperiment.points} Points</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Time Limit:</span>
                        <span className="font-bold text-slate-800">1.0 sec per test case</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Expected Output */}
                  <div className="mt-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Sample Test Output
                    </span>
                    <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-tight">
                      {selectedExperiment.sampleOutput}
                    </pre>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveCode(selectedExperiment.starterCode);
                      setTerminalOutput(null);
                      showToast('Code reset to original boilerplate');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Starter Code
                  </button>
                  <button
                    onClick={() => showToast('Full solution manual is locked until practical submission')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Hints & Docs
                  </button>
                </div>
              </div>

              {/* Right Column: Code Editor & Terminal */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Editor Container */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden flex flex-col">
                  {/* Editor Top Bar */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        solution.{selectedExperiment.type === 'sql' ? 'sql' : 'py'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunCode}
                        disabled={isCompiling}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {isCompiling ? 'Running Code...' : 'Run Code'}
                      </button>
                    </div>
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    value={activeCode}
                    onChange={(e) => setActiveCode(e.target.value)}
                    rows={15}
                    spellCheck={false}
                    className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed border-none"
                    placeholder="Write your code solution here..."
                  />

                  {/* Terminal Console Output */}
                  <div className="bg-slate-900 border-t border-slate-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Console Output</span>
                      </div>
                      {terminalOutput && (
                        <button
                          onClick={() => setTerminalOutput(null)}
                          className="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {isCompiling ? (
                      <div className="text-xs font-mono text-amber-400 flex items-center gap-2 py-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Compiling and evaluating test cases on remote runner...
                      </div>
                    ) : terminalOutput ? (
                      <pre className="text-xs font-mono text-emerald-400 bg-slate-950/80 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                        {terminalOutput}
                      </pre>
                    ) : (
                      <div className="text-xs font-mono text-slate-500 py-1 italic">
                        Click &quot;Run Code&quot; to execute your solution against test inputs.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: LAB MANUAL VAULT (DOWNLOADABLE RECORDS & MANUALS)      */}
        {/* ============================================================== */}
        {activeView === 'VAULT' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-600">Lab Manual Vault</span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Verified Lab Manuals & Observation Records
                </h1>
              </div>

              <button
                onClick={() => setActiveView('DASHBOARD')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Manual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VAULT_MANUALS.map((manual) => (
                <div
                  key={manual.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {manual.subjectCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {manual.fileSize} • PDF
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {manual.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {manual.semester}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Experiments</span>
                        <span className="font-black text-slate-800">{manual.totalExperiments} Complete Labs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Viva Voce</span>
                        <span className="font-black text-emerald-600">Included (50+ Q&A)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => showToast(`Previewing manual: ${manual.title}`)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center"
                    >
                      View Online
                    </button>
                    <button
                      onClick={() => showToast(`Downloading official verified PDF: ${manual.title}`)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* University Guidelines Card */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">
                  Academic Laboratory Submission Guidelines
                </h4>
                <p className="text-xs text-emerald-800/80 mt-1 max-w-2xl">
                  Observation records must be signed weekly. Downloaded manuals include the full code templates,
                  flowcharts, circuit diagrams, and sample input/output required for semester viva examinations.
                </p>
              </div>
              <button
                onClick={() => showToast('Opening Lab Viva Voce Question Bank')}
                className="px-5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-extrabold text-xs shadow-sm hover:bg-emerald-50 transition-all whitespace-nowrap"
              >
                Viva Question Bank →
              </button>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* INTERACTIVE PROCTORED EXAM RUNNER MODAL                        */}
        {/* ============================================================== */}
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Modal Topbar */}
              <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-extrabold text-rose-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      PROCTORED ASSESSMENT ACTIVE
                    </div>
                    <h2 className="text-sm font-extrabold text-white">
                      {EXAM_ASSESSMENTS[0].title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>01:28:44 Remaining</span>
                  </div>

                  <button
                    onClick={() => setIsExamModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Challenge Selector Tabs */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex items-center gap-2">
                {EXAM_ASSESSMENTS[0].challenges.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveExamChallengeIndex(idx);
                      setExamCode(ch.starterCode || '');
                      setExamTerminalOutput(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeExamChallengeIndex === idx
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Challenge #{idx + 1} ({ch.type})
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Problem Statement */}
                <div className="md:col-span-5 p-6 border-r border-slate-800 overflow-y-auto text-slate-300 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-violet-400 tracking-wider">
                      Question #{activeExamChallengeIndex + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {EXAM_ASSESSMENTS[0].challenges[activeExamChallengeIndex].title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {EXAM_ASSESSMENTS[0].challenges[activeExamChallengeIndex].description}
                  </p>

                  <div className="border-t border-slate-800 pt-3 text-xs space-y-1 text-slate-400">
                    <div>Marks: <strong className="text-emerald-400">{EXAM_ASSESSMENTS[0].challenges[activeExamChallengeIndex].points} pts</strong></div>
                    <div>Proctor Status: <span className="text-emerald-400 font-bold">Screen & Webcam Recording</span></div>
                  </div>
                </div>

                {/* Live Compiler & Console */}
                <div className="md:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
                  <textarea
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed flex-1 border-none"
                    placeholder="Type your exam solution..."
                  />

                  {/* Terminal */}
                  <div className="bg-slate-900 border-t border-slate-800 p-3 h-36 overflow-y-auto">
                    <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-violet-400" />
                      <span>Exam Test Output</span>
                    </div>
                    {isCompiling ? (
                      <div className="text-xs font-mono text-amber-400 animate-pulse">Running test cases...</div>
                    ) : examTerminalOutput ? (
                      <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{examTerminalOutput}</pre>
                    ) : (
                      <div className="text-xs font-mono text-slate-500 italic">No output yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between">
                <button
                  onClick={handleRunExamCode}
                  disabled={isCompiling}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Test Challenge
                </button>

                <button
                  onClick={handleSubmitExamSession}
                  disabled={isExamSubmitting}
                  className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-violet-600/30 transition-all active:scale-95"
                >
                  {isExamSubmitting ? 'Submitting to Ace It...' : 'Final Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
