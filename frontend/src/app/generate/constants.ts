import { Users, Target, Timer, Drill } from "lucide-react";
import {
  SubjectItem,
  BloomLevelItem,
  OptionItem,
  QuickStatItem,
  ExamPatternItem,
  SyllabusTemplateItem,
  FormState,
} from "./types";

export const subjects: SubjectItem[] = [
  { id: "information_security", name: "Information Security", category: "Security", difficulty: "Hard", credits: 4, popularity: 94 },
  { id: "artificial_intelligence_machine_learning", name: "Artificial Intelligence / Machine Learning", category: "Artificial Intelligence", difficulty: "Hard", credits: 4, popularity: 96 },
  { id: "cloud_computing", name: "Cloud Computing", category: "Cloud Computing", difficulty: "Medium", credits: 4, popularity: 98 },
  { id: "it_project_management", name: "Information Technology Project Management", category: "Project Management", difficulty: "Medium", credits: 3, popularity: 88 },
  { id: "automata_compiler_construction", name: "Automata Theory and Compiler Construction", category: "Computer Science", difficulty: "Hard", credits: 4, popularity: 86 },
];

export const bloomLevels: BloomLevelItem[] = [
  { value: "remember", label: "Remember", description: "Define, list, identify" },
  { value: "understand", label: "Understand", description: "Explain, describe, summarize" },
  { value: "apply", label: "Apply", description: "Solve, implement, use" },
  { value: "analyze", label: "Analyze", description: "Compare, examine, differentiate" },
  { value: "evaluate", label: "Evaluate", description: "Judge, assess, critique" },
  { value: "create", label: "Create", description: "Design, construct, develop" },
];

export const paperTypes: OptionItem[] = [
  { value: "important", label: "Important Topics Focus", description: "Focus on high-frequency topics" },
  { value: "balanced", label: "Balanced Paper", description: "Even distribution across topics" },
  { value: "challenging", label: "Challenging Paper", description: "More analytical questions" },
];

export const questionTypes: OptionItem[] = [
  { value: "short", label: "Short Questions", description: "2-5 marks, concise answers" },
  { value: "long", label: "Long Questions", description: "10-15 marks, detailed answers" },
  { value: "mixed", label: "Mixed", description: "Combination of short and long" },
];

export const categories: string[] = [
  "All",
  "Security",
  "Artificial Intelligence",
  "Cloud Computing",
  "Project Management",
  "Computer Science",
];

export const quickStats: QuickStatItem[] = [
  { label: "Active Classrooms / Sessions", value: "24", icon: Users, trend: "+6 this week" },
  { label: "Diagnostic Accuracy Rate", value: "94.2%", icon: Target, trend: "+2.1%" },
  { label: "Average Evaluation Time", value: "< 5 sec", icon: Timer, trend: "Automated grading" },
  { label: "Remediation Drills Assigned", value: "386", icon: Drill, trend: "+18 today" },
];

export const examPatterns: ExamPatternItem[] = [
  { 
    value: "certification", 
    label: "Certification Exam Pattern", 
    description: "Standard certification format with short questions and domain-based long questions",
    structure: {
      shortQuestions: { count: 5, marks: 2, total: 10, choice: { generate: 7, attempt: 5 } },
      longQuestions: { count: 8, marks: 15, total: 60, units: 4, questionsPerUnit: 2 },
      totalMarks: 70
    }
  },
  { 
    value: "custom", 
    label: "Custom Pattern", 
    description: "Design your own paper structure",
    structure: {
      sections: [],
      totalMarks: 80
    }
  },
];

export const syllabusTemplates: SyllabusTemplateItem[] = [
  {
    id: "it-project-management-template",
    name: "CS-5308: Information Technology Project Management",
    subject: "it_project_management",
    content: `Unit I: Project Management Foundations
- Project management basics and terminology
- Information technology context and systems view
- Project stakeholder management
- Project management process groups

Unit II: Integration and Scope Management
- Project integration management
- Project charter development
- Scope management
- Work breakdown structures

Unit III: Schedule, Cost, and Quality Management
- Schedule management
- Cost management and project budgeting
- Quality management
- Six Sigma principles

Unit IV: Resource, Communication, and Team Management
- Project resource management
- Team charters and human resource processes
- Communication management
- Effective project meetings

Unit V: Risk, Procurement, and Project Closure
- Project risk management
- Common information technology risks
- Procurement management
- Statements of work
- Closing procurements`,
  },
  {
    id: "automata-compiler-template",
    name: "CS-5517: Automata Theory and Compiler Construction",
    subject: "automata_compiler_construction",
    content: `Unit I: Automata and Formal Languages
- Alphabets and strings
- Deterministic finite automata (DFA)
- Nondeterministic finite automata (NFA)
- State minimization
- Regular expressions
- Context-free grammars

Unit II: Compiler Fundamentals and Syntax Analysis
- Compiler structures and phases
- Lexical analyzer implementation
- Parse trees
- Grammar ambiguity
- Capabilities of context-free grammars

Unit III: Parsing Techniques
- Top-down parsers
- Bottom-up parsers
- Operator precedence parsers
- LR parsers
- YACC

Unit IV: Semantic Analysis and Intermediate Code
- Semantic analysis
- Type matching
- Syntax-directed translation
- Intermediate code generation
- Three-address code

Unit V: Code Optimization and Symbol Tables
- Code optimization techniques
- Loop optimization
- Basic blocks
- Data flow analysis
- Symbol table management`,
  },
  {
    id: "information-security-template",
    name: "CS-5615: Information Security",
    subject: "information_security",
    content: `Unit I: Computer Security Fundamentals
- Computer security concepts
- Confidentiality, integrity, and availability
- Active and passive attacks
- Security services

Unit II: Classical Cryptography
- Symmetric cipher models
- Classical substitution techniques
- Classical transposition techniques
- Steganography

Unit III: Modern Symmetric Ciphers
- Stream ciphers and block ciphers
- S-boxes and P-boxes
- Diffusion and confusion
- Feistel ciphers
- DES and Triple DES

Unit IV: Advanced Encryption and Key Exchange
- Diffie-Hellman key exchange
- International Data Encryption Algorithm (IDEA)
- RC-5
- Blowfish
- Advanced Encryption Standard (AES)

Unit V: Public Key Security and Access Control
- Asymmetric cryptography algorithms
- RSA
- Digital signatures
- Public Key Infrastructure (PKI)
- Access control`,
  },
  {
    id: "artificial-intelligence-machine-learning-template",
    name: "CS-5715: Artificial Intelligence and Machine Learning",
    subject: "artificial_intelligence_machine_learning",
    content: `Unit I: AI and Machine Learning Foundations
- Introduction to artificial intelligence and machine learning
- Concept learning as search
- Version spaces
- Evaluation metrics
- Cross-validation
- Data pre-processing

Unit II: Supervised Learning and Decision Trees
- Linear regression
- Logistic regression
- K-nearest neighbors (KNN)
- Decision tree learning
- ID3
- C4.5 and CART

Unit III: Dimensionality Reduction and Classification
- Principal component analysis (PCA)
- Probabilistic classifiers
- Naive Bayes
- Non-probabilistic classifiers
- Support vector machines (SVM)

Unit IV: Clustering and Ensemble Learning
- K-means clustering
- Hierarchical clustering
- Ensemble learning methods
- Boosting and bagging
- Random forest
- AdaBoost

Unit V: Neural Networks and Emerging AI
- Artificial neural networks
- Backpropagation
- Deep learning
- Convolutional neural networks (CNN)
- Recurrent neural networks (RNN)
- GANs, large language models (LLMs), and GenAI`,
  },
  {
    id: "cloud-computing-template",
    name: "CS-6518: Cloud Computing",
    subject: "cloud_computing",
    content: `Unit I: Cloud Computing Foundations
- Cloud computing definitions and evolution
- Public, private, and hybrid deployment models
- Cloud stakeholders
- Service-level agreements (SLAs)

Unit II: Virtualization and Cloud Infrastructure
- Virtualization basics and types
- Virtualization tools
- AWS virtual machines
- Load balancing
- Data-center automation

Unit III: Cloud Service Models
- Infrastructure as a Service (IaaS)
- Platform as a Service (PaaS)
- Software as a Service (SaaS)
- Comparing cloud service responsibilities

Unit IV: Advanced Cloud Services and Platforms
- Database as a Service (DBaaS)
- Serverless computing
- Microservices
- Hadoop and HDFS
- DevOps
- Containers and Kubernetes

Unit V: Cloud Security and Emerging Technologies
- Cloud security issues
- Artificial intelligence and machine learning in the cloud
- Fog computing
- Edge computing
- Green cloud initiatives`,
  },
];

export const initialFormState: FormState = {
  test_title: "",
  course: "",
  subject: "",
  target_group: "",
  syllabus: "",
  exam_pattern: "certification",
  pattern_type: "certification",
  total_marks: 70,
  duration_minutes: 180,
  difficulty_distribution: { easy: 30, medium: 40, hard: 30 },
  num_questions: 13,
  organization_name: "",
  semester: "",
  choice_based: { enabled: false, generate: 7, attempt: 5 },
  sub_parts: { enabled: false, format: "(a)(b)" },
  pyq_percentage: 20,
  bloom_level: "apply",
  paper_type: "balanced",
  question_type: "mixed",
  question_types: ["mcq", "short_answer"],
  conceptual_percentage: 40,
  applied_percentage: 60,
  automated_gap_analysis: true,
  remediation_drills: true,
  grading_rubric: "",
  session_code: "",
  shareable_link: "",
  schedule_enabled: false,
  schedule_window: "Today, 4:00 PM – 6:00 PM",
  custom_sections: [],
  units: [],
  topics: [],
  keywords: [],
};
