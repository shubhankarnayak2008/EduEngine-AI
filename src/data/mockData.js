/**
 * Curated B.Tech Academic Data
 * Comprehensive YouTube lectures, semester syllabus, career roadmaps,
 * bug scenarios, flashcards, and sample notes.
 */

export const BTECH_BRANCHES = [
  { id: "CSE", name: "Computer Science & Engineering" },
  { id: "AIML", name: "CSE (AI & Machine Learning)" },
  { id: "DS", name: "CSE (Data Science)" },
  { id: "IT", name: "Information Technology" },
  { id: "CYBER", name: "Cyber Security & Forensics" },
  { id: "ECE", name: "Electronics & Communication" }
];

export const BTECH_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const YOUTUBE_LECTURES = [
  {
    id: "dsa-graphs",
    title: "Graph Theory: BFS, DFS, Dijkstra & Bellman-Ford",
    subject: "Data Structures & Algorithms",
    branch: "CSE",
    semester: 3,
    duration: "1h 45m",
    youtubeId: "pcKY4hjDrxk", // Striver Graph Playlist core lecture
    instructor: "take U forward / Striver",
    description: "Deep dive into Graph representations (Adjacency Matrix vs List), Traversal algorithms (BFS & DFS), and Shortest Path algorithms.",
    timestamps: [
      { time: "00:00", label: "Graph Representation (Adj List)" },
      { time: "18:30", label: "Breadth-First Search (BFS) Logic" },
      { time: "42:15", label: "Depth-First Search (DFS) Recursion" },
      { time: "1:10:00", label: "Dijkstra's Algorithm with Min-Heap" },
      { time: "1:32:00", label: "Bellman-Ford for Negative Cycles" }
    ],
    notesPlaceholder: "# Notes on Graph Algorithms\n- BFS uses a Queue (FIFO) - layer by layer traversal\n- DFS uses Recursion / Stack (LIFO)\n- Dijkstra Time: O((V + E) log V)"
  },
  {
    id: "os-deadlocks",
    title: "Operating Systems: Deadlock & Banker's Algorithm",
    subject: "Operating Systems",
    branch: "CSE",
    semester: 4,
    duration: "52m",
    youtubeId: "rWFHH4nSOh8", // Gate Smashers Deadlocks
    instructor: "Gate Smashers",
    description: "4 Coffman conditions for Deadlock, Resource Allocation Graphs (RAG), and step-by-step numerical on Banker's Algorithm.",
    timestamps: [
      { time: "00:00", label: "What is Deadlock?" },
      { time: "08:45", label: "4 Necessary Coffman Conditions" },
      { time: "21:10", label: "Resource Allocation Graph (RAG)" },
      { time: "33:20", label: "Banker's Algorithm: Safe State Check" },
      { time: "45:00", label: "Resource Request Algorithm Numerical" }
    ],
    notesPlaceholder: "# Deadlock 4 Conditions:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\nBanker's: Need[i][j] = Max[i][j] - Alloc[i][j]"
  },
  {
    id: "dbms-normalization",
    title: "DBMS: Normalization (1NF, 2NF, 3NF, BCNF) with Real Examples",
    subject: "Database Management Systems",
    branch: "CSE",
    semester: 4,
    duration: "1h 12m",
    youtubeId: "5dspshkgevg", // Knowledge Gate DBMS Normalization
    instructor: "Knowledge Gate",
    description: "Master functional dependencies, prime vs non-prime attributes, candidate keys, and lossless join decomposition into BCNF.",
    timestamps: [
      { time: "00:00", label: "Why Normalization? Redundancy & Anomalies" },
      { time: "12:40", label: "1st Normal Form (Atomicity)" },
      { time: "25:15", label: "2nd Normal Form & Partial Dependencies" },
      { time: "44:30", label: "3rd Normal Form & Transitive Dependencies" },
      { time: "58:00", label: "Boyce-Codd Normal Form (BCNF)" }
    ],
    notesPlaceholder: "# Normal Forms Quick Reference:\n- 1NF: Atomic values only\n- 2NF: No partial dependency (non-prime -> proper subset of candidate key)\n- 3NF: No transitive dependency\n- BCNF: In X -> Y, X must be a super key!"
  },
  {
    id: "cn-tcp-ip",
    title: "Computer Networks: TCP 3-Way Handshake, Flow & Congestion Control",
    subject: "Computer Networks",
    branch: "CSE",
    semester: 5,
    duration: "58m",
    youtubeId: "qAMrk4zM9iY", // Neso Academy TCP Handshake
    instructor: "Neso Academy",
    description: "Comprehensive breakdown of Transmission Control Protocol (TCP), Sequence & ACK numbers, SYN floods, Sliding Window, and Congestion Avoidance.",
    timestamps: [
      { time: "00:00", label: "TCP vs UDP Fundamentals" },
      { time: "14:20", label: "3-Way Handshake (SYN, SYN-ACK, ACK)" },
      { time: "28:10", label: "Sliding Window Flow Control" },
      { time: "41:00", label: "Slow Start & Congestion Avoidance" },
      { time: "51:30", label: "TCP 4-Way Connection Teardown (FIN)" }
    ],
    notesPlaceholder: "# TCP Core:\n- Connection-oriented & reliable\n- 3-Way Handshake establishes initial sequence numbers\n- Flow control uses Sliding Window (Receiver Advertised Window)\n- Congestion control: Slow Start, AIMD (Additive Increase Multiplicative Decrease)"
  },
  {
    id: "ml-neural-nets",
    title: "Machine Learning: Neural Networks & Backpropagation Explained",
    subject: "Artificial Intelligence & ML",
    branch: "AIML",
    semester: 5,
    duration: "1h 22m",
    youtubeId: "aircAruvnKk", // 3Blue1Brown Neural Networks
    instructor: "3Blue1Brown",
    description: "Visual intuition for Deep Learning, Perceptrons, Activation functions (ReLU, Sigmoid, Softmax), Loss functions, and Gradient Descent.",
    timestamps: [
      { time: "00:00", label: "What is a Neural Network?" },
      { time: "19:15", label: "Gradient Descent: Walking Down the Valley" },
      { time: "38:40", label: "Backpropagation Calculus & Chain Rule" },
      { time: "58:00", label: "Activation Functions (Sigmoid vs ReLU)" },
      { time: "1:12:00", label: "Overfitting & Regularization (Dropout)" }
    ],
    notesPlaceholder: "# Deep Learning Notes:\n- Forward Pass: a^(L) = sigma(W^(L) a^(L-1) + b^(L))\n- Loss: Mean Squared Error or Cross-Entropy\n- Backprop: Uses Chain Rule to find dLoss/dWeight"
  },
  {
    id: "eng-math-eigen",
    title: "Engineering Mathematics: Eigenvalues, Eigenvectors & Diagonalization",
    subject: "Engineering Mathematics",
    branch: "CSE",
    semester: 1,
    duration: "48m",
    youtubeId: "PFDu9oVAE-g", // 3Blue1Brown Linear Algebra Eigenvalues
    instructor: "Essence of Linear Algebra",
    description: "Geometric meaning of Matrix transformations, Characteristic Equation det(A - lambda*I) = 0, and Cayley-Hamilton Theorem.",
    timestamps: [
      { time: "00:00", label: "Geometric Meaning of Matrices" },
      { time: "11:20", label: "What are Eigenvalues and Eigenvectors?" },
      { time: "24:30", label: "Solving det(A - lambda*I) = 0" },
      { time: "37:00", label: "Cayley-Hamilton Theorem & Matrix Inverse" }
    ],
    notesPlaceholder: "# Eigenvalues & Eigenvectors:\n- Equation: A * v = lambda * v\n- Characteristic Eq: |A - lambda * I| = 0\n- Sum of eigenvalues = Trace of Matrix (Sum of diagonal elements)\n- Product of eigenvalues = Determinant |A|"
  },
  {
    id: "sys-design-scale",
    title: "System Design for SDE Interviews: Scale from 1 to 10M Users",
    subject: "System Design & Cloud",
    branch: "CSE",
    semester: 6,
    duration: "1h 05m",
    youtubeId: "xpDnVSmNFX0", // Gaurav Sen System Design
    instructor: "Gaurav Sen",
    description: "Monolith vs Microservices, Caching (Redis), Load Balancing (Nginx, Round Robin), Database Sharding, Replication, and CDN.",
    timestamps: [
      { time: "00:00", label: "Single Server Architecture" },
      { time: "14:10", label: "Horizontal vs Vertical Scaling" },
      { time: "26:30", label: "Load Balancers & Reverse Proxies" },
      { time: "42:00", label: "Database Replication & Read Replicas" },
      { time: "55:00", label: "Caching Strategies (Cache-Aside vs Write-Through)" }
    ],
    notesPlaceholder: "# System Design Concepts:\n- Horizontal Scaling: Add more commodity servers\n- Caching: Redis / Memcached in-memory key-value store\n- Database Sharding: Partition tables horizontally across servers\n- CAP Theorem: Consistency, Availability, Partition Tolerance"
  },
  {
    id: "ece-kmaps",
    title: "Digital Electronics: Karnaugh Maps (K-Map) 2, 3, and 4 Variables",
    subject: "Digital Electronics",
    branch: "ECE",
    semester: 2,
    duration: "44m",
    youtubeId: "CpsH55ZkI4E", // Neso Academy K-Map
    instructor: "Neso Academy",
    description: "Simplification of Boolean expressions using Gray code ordering, Pairs, Quads, Octets, and Don't Care conditions.",
    timestamps: [
      { time: "00:00", label: "Introduction to K-Maps" },
      { time: "10:15", label: "Gray Code Sequencing (00, 01, 11, 10)" },
      { time: "22:40", label: "3-Variable & 4-Variable K-Map Grouping" },
      { time: "35:10", label: "Don't Care (X) Conditions" }
    ],
    notesPlaceholder: "# K-Map Rules:\n- Adjacent cells differ by only 1 bit (Gray Code)\n- Group size must always be a power of 2 (1, 2, 4, 8, 16)\n- Always prioritize largest groups (Octets > Quads > Pairs)"
  }
];

export const FLASHCARD_DECKS = [
  {
    id: "deck-os",
    name: "Operating Systems Core Concepts",
    subject: "Operating Systems",
    cards: [
      {
        question: "What is the difference between a Process and a Thread?",
        answer: "A Process is an executing program with its own dedicated memory address space (text, data, heap). A Thread is a lightweight unit of CPU execution inside a process that shares code, data, and open files with sibling threads, but possesses its own private stack and registers."
      },
      {
        question: "State the four Coffman conditions for Deadlock.",
        answer: "1. Mutual Exclusion (unsharable resource)\n2. Hold and Wait (holding one resource while waiting for another)\n3. No Preemption (resources cannot be forcibly taken)\n4. Circular Wait (chain of processes waiting in a ring)."
      },
      {
        question: "What is Thrashing in Virtual Memory?",
        answer: "Thrashing occurs when the system spends more time swapping pages between RAM and disk swap space than executing application instructions, causing CPU utilization to collapse."
      },
      {
        question: "What is the Translation Lookaside Buffer (TLB)?",
        answer: "A high-speed associative hardware cache in the Memory Management Unit (MMU) that stores recent virtual-to-physical address translations to accelerate memory lookups."
      },
      {
        question: "Compare Mutex vs Semaphore.",
        answer: "A Mutex is a locking mechanism owned by a single thread (only the locker can unlock it). A Semaphore is a signaling mechanism (any thread can signal wait() or post()) capable of managing integer resource counts."
      }
    ]
  },
  {
    id: "deck-dsa",
    name: "Data Structures & Big-O Complexities",
    subject: "DSA",
    cards: [
      {
        question: "What is the Time Complexity of HeapSort in Worst, Average, and Best cases?",
        answer: "O(n log n) in all cases! Building max heap takes O(n), and n-1 extractions take O(n log n). Space complexity is O(1) auxiliary."
      },
      {
        question: "Why is MergeSort preferred over QuickSort for Linked Lists?",
        answer: "Linked Lists allow O(1) node insertion/merging without extra memory copying, making MergeSort O(n log n) time and O(1) extra pointer space. QuickSort requires random element access which is O(n) in linked lists."
      },
      {
        question: "What is the Master Theorem for Divide & Conquer?",
        answer: "For T(n) = a*T(n/b) + f(n):\nCompare f(n) with n^(log_b a).\n1. If f(n) = O(n^(log_b a - epsilon)), then T(n) = Theta(n^(log_b a))\n2. If f(n) = Theta(n^(log_b a) * log^k n), then T(n) = Theta(n^(log_b a) * log^(k+1) n)\n3. If f(n) = Omega(n^(log_b a + epsilon)), then T(n) = Theta(f(n))."
      },
      {
        question: "How do you detect a cycle in a Linked List in O(n) time and O(1) space?",
        answer: "Floyd's Cycle-Finding Algorithm (Tortoise and Hare): Use two pointers. Slow advances by 1 node, Fast advances by 2 nodes. If they meet, a cycle exists."
      }
    ]
  },
  {
    id: "deck-dbms",
    name: "DBMS & SQL Normalization",
    subject: "DBMS",
    cards: [
      {
        question: "What are the ACID properties in database transactions?",
        answer: "Atomicity (all or nothing), Consistency (preserves integrity invariants), Isolation (concurrent transactions execute independently without interference), Durability (committed changes persist across system crashes)."
      },
      {
        question: "What is the difference between 3NF and BCNF?",
        answer: "For any dependency X -> Y:\nIn 3NF, either X is a super key OR Y is a prime attribute (part of candidate key).\nIn BCNF, X MUST be a super key with no exceptions. BCNF strictly eliminates all functional dependency redundancies."
      },
      {
        question: "What is the advantage of a B+ Tree over a B Tree for database indexes?",
        answer: "1. All actual data pointers reside solely in leaf nodes, allowing internal nodes to store more keys and have higher branching factor (lower tree height).\n2. All leaf nodes are linked via a doubly linked list, enabling ultra-fast range queries (BETWEEN x AND y)."
      }
    ]
  }
];

export const BUG_SCENARIOS = [
  {
    id: "cpp-segfault",
    name: "C++ Dangling Pointer / Segmentation Fault",
    language: "cpp",
    errorType: "Segmentation Fault (SIGSEGV)",
    code: `#include <iostream>
using namespace std;

int* generateNumbers() {
    int localArray[5] = {10, 20, 30, 40, 50};
    // Bug: Returning pointer to stack-allocated memory that will be deallocated!
    return localArray; 
}

int main() {
    int* ptr = generateNumbers();
    // Accessing dangling pointer triggers Segmentation Fault / Undefined Behavior
    cout << "First value: " << ptr[0] << endl;
    return 0;
}`
  },
  {
    id: "python-recursion",
    name: "Python Recursion Depth Exceeded (Stack Overflow)",
    language: "python",
    errorType: "RecursionError: maximum recursion depth exceeded",
    code: `def fibonacci(n):
    # Bug: Missing base case for n <= 0, causing infinite negative recursion!
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci of 5:", fibonacci(-2))`
  },
  {
    id: "java-nullpointer",
    name: "Java NullPointerException in Linked List Traversal",
    language: "java",
    errorType: "java.lang.NullPointerException",
    code: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}

public class Main {
    public static void printList(Node head) {
        Node curr = head;
        // Bug: curr.next checked without verifying curr != null first!
        while (curr.next != null) {
            System.out.println(curr.val);
            curr = curr.next;
        }
    }

    public static void main(String[] args) {
        Node emptyHead = null;
        printList(emptyHead);
    }
}`
  },
  {
    id: "sql-cartesian",
    name: "SQL Missing Join Condition (Cartesian Explosion)",
    language: "sql",
    errorType: "High Memory / Cartesian Product (CROSS JOIN)",
    code: `-- Bug: Missing ON or WHERE clause connecting Students and Enrollments!
SELECT 
    s.student_name,
    e.course_id,
    e.grade
FROM 
    Students s,
    Enrollments e;
-- Triggers M x N rows explosion crashing the database query engine!`
  }
];

export const CAREER_ROADMAPS = [
  {
    id: "sde",
    title: "Core Software Development Engineer (SDE / FAANG)",
    description: "Master Data Structures, Algorithms, System Design, and Low-Level Programming for product engineering roles.",
    semesters: [
      {
        sem: "Sem 1-2: Foundations",
        items: [
          { name: "Master C++ / Java (Pointers, Memory, OOP)", done: true },
          { name: "Discrete Mathematics & Logic", done: true },
          { name: "Git & Linux Terminal commands", done: true },
          { name: "Solve 50 Easy questions on LeetCode / GFG", done: false }
        ]
      },
      {
        sem: "Sem 3-4: Core DSA & CS Fundamentals",
        items: [
          { name: "Data Structures (Trees, Graphs, Tries, Heaps)", done: false },
          { name: "Operating Systems (Processes, Paging, Concurrency)", done: false },
          { name: "DBMS & SQL Normalization", done: false },
          { name: "Solve 150 LeetCode Mediums (Striver SDE Sheet)", done: false }
        ]
      },
      {
        sem: "Sem 5-6: Advanced & Projects",
        items: [
          { name: "Computer Networks & Sockets", done: false },
          { name: "Low-Level Design (Design Patterns, SOLID)", done: false },
          { name: "Build 2 Production-Grade Full Stack / Distributed Projects", done: false },
          { name: "Participate in Codeforces / LeetCode Contests (Target: 1600+)", done: false }
        ]
      },
      {
        sem: "Sem 7-8: Interview Prep & Placements",
        items: [
          { name: "High-Level System Design (Caching, Sharding, Load Balancers)", done: false },
          { name: "Mock Technical & Whiteboard Interviews", done: false },
          { name: "Placement Resume ATS Polish & HR Behavioral Prep", done: false }
        ]
      }
    ]
  },
  {
    id: "aiml",
    title: "AI & Machine Learning / Data Science Engineer",
    description: "Deep learning mathematical foundations, PyTorch, LLM agents, and MLOps deployment.",
    semesters: [
      {
        sem: "Sem 1-2: Math & Python",
        items: [
          { name: "Linear Algebra (Eigenvalues, SVD, Vectors)", done: true },
          { name: "Multivariate Calculus & Probability/Statistics", done: true },
          { name: "Python for Data Science (NumPy, Pandas, Matplotlib)", done: false }
        ]
      },
      {
        sem: "Sem 3-4: Classic ML & Preprocessing",
        items: [
          { name: "Scikit-Learn (Linear/Logistic, Decision Trees, SVM, KNN)", done: false },
          { name: "Feature Engineering & Data Cleaning", done: false },
          { name: "SQL for Big Data & Analytics", done: false }
        ]
      },
      {
        sem: "Sem 5-6: Deep Learning & NLP/CV",
        items: [
          { name: "PyTorch Framework & Neural Networks", done: false },
          { name: "CNNs for Computer Vision & Transformers for NLP", done: false },
          { name: "LLM Fine-tuning, RAG (Retrieval-Augmented Generation)", done: false }
        ]
      },
      {
        sem: "Sem 7-8: MLOps & Capstone",
        items: [
          { name: "Deploy Models with FastAPI & Docker", done: false },
          { name: "MLflow / Weights & Biases tracking", done: false },
          { name: "Publish research paper or open-source Hugging Face model", done: false }
        ]
      }
    ]
  },
  {
    id: "fullstack",
    title: "Full Stack Web & Cloud Architect",
    description: "Modern React/Next.js frontends, scalable Node.js/Go backends, Docker, and AWS/GCP deployments.",
    semesters: [
      {
        sem: "Sem 1-2: Web Basics",
        items: [
          { name: "HTML5, Modern CSS3, Flexbox & Tailwind CSS", done: true },
          { name: "JavaScript ES6+ (Async/Await, Closures, DOM)", done: true },
          { name: "Git, GitHub & Deployment on Vercel/Netlify", done: true }
        ]
      },
      {
        sem: "Sem 3-4: Modern Frontend & APIs",
        items: [
          { name: "React.js (Hooks, State Management, Router)", done: false },
          { name: "TypeScript for enterprise frontend & backend", done: false },
          { name: "Node.js & Express.js REST API creation", done: false },
          { name: "PostgreSQL / MongoDB schema design", done: false }
        ]
      },
      {
        sem: "Sem 5-6: Full Stack & Cloud",
        items: [
          { name: "Next.js App Router (SSR, Server Actions)", done: false },
          { name: "Docker containers & Docker Compose", done: false },
          { name: "Redis Caching & Message Queues (Kafka/RabbitMQ)", done: false },
          { name: "Authentication (JWT, OAuth, NextAuth)", done: false }
        ]
      },
      {
        sem: "Sem 7-8: Scalability & Production",
        items: [
          { name: "CI/CD with GitHub Actions", done: false },
          { name: "Kubernetes, AWS ECS/S3/EC2 or GCP Cloud Run", done: false },
          { name: "End-to-End Testing (Playwright/Jest)", done: false }
        ]
      }
    ]
  }
];

export const SEMESTER_SUBJECTS = {
  1: [
    { code: "MA101", name: "Engineering Mathematics - I", credits: 4, type: "Theory" },
    { code: "PH101", name: "Engineering Physics", credits: 4, type: "Theory" },
    { code: "CS101", name: "Programming in C", credits: 3, type: "Theory" },
    { code: "CS102P", name: "C Programming Lab", credits: 1.5, type: "Practical" },
    { code: "EE101", name: "Basic Electrical Engineering", credits: 3, type: "Theory" }
  ],
  2: [
    { code: "MA102", name: "Engineering Mathematics - II", credits: 4, type: "Theory" },
    { code: "EC101", name: "Digital Electronics", credits: 3, type: "Theory" },
    { code: "CS201", name: "Object Oriented Programming (C++/Java)", credits: 3, type: "Theory" },
    { code: "CS202P", name: "OOP Lab", credits: 1.5, type: "Practical" },
    { code: "ME101", name: "Engineering Mechanics / Workshop", credits: 3, type: "Theory" }
  ],
  3: [
    { code: "CS301", name: "Data Structures & Algorithms", credits: 4, type: "Theory" },
    { code: "CS302P", name: "DSA Lab", credits: 2, type: "Practical" },
    { code: "CS303", name: "Discrete Mathematical Structures", credits: 3, type: "Theory" },
    { code: "CS304", name: "Computer Organization & Architecture", credits: 3, type: "Theory" },
    { code: "EC305", name: "Microprocessors & Interfacing", credits: 3, type: "Theory" }
  ],
  4: [
    { code: "CS401", name: "Operating Systems", credits: 4, type: "Theory" },
    { code: "CS402P", name: "Operating Systems & Linux Shell Lab", credits: 2, type: "Practical" },
    { code: "CS403", name: "Database Management Systems (DBMS)", credits: 4, type: "Theory" },
    { code: "CS404P", name: "DBMS Lab (SQL & PL/SQL)", credits: 1.5, type: "Practical" },
    { code: "CS405", name: "Design & Analysis of Algorithms", credits: 3, type: "Theory" }
  ],
  5: [
    { code: "CS501", name: "Computer Networks", credits: 4, type: "Theory" },
    { code: "CS502P", name: "Networks & Socket Programming Lab", credits: 1.5, type: "Practical" },
    { code: "CS503", name: "Theory of Computation & Automata", credits: 3, type: "Theory" },
    { code: "CS504", name: "Software Engineering & Agile", credits: 3, type: "Theory" },
    { code: "CS505", name: "Artificial Intelligence & ML", credits: 3, type: "Theory" }
  ],
  6: [
    { code: "CS601", name: "Compiler Design", credits: 3, type: "Theory" },
    { code: "CS602", name: "Cloud Computing & Distributed Systems", credits: 3, type: "Theory" },
    { code: "CS603", name: "Information & Cyber Security", credits: 3, type: "Theory" },
    { code: "CS604P", name: "Mini Project (Full Stack / AI)", credits: 3, type: "Practical" },
    { code: "CS605", name: "Open Elective (Internet of Things / DevOps)", credits: 3, type: "Theory" }
  ],
  7: [
    { code: "CS701", name: "High Performance Computing / Big Data", credits: 3, type: "Theory" },
    { code: "CS702", name: "Deep Learning & Neural Networks", credits: 3, type: "Theory" },
    { code: "CS703P", name: "Major Project - Phase 1", credits: 4, type: "Practical" },
    { code: "CS704", name: "Industrial Training / Summer Internship", credits: 2, type: "Practical" }
  ],
  8: [
    { code: "CS801P", name: "Major Project - Phase 2 & Defense", credits: 8, type: "Practical" },
    { code: "CS802", name: "Professional Ethics & IPR", credits: 2, type: "Theory" },
    { code: "CS803", name: "Campus Placement / Corporate Readiness", credits: 2, type: "Practical" }
  ]
};

export const SAMPLE_NOTES = {
  osVirtualMemory: `Topic: Virtual Memory, Demand Paging, and Page Replacement Algorithms
Instructor: Prof. Sharma | Department of CSE

1. Concept of Virtual Memory:
Virtual memory decouples the user logical memory from physical physical RAM. This permits the execution of processes whose address requirements exceed physical RAM.
Only portions of a process currently required for execution are retained in physical memory.

2. Demand Paging & Page Fault Mechanism:
- A page is brought into memory only when an explicit reference is made to it (Demand Paging).
- When a referenced page is not present in RAM, a hardware trap known as a "Page Fault" is triggered.
- Page Fault Service Steps:
  1. Operating system traps the execution and saves user registers.
  2. Operating system checks internal tables to verify whether access was valid.
  3. Locates a free frame on RAM (or triggers page replacement if all frames occupied).
  4. Initiates a disk I/O request to fetch the page into allocated physical frame.
  5. Updates internal Page Table (sets valid-invalid bit to 1).
  6. Restarts the interrupted instruction transparently.

3. Page Replacement Algorithms:
- FIFO: Suffers from Belady's Anomaly (more frames -> more page faults).
- LRU (Least Recently Used): Replaces page not referenced for longest time. Optimal in practice; implemented via Stack or Counter.
- Optimal (OPT): Replaces page that will not be referenced for longest future interval. Theoretical benchmark (cannot be implemented online).
- Working Set Model: Prevents Thrashing by ensuring process working set size fits in memory.`,

  dbmsNormalization: `Topic: Functional Dependencies and Relational Normalization (1NF to BCNF)
Subject: Database Management Systems

1. Database Anomalies in Unnormalized Relations:
- Update Anomaly: Inconsistent data when redundant values are partially updated.
- Insertion Anomaly: Inability to record certain facts without adding unnecessary dummy data.
- Deletion Anomaly: Unintended loss of crucial information upon deleting a record.

2. Functional Dependency (FD):
Given relation R, attribute Y is functionally dependent on X (X -> Y) if each value of X is associated with exactly one value of Y.
- Trivial FD: If Y is a subset of X (e.g. {A, B} -> A).
- Non-trivial FD: If Y is not a subset of X.

3. Canonical Normal Forms:
1NF: Every attribute contains only atomic (scalar) values. Multivalued attributes and nested relations are disallowed.
2NF: Table must be in 1NF and free of Partial Dependencies. Every non-prime attribute must be fully functionally dependent on the primary key.
3NF: Table must be in 2NF and free of Transitive Dependencies. For any X -> Y, X is a super key or Y is a prime attribute.
BCNF (Boyce-Codd): For EVERY functional dependency X -> Y, X MUST be a candidate/super key. Strictly avoids redundancy.`,

  dsaTrees: `Topic: Binary Search Trees (BST) and Self-Balancing AVL Trees
Subject: Data Structures & Algorithms

1. Binary Search Tree (BST) Properties:
- For every node N, all keys in Left Subtree(N) < Key(N).
- All keys in Right Subtree(N) > Key(N).
- Inorder traversal of BST yields keys in strictly ascending sorted order.
- Time Complexities:
  - Average Case (balanced): Search, Insert, Delete = O(log N)
  - Worst Case (skewed list): Search, Insert, Delete = O(N)

2. Self-Balancing AVL Trees:
An AVL tree enforces a balance invariant:
Balance Factor = Height(Left Subtree) - Height(Right Subtree) in {-1, 0, +1}.
If an insertion causes balance factor to equal +2 or -2, tree is rebalanced using single or double rotations:
- Left-Left (LL) Heavy -> Single Right Rotation
- Right-Right (RR) Heavy -> Single Left Rotation
- Left-Right (LR) Heavy -> Left Rotation on child, then Right Rotation on node
- Right-Left (RL) Heavy -> Right Rotation on child, then Left Rotation on node
Guarantees strict O(log N) worst-case time for all operations.`
};
