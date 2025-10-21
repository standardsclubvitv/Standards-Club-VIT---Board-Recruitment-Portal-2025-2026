const { MongoClient, ObjectId } = require('mongodb');

// Position data with domain-specific questions (questions shown only in the form, not in position cards)
const POSITIONS_DATA = [
  {
    id: 1,
    name: "Chairperson",
    description: "Oversees all club activities and strategic planning. The Chairperson is the face of Standards Club and represents the organization in all official matters.",
    responsibilities: [
      "Oversees all club activities and strategic planning",
      "Represents club in official institutional matters",
      "Makes final decisions on major initiatives and policies",
      "Leads board meetings and coordinates all departments",
      "Ensures alignment with club's mission and vision"
    ],
    requiredSkills: ["Leadership", "Communication", "Decision-making", "Time management", "Strategic thinking"],
    domainQuestions: [
      "Describe your leadership style and how you would handle conflicts within the team.",
      "What is your vision for Standards Club for 2025-2026? Include at least 3 specific goals.",
      "How would you manage multiple departments simultaneously while ensuring effective communication?"
    ]
  },
  {
    id: 2,
    name: "Vice Chairperson",
    description: "Supports Chairperson and assumes responsibilities when needed. Acts as a bridge between leadership and execution teams.",
    responsibilities: [
      "Supports Chairperson and assumes responsibilities when needed",
      "Coordinates between different department heads",
      "Assists in event management and coordination",
      "Manages contingencies and backup planning",
      "Represents Chairperson in official meetings"
    ],
    requiredSkills: ["Leadership", "Coordination", "Problem-solving", "Diplomacy", "Adaptability"],
    domainQuestions: [
      "How would you support the Chairperson while maintaining your own leadership identity?",
      "Describe a situation where you had to step up and take charge unexpectedly.",
      "How would you coordinate between departments with conflicting priorities?"
    ]
  },
  {
    id: 3,
    name: "Secretary",
    description: "Maintains event reports and registration records. The organizational backbone of the club ensuring all documentation is accurate and accessible.",
    responsibilities: [
      "Maintains event reports and registration records",
      "Documents meeting minutes and official correspondences",
      "Manages applications and member records",
      "Publishes official announcements",
      "Archives and organizes club documentation"
    ],
    requiredSkills: ["Organization", "Documentation", "Attention to detail", "Communication", "Time management"],
    domainQuestions: [
      "Describe your experience with documentation and record-keeping systems.",
      "How would you organize and manage multiple simultaneous event reports?",
      "What digital tools would you use to streamline documentation processes?"
    ]
  },
  {
    id: 4,
    name: "Co Secretary",
    description: "Assists Secretary in all administrative tasks and bridges the gap between documentation and operational requirements.",
    responsibilities: [
      "Assists Secretary in all administrative tasks",
      "Manages event requisition and approval process",
      "Coordinates between different departments",
      "Maintains event timelines and checklists",
      "Backs up Secretary in documentation"
    ],
    requiredSkills: ["Organization", "Coordination", "Multitasking", "Technical aptitude", "Communication"],
    domainQuestions: [
      "How would you prioritize multiple administrative tasks with tight deadlines?",
      "Describe your experience with requisition and approval workflows.",
      "How would you coordinate between administrative and technical teams?"
    ]
  },
  {
    id: 5,
    name: "Technical Head",
    description: "Leads technical initiatives and oversees all technology-related projects and workshops. Ensures technical excellence in all club activities.",
    responsibilities: [
      "Plans and executes technical workshops and events",
      "Manages technical resources and equipment",
      "Coordinates with speakers and mentors for technical sessions",
      "Oversees technical project development",
      "Mentors members in technical skills"
    ],
    requiredSkills: ["Technical expertise", "Problem-solving", "Teaching", "Project management", "Innovation"],
    domainQuestions: [
      "What technical workshops or projects would you propose for Standards Club?",
      "Describe your experience with organizing technical events or hackathons.",
      "How would you make technical content accessible to beginners while engaging advanced learners?"
    ]
  },
  {
    id: 6,
    name: "Creative Head",
    description: "Leads all creative initiatives and content creation for the club. Brings innovative ideas to life through visual and written content.",
    responsibilities: [
      "Develops creative concepts for events and campaigns",
      "Oversees content creation for social media",
      "Manages creative team and brainstorming sessions",
      "Ensures brand consistency across all materials",
      "Coordinates with design team for visual content"
    ],
    requiredSkills: ["Creativity", "Content creation", "Visual thinking", "Team leadership", "Brand management"],
    domainQuestions: [
      "Share your creative portfolio or past creative projects you've worked on.",
      "How would you develop a creative campaign to increase club engagement?",
      "Describe your process for generating and executing creative ideas."
    ]
  },
  {
    id: 7,
    name: "Design Head",
    description: "Manages all visual design aspects of the club including posters, graphics, and branding materials. Creates stunning visuals that represent Standards Club.",
    responsibilities: [
      "Designs posters, banners, and promotional materials",
      "Maintains visual brand identity and guidelines",
      "Creates graphics for social media and events",
      "Manages design team and delegates tasks",
      "Ensures timely delivery of design assets"
    ],
    requiredSkills: ["Graphic design", "Adobe Creative Suite", "UI/UX", "Creativity", "Time management"],
    domainQuestions: [
      "Share your design portfolio (provide link to Behance, Dribbble, or Google Drive).",
      "What design tools and software are you proficient in?",
      "How would you maintain design consistency across different platforms and materials?"
    ]
  },
  {
    id: 8,
    name: "Events Head",
    description: "Plans and executes all club events from conception to completion. Ensures every event is memorable and runs smoothly.",
    responsibilities: [
      "Plans and coordinates all club events",
      "Manages event logistics and vendor coordination",
      "Oversees event budget and resource allocation",
      "Coordinates with venue management and permissions",
      "Ensures smooth execution on event day"
    ],
    requiredSkills: ["Event management", "Logistics", "Budgeting", "Negotiation", "Crisis management"],
    domainQuestions: [
      "Describe the largest event you've organized and the challenges you faced.",
      "How would you plan a flagship event for Standards Club with limited budget?",
      "What strategies would you use to ensure high attendance and engagement?"
    ]
  },
  {
    id: 9,
    name: "Management Head",
    description: "Oversees operational efficiency and resource management. Ensures all departments work cohesively towards common goals.",
    responsibilities: [
      "Manages overall operational efficiency",
      "Coordinates resource allocation across departments",
      "Develops standard operating procedures",
      "Monitors project timelines and deliverables",
      "Facilitates inter-departmental communication"
    ],
    requiredSkills: ["Operations management", "Strategic planning", "Coordination", "Leadership", "Analytics"],
    domainQuestions: [
      "How would you improve operational efficiency in a student-run organization?",
      "Describe your experience with project management and team coordination.",
      "What metrics would you use to measure the success of club operations?"
    ]
  },
  {
    id: 10,
    name: "Projects Head",
    description: "Leads club projects from ideation to completion. Ensures projects align with club goals and deliver value to members.",
    responsibilities: [
      "Identifies and proposes new project ideas",
      "Manages project timelines and milestones",
      "Coordinates project teams and resources",
      "Tracks project progress and documentation",
      "Ensures project quality and successful completion"
    ],
    requiredSkills: ["Project management", "Technical skills", "Team leadership", "Problem-solving", "Documentation"],
    domainQuestions: [
      "Propose a project idea for Standards Club and outline its implementation plan.",
      "Describe your experience with managing technical or community projects.",
      "How would you handle a project that's falling behind schedule?"
    ]
  },
  {
    id: 11,
    name: "HR Head",
    description: "Manages member relations, recruitment, and team culture. Creates an inclusive and engaging environment for all members.",
    responsibilities: [
      "Manages recruitment and onboarding processes",
      "Handles member relations and grievances",
      "Organizes team-building activities",
      "Coordinates guest hospitality and MC duties",
      "Ensures positive team culture and engagement"
    ],
    requiredSkills: ["Interpersonal skills", "Empathy", "Communication", "Conflict resolution", "Event coordination"],
    domainQuestions: [
      "How would you handle a conflict between two team members?",
      "Describe your approach to making new members feel welcome and included.",
      "What team-building activities would you organize to strengthen club bonds?"
    ]
  },
  {
    id: 12,
    name: "Outreach Head",
    description: "Builds external relationships and partnerships. Represents Standards Club in collaborations and sponsorship discussions.",
    responsibilities: [
      "Develops partnerships with other clubs and organizations",
      "Manages sponsorship outreach and negotiations",
      "Coordinates collaboration events",
      "Builds relationships with industry professionals",
      "Expands club's external network"
    ],
    requiredSkills: ["Networking", "Communication", "Negotiation", "Relationship building", "Professional etiquette"],
    domainQuestions: [
      "How would you approach potential sponsors or partners for the club?",
      "Describe your experience with networking and building professional relationships.",
      "What strategies would you use to establish collaborations with other organizations?"
    ]
  },
  {
    id: 13,
    name: "Editorial Head",
    description: "Manages all written content and publications for the club. Ensures high-quality, engaging content across all platforms.",
    responsibilities: [
      "Oversees blog posts, newsletters, and articles",
      "Manages editorial calendar and content strategy",
      "Edits and proofreads all written materials",
      "Coordinates with content creators and writers",
      "Maintains content quality standards"
    ],
    requiredSkills: ["Writing", "Editing", "Content strategy", "Attention to detail", "Creativity"],
    domainQuestions: [
      "Share samples of your writing or editorial work (provide links).",
      "How would you develop a content strategy to increase club visibility?",
      "Describe your editing process and how you ensure content quality."
    ]
  },
  {
    id: 14,
    name: "Finance Head",
    description: "Manages club finances, budgeting, and financial planning. Ensures financial transparency and responsible resource utilization.",
    responsibilities: [
      "Manages club budget and financial planning",
      "Tracks expenses and maintains financial records",
      "Prepares financial reports and statements",
      "Handles sponsorship funds and reimbursements",
      "Ensures financial compliance and transparency"
    ],
    requiredSkills: ["Financial management", "Budgeting", "Excel/Accounting software", "Analytical thinking", "Responsibility"],
    domainQuestions: [
      "Describe your experience with budgeting and financial management.",
      "How would you create and manage a budget for a large-scale event?",
      "What measures would you implement to ensure financial transparency?"
    ]
  },
  {
    id: 15,
    name: "Publicity Head",
    description: "Manages social media presence and promotional campaigns. Amplifies club activities and increases engagement across platforms.",
    responsibilities: [
      "Manages social media accounts and posting schedule",
      "Develops promotional strategies for events",
      "Tracks social media analytics and engagement",
      "Coordinates with design team for promotional content",
      "Increases club visibility and follower base"
    ],
    requiredSkills: ["Social media marketing", "Content creation", "Analytics", "Copywriting", "Trend awareness"],
    domainQuestions: [
      "How would you increase Standards Club's social media following and engagement?",
      "Describe a successful social media campaign you've run or observed.",
      "What metrics would you track to measure publicity success?"
    ]
  },
  {
    id: 16,
    name: "Development Head",
    description: "Manages website development and technical infrastructure. Ensures club's digital presence is modern, functional, and user-friendly.",
    responsibilities: [
      "Maintains and updates club website",
      "Develops web applications and digital tools",
      "Manages technical infrastructure and hosting",
      "Implements new features and improvements",
      "Provides technical support for digital initiatives"
    ],
    requiredSkills: ["Web development", "Programming", "Database management", "Problem-solving", "DevOps"],
    domainQuestions: [
      "Share your development portfolio or GitHub profile (provide link).",
      "What technologies would you use to improve the club's website?",
      "Describe a web project you've built and the technical challenges you overcame."
    ]
  }
];

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Return positions data (without domain questions for position cards - they'll be shown only in the form)
    const positionsForDisplay = POSITIONS_DATA.map(pos => ({
      id: pos.id,
      name: pos.name,
      description: pos.description,
      responsibilities: pos.responsibilities,
      requiredSkills: pos.requiredSkills
    }));

    return res.status(200).json({
      success: true,
      positions: positionsForDisplay,
      allPositions: POSITIONS_DATA, // Full data with questions for form generation
      totalPositions: POSITIONS_DATA.length,
      recruitmentYear: "2025-2026"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch positions',
      error: error.message
    });
  }
};
