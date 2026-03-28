/* ========================================
   AI Data Center Learning Dashboard - JS
   ======================================== */

// --- State ---
const DC_STORAGE_KEY = 'dcLearningState_v1';

let dcState = {
    tasks: {},           // { 'w1-d1-t0': true, ... }
    resourceStatus: {},  // { 'res-0': 'not-started', ... }
    timer: { total: 0, running: false, start: null },
    design: {
        siteName: '',
        location: '',
        totalMW: 10,
        redundancy: 'n+1',
        coolingType: 'dlc',
        gpuModel: 'h100',
        gpuCount: 512,
        tierLevel: 3,
        notes: ''
    },
    expandedWeeks: {},
    expandedSteps: {},
    activeSubtab: 'roadmap'
};

function loadDCState() {
    try {
        const saved = localStorage.getItem(DC_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            dcState = { ...dcState, ...parsed, timer: { ...dcState.timer, ...parsed.timer, running: false, start: null } };
        }
    } catch (e) { /* ignore */ }
}

function saveDCState() {
    try {
        localStorage.setItem(DC_STORAGE_KEY, JSON.stringify(dcState));
    } catch (e) { /* ignore */ }
}

// --- Curriculum Data ---
const DC_CURRICULUM = [
    {
        week: 1, title: 'Power Systems', topic: 'The Foundation of Every Data Center',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Read Schneider WP 110 - sections on power infrastructure', tag: 'read' },
                { text: 'Study NVIDIA H100 power specs (10.2kW/system, 1.32MW/SuperPOD)', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'Learn MW, kW, UPS, PDU, switchgear, generators terminology', tag: 'read' },
                { text: 'Watch YouTube: Data center power distribution walkthrough', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Study single-line diagrams for DC power', tag: 'read' },
                { text: 'Learn N+1, 2N, 2(N+1) redundancy schemes', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Use Power Calculator to size a 10MW AI DC', tag: 'hands-on' },
                { text: 'Calculate transformer, UPS, and generator quantities', tag: 'calc' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'Draw a single-line electrical diagram for your DC design', tag: 'hands-on' },
                { text: 'Compare utility power costs across regions', tag: 'calc' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'TEACH: Record/explain DC power to a friend in 5 minutes', tag: 'teach' }
            ]}
        ]
    },
    {
        week: 2, title: 'Cooling Architecture', topic: 'The #1 Challenge for AI Data Centers',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Read Schneider WP 133 - Liquid Cooling Architectures', tag: 'read' },
                { text: 'Study ASHRAE thermal guidelines (A1-A4 classes)', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'Study NVIDIA GB200 cooling: liquid compute + air network', tag: 'read' },
                { text: 'Learn CDU, DLC, immersion cooling, cold plates', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Learn PUE calculation and optimization strategies', tag: 'read' },
                { text: 'Study hot/cold aisle containment design', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Use Cooling Calculator for your 10MW DC', tag: 'hands-on' },
                { text: 'Size CDUs, chillers, and cooling towers', tag: 'calc' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'Build comparison matrix: Air vs DLC vs Immersion', tag: 'hands-on' },
                { text: 'Calculate water usage for cooling (L/kW)', tag: 'calc' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'TEACH: Explain why AI needs liquid cooling', tag: 'teach' }
            ]}
        ]
    },
    {
        week: 3, title: 'Network & Compute', topic: 'GPU Clusters and High-Speed Fabric',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Study NVIDIA SuperPOD architecture (Scalable Units)', tag: 'read' },
                { text: 'Learn spine-leaf and rail-optimized topologies', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'InfiniBand vs Ethernet: RDMA, RoCEv2, bandwidth', tag: 'read' },
                { text: 'Study 400G/800G network switch specifications', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Compare H100 (4/rack, 40.8kW) vs GB200 (18 trays, 120kW)', tag: 'read' },
                { text: 'Study storage tiers: NVMe-oF, Lustre, GPFS', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Layout 32 racks with 50m cable constraint', tag: 'hands-on' },
                { text: 'Use Rack Calculator to configure your GPU cluster', tag: 'calc' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'Design network topology for your 10MW DC', tag: 'hands-on' },
                { text: 'Calculate total fiber and copper cable requirements', tag: 'calc' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'TEACH: Draw SuperPOD architecture from memory', tag: 'teach' }
            ]}
        ]
    },
    {
        week: 4, title: 'Physical Design & Reliability', topic: 'Floor Plans, Tiers, and Redundancy',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Study Uptime Institute Tier I-IV standards', tag: 'read' },
                { text: 'Read Schneider WP 147 - Reference Designs', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'Learn concurrent maintainability vs fault tolerance', tag: 'read' },
                { text: 'Study fire suppression: clean agent, pre-action sprinkler', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Floor loading (2,500-5,000 lbs/sqft), ceiling height, raised floor', tag: 'read' },
                { text: 'Physical security: mantrap, CCTV, biometric access', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Design your DC with Tier III redundancy', tag: 'hands-on' },
                { text: 'Create floor plan with electrical and mechanical rooms', tag: 'hands-on' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'ASHRAE compliance check for your design', tag: 'calc' },
                { text: 'Site selection analysis: power, water, fiber, climate', tag: 'hands-on' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'TEACH: Present your complete DC floor plan', tag: 'teach' }
            ]}
        ]
    },
    {
        week: 5, title: 'Project Management & Construction', topic: 'From Blueprint to Reality',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Study DC construction phases: site prep through commissioning', tag: 'read' },
                { text: 'Learn critical path: utility (12-36mo), switchgear (12-18mo)', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'Modular/prefab vs traditional stick-built construction', tag: 'read' },
                { text: 'Study commissioning: IST, load bank testing, failover tests', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Learn CAPEX budgeting: $10-15M per MW for AI DC', tag: 'read' },
                { text: 'Study OPEX: staffing, power costs, maintenance', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Build Gantt chart for your 10MW DC project', tag: 'hands-on' },
                { text: 'Create budget breakdown using the Budget Calculator', tag: 'calc' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'Risk management matrix for your project', tag: 'hands-on' },
                { text: 'Contractor selection and procurement strategy', tag: 'hands-on' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'TEACH: Present project plan with timeline + budget', tag: 'teach' }
            ]}
        ]
    },
    {
        week: 6, title: 'Integration & Certification', topic: 'Bringing It All Together',
        days: [
            { day: 'Monday', tasks: [
                { text: 'Review all designs and fill knowledge gaps', tag: 'read' },
                { text: 'Start BICSI TDMM Data Center Design chapters', tag: 'read' }
            ]},
            { day: 'Tuesday', tasks: [
                { text: 'Practice RCDD/DCDC sample questions', tag: 'read' },
                { text: 'Study emerging: nuclear power, 1MW racks, waterless cooling', tag: 'read' }
            ]},
            { day: 'Wednesday', tasks: [
                { text: 'Sustainability: LEED, carbon-neutral, waste heat reuse', tag: 'read' },
                { text: 'AI-driven DC operations (Google DeepMind cooling)', tag: 'read' }
            ]},
            { day: 'Thursday', tasks: [
                { text: 'HANDS-ON: Finalize your complete 10MW AI DC design', tag: 'hands-on' },
                { text: 'Cross-check all calculations and specifications', tag: 'calc' }
            ]},
            { day: 'Friday', tasks: [
                { text: 'Create executive summary of your DC design', tag: 'hands-on' },
                { text: 'Prepare presentation/portfolio piece', tag: 'hands-on' }
            ]},
            { day: 'Saturday', tasks: [
                { text: 'FINAL: Record full walkthrough of your DC design', tag: 'teach' }
            ]}
        ]
    }
];

// --- Resources Data ---
const DC_RESOURCE_CATEGORIES = [
    {
        "id": "power",
        "name": "Power Infrastructure",
        "icon": "⚡",
        "color": "#F59E0B"
    },
    {
        "id": "cooling",
        "name": "Cooling Systems",
        "icon": "❄️",
        "color": "#06B6D4"
    },
    {
        "id": "compute",
        "name": "Compute & GPU",
        "icon": "🖥️",
        "color": "#8B5CF6"
    },
    {
        "id": "network",
        "name": "Network Infrastructure",
        "icon": "🔗",
        "color": "#3B82F6"
    },
    {
        "id": "storage",
        "name": "Storage Systems",
        "icon": "💾",
        "color": "#6366F1"
    },
    {
        "id": "fire",
        "name": "Fire Protection",
        "icon": "🧯",
        "color": "#EF4444"
    },
    {
        "id": "security",
        "name": "Physical Security",
        "icon": "🔒",
        "color": "#64748B"
    },
    {
        "id": "bms",
        "name": "Building Management (BMS)",
        "icon": "🏛️",
        "color": "#14B8A6"
    },
    {
        "id": "dcim",
        "name": "DCIM & Software",
        "icon": "📊",
        "color": "#A855F7"
    },
    {
        "id": "tier",
        "name": "Tier Standards & Reliability",
        "icon": "🏆",
        "color": "#F97316"
    },
    {
        "id": "construction",
        "name": "Construction & PM",
        "icon": "🚧",
        "color": "#84CC16"
    },
    {
        "id": "sustainability",
        "name": "Sustainability & ESG",
        "icon": "🌿",
        "color": "#22C55E"
    }
];

const DC_RESOURCES = [
    {
        "id": "res-p1",
        "cat": "power",
        "title": "Schneider WP 110: AI Disruption of DC Power",
        "desc": "How 6 AI attributes change power architecture - density, reliability, scalability",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP110_EN/",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-p2",
        "cat": "power",
        "title": "Schneider Power Sizing Calculator",
        "desc": "Interactive tool: size transformers, UPS, generators, and PDUs for your DC",
        "url": "https://www.se.com/ww/en/work/solutions/data-centers-and-networks/trade-off-tools/data-center-power-sizing-calculator/",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-p3",
        "cat": "power",
        "title": "Schneider WP 1: UPS Topologies",
        "desc": "Understanding UPS types: standby, line-interactive, double-conversion",
        "url": "https://www.se.com/ww/en/download/document/SPD_VAVR-5WKLPK_EN/",
        "badge": "free",
        "week": 2
    },
    {
        "id": "res-p4",
        "cat": "power",
        "title": "Schneider WP 75: Power Distribution",
        "desc": "Comparison of AC vs DC power distribution in data centers",
        "url": "https://www.se.com/ww/en/download/document/SPD_NRAN-6CN8PL_EN/",
        "badge": "free",
        "week": 2
    },
    {
        "id": "res-p5",
        "cat": "power",
        "title": "NVIDIA DGX DC Power Planning",
        "desc": "Electrical requirements for DGX H100/GB200: ATS, busbar, PDU sizing",
        "url": "https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/planning.html",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-p6",
        "cat": "power",
        "title": "DC Busbar Power Distribution for AI",
        "desc": "Why AI DCs move from cable whips to overhead busbar (B300 architecture)",
        "url": "https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-b300/latest/dgx-superpod-architecture.html",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-c1",
        "cat": "cooling",
        "title": "Schneider WP 133: Liquid Cooling for AI",
        "desc": "Navigating liquid cooling architectures - DLC, rear-door, immersion",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP133_EN/",
        "badge": "free",
        "week": 2
    },
    {
        "id": "res-c2",
        "cat": "cooling",
        "title": "ASHRAE TC 9.9: Thermal Guidelines",
        "desc": "Temperature and humidity ranges for IT equipment (A1-A4 classes)",
        "url": "https://www.ashrae.org/technical-resources/bookstore/datacom-series",
        "badge": "paid",
        "week": 2
    },
    {
        "id": "res-c3",
        "cat": "cooling",
        "title": "Schneider WP 59: Economizer Modes",
        "desc": "Free cooling using outside air and water-side economization",
        "url": "https://www.se.com/ww/en/download/document/SPD_NRAN-7EDSXN_EN/",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-c4",
        "cat": "cooling",
        "title": "Schneider AI DC Design: Cooling Impact",
        "desc": "How 70-120kW/rack densities force shift from air to liquid cooling",
        "url": "https://www.se.com/ww/en/insights/ai-and-technology/artificial-intelligence/how-six-ai-attributes-are-changing-the-rules-of-data-center-design/",
        "badge": "free",
        "week": 2
    },
    {
        "id": "res-c5",
        "cat": "cooling",
        "title": "NVIDIA GB200 Liquid Cooling Requirements",
        "desc": "CDU specs, flow rates, and coolant requirements for GB200 NVL72",
        "url": "https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-architecture.html",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-g1",
        "cat": "compute",
        "title": "NVIDIA DGX H100 DC Design Guide",
        "desc": "Complete facility design guide for DGX H100 SuperPOD deployment",
        "url": "https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/index.html",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-g2",
        "cat": "compute",
        "title": "NVIDIA DGX H100 SuperPOD Ref Arch",
        "desc": "Scalable unit architecture, network topology, rack layout specs",
        "url": "https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-h100/latest/dgx-superpod-architecture.html",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-g3",
        "cat": "compute",
        "title": "NVIDIA DGX GB200 Reference Architecture",
        "desc": "Grace+Blackwell NVL72: 1.2MW per SU, liquid cooled, 72 GPUs per rack",
        "url": "https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-architecture.html",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-g4",
        "cat": "compute",
        "title": "NVIDIA DGX B300 Architecture",
        "desc": "Blackwell B300: DC busbar power, Spectrum-4 Ethernet, liquid cooled",
        "url": "https://docs.nvidia.com/dgx-superpod/reference-architecture/scalable-infrastructure-b300/latest/dgx-superpod-architecture.html",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-g5",
        "cat": "compute",
        "title": "NVIDIA DGX SuperPOD Product Overview",
        "desc": "Overview of DGX SuperPOD AI infrastructure for enterprise deployment",
        "url": "https://www.nvidia.com/en-us/data-center/dgx-superpod/",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-n1",
        "cat": "network",
        "title": "NVIDIA InfiniBand for AI: Architecture Guide",
        "desc": "InfiniBand NDR/XDR topology, cable distance limits, switch hierarchy",
        "url": "https://docs.nvidia.com/networking/",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-n2",
        "cat": "network",
        "title": "Schneider WP 220: Network Cabling for AI DC",
        "desc": "Structured cabling considerations for high-density AI compute racks",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP220_EN/",
        "badge": "free",
        "week": 3
    },
    {
        "id": "res-n3",
        "cat": "network",
        "title": "NVIDIA Spectrum-X Ethernet for AI",
        "desc": "Ethernet alternative to InfiniBand with adaptive routing and RoCE",
        "url": "https://www.nvidia.com/en-us/networking/spectrumx/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-n4",
        "cat": "network",
        "title": "BICSI TDMM: Telecom Distribution Methods",
        "desc": "Industry standard for structured cabling, pathways, and spaces design",
        "url": "https://www.bicsi.org/education-certification/education/books/tdmm",
        "badge": "paid",
        "week": 4
    },
    {
        "id": "res-s1",
        "cat": "storage",
        "title": "NVIDIA DGX Storage Architecture",
        "desc": "Parallel file systems for AI training: GPFS, Lustre, WEKA integration",
        "url": "https://docs.nvidia.com/dgx-superpod/design-guides/dgx-superpod-data-center-design-h100/latest/storage.html",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-s2",
        "cat": "storage",
        "title": "Schneider WP 166: Edge and Core Storage",
        "desc": "Storage tier design: NVMe all-flash, hybrid, and cold storage strategies",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP166_EN/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-f1",
        "cat": "fire",
        "title": "NFPA 75: Fire Protection for IT Equipment",
        "desc": "Standard for fire protection in data centers - detection, suppression, prevention",
        "url": "https://www.nfpa.org/codes-and-standards/nfpa-75-standard-development/75",
        "badge": "paid",
        "week": 5
    },
    {
        "id": "res-f2",
        "cat": "fire",
        "title": "Schneider WP 102: Fire Suppression Options",
        "desc": "Clean agent, water mist, and pre-action systems for DC environments",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP102_EN/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-f3",
        "cat": "fire",
        "title": "FM Global DS 5-32: Data Center Protection",
        "desc": "Insurance and risk engineering standards for DC fire protection",
        "url": "https://www.fmglobal.com/research-and-resources/fm-global-data-sheets",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-sec1",
        "cat": "security",
        "title": "Schneider WP 82: Physical Security for DC",
        "desc": "Layered security: perimeter, building, room, rack access controls",
        "url": "https://www.se.com/ww/en/download/document/SPD_NRAN-7FMLBJ_EN/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-sec2",
        "cat": "security",
        "title": "TIA-942: DC Telecommunications Infrastructure",
        "desc": "Physical security tiers and telecommunications room standards",
        "url": "https://tiaonline.org/what-we-do/standards/",
        "badge": "paid",
        "week": 5
    },
    {
        "id": "res-b1",
        "cat": "bms",
        "title": "Schneider EcoStruxure Building Operation",
        "desc": "Integrated BMS for DC: HVAC, lighting, power monitoring, alarms",
        "url": "https://www.se.com/ww/en/work/solutions/data-centers-and-networks/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-b2",
        "cat": "bms",
        "title": "Schneider WP 118: BMS vs DCIM Integration",
        "desc": "How BMS and DCIM systems work together for total facility management",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP118_EN/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-b3",
        "cat": "bms",
        "title": "BACnet Protocol for DC BMS",
        "desc": "Open protocol standard for building automation and control networks",
        "url": "https://www.bacnetinternational.org/page/aboutbacnet",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-d1",
        "cat": "dcim",
        "title": "Schneider WP 171: DCIM Software Benefits",
        "desc": "How DCIM improves capacity planning, energy monitoring, and operations",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP171_EN/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-d2",
        "cat": "dcim",
        "title": "NVIDIA Base Command Manager",
        "desc": "AI cluster orchestration, job scheduling, and GPU monitoring platform",
        "url": "https://www.nvidia.com/en-us/data-center/base-command/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-d3",
        "cat": "dcim",
        "title": "Schneider EcoStruxure IT Expert",
        "desc": "Cloud-based DCIM for remote monitoring, alerting, and analytics",
        "url": "https://www.se.com/ww/en/work/solutions/data-centers-and-networks/it-expert/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-t1",
        "cat": "tier",
        "title": "Uptime Institute: Tier Standard Overview",
        "desc": "Tier I-IV definitions: availability, redundancy, and maintainability requirements",
        "url": "https://uptimeinstitute.com/tiers",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-t2",
        "cat": "tier",
        "title": "Uptime Institute: Tier Certification Process",
        "desc": "Design Documents, Constructed Facility, and Operational Sustainability stages",
        "url": "https://uptimeinstitute.com/tier-certification",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-t3",
        "cat": "tier",
        "title": "Schneider WP 160: Tier Classification System",
        "desc": "Practical guide to selecting the right tier for your DC requirements",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP160_EN/",
        "badge": "free",
        "week": 1
    },
    {
        "id": "res-t4",
        "cat": "tier",
        "title": "BICSI DCDC Certification",
        "desc": "Data Center Design Consultant credential - DC-specific certification path",
        "url": "https://www.bicsi.org/education-certification/certification/dcdc",
        "badge": "paid",
        "week": 6
    },
    {
        "id": "res-pm1",
        "cat": "construction",
        "title": "Schneider WP 147: Reference Design Advantages",
        "desc": "Pre-validated DC blueprints reduce design time and construction risk",
        "url": "https://it-resource.schneider-electric.com/white-papers/wp-147-data-center-projects-advantages-of-using-a-reference-design",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-pm2",
        "cat": "construction",
        "title": "Schneider EcoStruxure Reference Designs",
        "desc": "Pre-validated DC blueprints with power, cooling, and rack configurations",
        "url": "https://www.se.com/ww/en/work/solutions/data-centers-and-networks/reference-designs/",
        "badge": "free",
        "week": 4
    },
    {
        "id": "res-pm3",
        "cat": "construction",
        "title": "Schneider WP 148: Prefabricated Modular DC",
        "desc": "Modular construction approach: faster deployment, predictable quality",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP148_EN/",
        "badge": "free",
        "week": 6
    },
    {
        "id": "res-pm4",
        "cat": "construction",
        "title": "Schneider WP 143: DC Project Management",
        "desc": "Critical path scheduling, commissioning process, and vendor coordination",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP143_EN/",
        "badge": "free",
        "week": 6
    },
    {
        "id": "res-pm5",
        "cat": "construction",
        "title": "BICSI RCDD Certification",
        "desc": "Registered Communications Distribution Designer - industry-leading ICT credential",
        "url": "https://www.bicsi.org/education-certification/certification/rcdd",
        "badge": "paid",
        "week": 6
    },
    {
        "id": "res-sus1",
        "cat": "sustainability",
        "title": "Schneider WP 114: PUE Best Practices",
        "desc": "Measuring and improving Power Usage Effectiveness from 2.0 to 1.1",
        "url": "https://www.se.com/ww/en/download/document/SPD_WP114_EN/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-sus2",
        "cat": "sustainability",
        "title": "Schneider WP 67: Water Usage (WUE)",
        "desc": "Measuring and reducing Water Usage Effectiveness in data centers",
        "url": "https://www.se.com/ww/en/download/document/SPD_NRAN-7FMLEG_EN/",
        "badge": "free",
        "week": 5
    },
    {
        "id": "res-sus3",
        "cat": "sustainability",
        "title": "EU Energy Efficiency Directive for DC",
        "desc": "European regulations requiring DC energy reporting and efficiency targets",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/data-centres-energy-efficiency",
        "badge": "free",
        "week": 6
    },
    {
        "id": "res-sus4",
        "cat": "sustainability",
        "title": "The Green Grid: DC Sustainability Metrics",
        "desc": "Industry consortium metrics: PUE, CUE, WUE, and carbon-free energy tracking",
        "url": "https://www.thegreengrid.org/",
        "badge": "free",
        "week": 5
    }
];

// --- GPU Specs Database ---
const GPU_SPECS = {
    h100: { name: 'DGX H100', perSystem: 8, systemPower: 10.2, perRack: 4, rackPower: 40.8, cooling: 'air', weight: 130.45, rackUnits: 8, suSystems: 32, cableMax: 50, tflops: 3958 },
    b300: { name: 'DGX B300', perSystem: 8, systemPower: 14.3, perRack: 4, rackPower: 57.2, cooling: 'liquid', weight: 150, rackUnits: 10, suSystems: 36, cableMax: 50, tflops: 9000 },
    gb200: { name: 'DGX GB200', perSystem: 36, systemPower: 120, perRack: 1, rackPower: 120, cooling: 'liquid', weight: 1300, rackUnits: 42, suSystems: 8, cableMax: 50, tflops: 18000 }
};

// --- Calculators ---
function calcPower(totalMW, redundancy) {
    const mw = parseFloat(totalMW) || 10;
    const totalKW = mw * 1000;

    const redundancyFactors = { 'n+1': 1.15, '2n': 2.0, '2n+1': 2.15 };
    const rf = redundancyFactors[redundancy] || 1.15;

    const transformerSizeMVA = 2.5;
    const transformers = Math.ceil((mw * rf) / transformerSizeMVA);

    const upsSizeKW = 1000;
    const upsUnits = Math.ceil((totalKW * rf) / upsSizeKW);

    const genSizeKW = 2500;
    const generators = Math.ceil((totalKW * rf) / genSizeKW);

    const pduSizeKW = 200;
    const pdus = Math.ceil((totalKW) / pduSizeKW);

    const pue = redundancy === '2n' ? 1.25 : redundancy === '2n+1' ? 1.3 : 1.2;
    const totalFacilityPower = mw * pue;

    const annualPowerCost = totalFacilityPower * 1000 * 8760 * 0.07; // $0.07/kWh avg

    return { mw, totalKW, transformers, upsUnits, generators, pdus, pue, totalFacilityPower: totalFacilityPower.toFixed(1), annualPowerCost };
}

function calcCooling(kwPerRack, numRacks, coolingType) {
    const totalKW = kwPerRack * numRacks;
    const totalBTU = totalKW * 3412;

    const coolingData = {
        air: { maxKW: 30, pueAdd: 0.4, cduPerMW: 0, chillerTonsPerMW: 400, waterLPerKW: 1.8, capexPerKW: 800 },
        dlc: { maxKW: 120, pueAdd: 0.15, cduPerMW: 8, chillerTonsPerMW: 300, waterLPerKW: 0.5, capexPerKW: 1500 },
        immersion: { maxKW: 150, pueAdd: 0.05, cduPerMW: 4, chillerTonsPerMW: 250, waterLPerKW: 0.1, capexPerKW: 2500 }
    };

    const c = coolingData[coolingType] || coolingData.dlc;
    const totalMW = totalKW / 1000;
    const cdus = Math.ceil(totalMW * c.cduPerMW);
    const chillerTons = Math.ceil(totalMW * c.chillerTonsPerMW);
    const waterUsage = (totalKW * c.waterLPerKW).toFixed(0);
    const recommended = kwPerRack > 80 ? 'immersion' : kwPerRack > 30 ? 'dlc' : 'air';
    const capex = (totalKW * c.capexPerKW).toLocaleString();

    return { totalKW, totalBTU: (totalBTU / 1e6).toFixed(1), cdus, chillerTons, waterUsage, recommended, capex, pueContribution: c.pueAdd };
}

function calcRacks(gpuModel, gpuCount) {
    const spec = GPU_SPECS[gpuModel];
    if (!spec) return null;

    const systems = Math.ceil(gpuCount / spec.perSystem);
    const racks = Math.ceil(systems / spec.perRack);
    const totalPowerKW = racks * spec.rackPower;
    const totalPowerMW = (totalPowerKW / 1000).toFixed(2);
    const scalableUnits = Math.ceil(systems / spec.suSystems);
    const floorSpaceSqFt = racks * 30; // ~30 sqft per rack with aisles
    const totalWeight = (systems * spec.weight).toFixed(0);
    const ibCables = systems * 8; // rough: 8 IB connections per system

    return { spec, systems, racks, totalPowerKW, totalPowerMW, scalableUnits, floorSpaceSqFt, totalWeight, ibCables, gpuCount };
}

function calcBudget(totalMW) {
    const mw = parseFloat(totalMW) || 10;
    const costPerMW = 12.5; // $M per MW (midpoint of $10-15M)
    const total = mw * costPerMW;

    return {
        land: (total * 0.08).toFixed(1),
        building: (total * 0.12).toFixed(1),
        electrical: (total * 0.28).toFixed(1),
        mechanical: (total * 0.22).toFixed(1),
        it: (total * 0.17).toFixed(1),
        network: (total * 0.06).toFixed(1),
        soft: (total * 0.07).toFixed(1),
        total: total.toFixed(1)
    };
}

// --- Rendering ---
function getTaskId(weekIdx, dayIdx, taskIdx) {
    return `w${weekIdx}-d${dayIdx}-t${taskIdx}`;
}

function getWeekProgress(weekIdx) {
    const week = DC_CURRICULUM[weekIdx];
    let total = 0, done = 0;
    week.days.forEach((day, di) => {
        day.tasks.forEach((_, ti) => {
            total++;
            if (dcState.tasks[getTaskId(weekIdx, di, ti)]) done++;
        });
    });
    return total ? Math.round((done / total) * 100) : 0;
}

function getOverallProgress() {
    let total = 0, done = 0;
    DC_CURRICULUM.forEach((week, wi) => {
        week.days.forEach((day, di) => {
            day.tasks.forEach((_, ti) => {
                total++;
                if (dcState.tasks[getTaskId(wi, di, ti)]) done++;
            });
        });
    });
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

function getCurrentWeek() {
    for (let i = 0; i < DC_CURRICULUM.length; i++) {
        if (getWeekProgress(i) < 100) return i;
    }
    return DC_CURRICULUM.length - 1;
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function formatMoney(num) {
    return '$' + parseFloat(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// --- Timer ---
let timerInterval = null;

function startTimer() {
    if (dcState.timer.running) return;
    dcState.timer.running = true;
    dcState.timer.start = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - dcState.timer.start) / 1000);
        const display = document.getElementById('dcTimerDisplay');
        if (display) display.textContent = formatTime(dcState.timer.total + elapsed);
    }, 1000);
    updateTimerButtons();
}

function stopTimer() {
    if (!dcState.timer.running) return;
    clearInterval(timerInterval);
    dcState.timer.total += Math.floor((Date.now() - dcState.timer.start) / 1000);
    dcState.timer.running = false;
    dcState.timer.start = null;
    saveDCState();
    updateTimerButtons();
    const display = document.getElementById('dcTimerDisplay');
    if (display) display.textContent = formatTime(dcState.timer.total);
}

function resetTimer() {
    stopTimer();
    dcState.timer.total = 0;
    saveDCState();
    const display = document.getElementById('dcTimerDisplay');
    if (display) display.textContent = formatTime(0);
}

function updateTimerButtons() {
    const startBtn = document.getElementById('dcTimerStart');
    const stopBtn = document.getElementById('dcTimerStop');
    if (startBtn) startBtn.style.display = dcState.timer.running ? 'none' : 'inline-block';
    if (stopBtn) stopBtn.style.display = dcState.timer.running ? 'inline-block' : 'none';
}

// --- Sub-tab Switching ---
function switchDCSubtab(tabName) {
    dcState.activeSubtab = tabName;
    document.querySelectorAll('.dc-subtab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dctab === tabName);
    });
    document.querySelectorAll('.dc-subtab-content').forEach(el => {
        el.classList.toggle('active', el.id === `dc-${tabName}`);
    });
    saveDCState();
}

// --- Render Roadmap ---
function renderRoadmap() {
    const container = document.getElementById('dcRoadmapContent');
    if (!container) return;

    const currentWeek = getCurrentWeek();

    container.innerHTML = `<div class="dc-weeks-grid">${DC_CURRICULUM.map((week, wi) => {
        const progress = getWeekProgress(wi);
        const isCompleted = progress === 100;
        const isCurrent = wi === currentWeek && !isCompleted;
        const isExpanded = dcState.expandedWeeks[wi];

        return `<div class="dc-week-card${isCompleted ? ' completed' : ''}${isCurrent ? ' current' : ''}${isExpanded ? ' expanded' : ''}" data-week="${wi}">
            <div class="dc-week-header" onclick="toggleWeek(${wi})">
                <div class="dc-week-title">
                    <div class="dc-week-number">${isCompleted ? '\u2713' : wi + 1}</div>
                    <div>
                        <div class="dc-week-name">Week ${wi + 1}: ${week.title}</div>
                        <div class="dc-week-topic">${week.topic}</div>
                    </div>
                </div>
                <div class="dc-week-progress">
                    <span class="dc-week-percent">${progress}%</span>
                    <div class="dc-week-bar"><div class="dc-week-bar-fill" style="width:${progress}%"></div></div>
                    <span class="dc-week-expand">\u25BC</span>
                </div>
            </div>
            <div class="dc-week-body">
                ${week.days.map((day, di) => `
                    <div class="dc-day-group">
                        <div class="dc-day-label">${day.day}</div>
                        ${day.tasks.map((task, ti) => {
                            const tid = getTaskId(wi, di, ti);
                            const checked = dcState.tasks[tid];
                            return `<div class="dc-task-item${checked ? ' completed' : ''}">
                                <div class="dc-task-checkbox${checked ? ' checked' : ''}" onclick="toggleTask('${tid}', ${wi})"></div>
                                <span class="dc-task-text">${task.text}<span class="dc-task-tag ${task.tag}">${task.tag}</span></span>
                            </div>`;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        </div>`;
    }).join('')}</div>`;
}

function toggleWeek(wi) {
    dcState.expandedWeeks[wi] = !dcState.expandedWeeks[wi];
    saveDCState();
    renderRoadmap();
}

function toggleTask(tid, wi) {
    dcState.tasks[tid] = !dcState.tasks[tid];
    saveDCState();
    renderRoadmap();
    updateProgressBanner();
}

// --- Render Progress Banner ---
function updateProgressBanner() {
    const { total, done, percent } = getOverallProgress();
    const bar = document.getElementById('dcOverallBarFill');
    const text = document.getElementById('dcOverallPercent');
    const tasksDone = document.getElementById('dcTasksDone');
    const hoursEl = document.getElementById('dcStudyHours');
    const weekEl = document.getElementById('dcCurrentWeek');

    if (bar) bar.style.width = percent + '%';
    if (text) text.textContent = percent + '% Complete';
    if (tasksDone) tasksDone.textContent = done + '/' + total;
    if (hoursEl) hoursEl.textContent = (dcState.timer.total / 3600).toFixed(1) + 'h';
    if (weekEl) weekEl.textContent = (getCurrentWeek() + 1) + '/6';
}

// --- Render Power Calculator ---
function renderPowerCalc() {
    const mw = parseFloat(document.getElementById('dcPowerMW')?.value) || 10;
    const redundancy = document.getElementById('dcPowerRedundancy')?.value || 'n+1';
    const result = calcPower(mw, redundancy);

    const out = document.getElementById('dcPowerResults');
    if (!out) return;

    out.innerHTML = `
        <div class="dc-results-grid">
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.transformers}</div><div class="dc-result-label">Transformers (2.5MVA)</div></div>
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.upsUnits}</div><div class="dc-result-label">UPS Units (1MW)</div></div>
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.generators}</div><div class="dc-result-label">Generators (2.5MW)</div></div>
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.pdus}</div><div class="dc-result-label">PDUs (200kW)</div></div>
            <div class="dc-result-item"><div class="dc-result-value success">${result.pue}</div><div class="dc-result-label">Estimated PUE</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.totalFacilityPower} MW</div><div class="dc-result-label">Total Facility Power</div></div>
            <div class="dc-result-item"><div class="dc-result-value warning">${formatMoney(result.annualPowerCost)}</div><div class="dc-result-label">Annual Power Cost</div></div>
        </div>
    `;
}

// --- Render Cooling Calculator ---
function renderCoolingCalc() {
    const kwPerRack = parseFloat(document.getElementById('dcCoolKW')?.value) || 80;
    const numRacks = parseInt(document.getElementById('dcCoolRacks')?.value) || 128;
    const coolingType = document.getElementById('dcCoolType')?.value || 'dlc';
    const result = calcCooling(kwPerRack, numRacks, coolingType);

    const out = document.getElementById('dcCoolingResults');
    if (!out) return;

    out.innerHTML = `
        <div class="dc-results-grid">
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.totalKW.toLocaleString()} kW</div><div class="dc-result-label">Total Heat Load</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.totalBTU}M BTU/h</div><div class="dc-result-label">Heat Output</div></div>
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.cdus}</div><div class="dc-result-label">CDUs Required</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.chillerTons}</div><div class="dc-result-label">Chiller Tons</div></div>
            <div class="dc-result-item"><div class="dc-result-value${result.recommended === coolingType ? ' success' : ' warning'}">${result.recommended.toUpperCase()}</div><div class="dc-result-label">Recommended Type</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.waterUsage} L/h</div><div class="dc-result-label">Water Usage</div></div>
            <div class="dc-result-item"><div class="dc-result-value warning">${result.capex}</div><div class="dc-result-label">Cooling CAPEX</div></div>
        </div>
        <table class="dc-comparison-table">
            <thead><tr><th>Method</th><th>Max kW/Rack</th><th>PUE Impact</th><th>Water Usage</th><th>Best For</th></tr></thead>
            <tbody>
                <tr${kwPerRack <= 30 ? ' class="recommended"' : ''}><td>Air Cooling</td><td>Up to 30 kW</td><td>+0.40</td><td>1.8 L/kW</td><td>Traditional workloads</td></tr>
                <tr${kwPerRack > 30 && kwPerRack <= 80 ? ' class="recommended"' : ''}><td>Direct Liquid (DLC)</td><td>60-120 kW</td><td>+0.15</td><td>0.5 L/kW</td><td>AI training clusters</td></tr>
                <tr${kwPerRack > 80 ? ' class="recommended"' : ''}><td>Immersion</td><td>100-150+ kW</td><td>+0.05</td><td>0.1 L/kW</td><td>Ultra-dense AI racks</td></tr>
            </tbody>
        </table>
    `;
}

// --- Render Rack Calculator ---
function renderRackCalc() {
    const gpuModel = document.getElementById('dcRackGPU')?.value || 'h100';
    const gpuCount = parseInt(document.getElementById('dcRackCount')?.value) || 512;
    const result = calcRacks(gpuModel, gpuCount);

    const out = document.getElementById('dcRackResults');
    if (!out) return;
    if (!result) { out.innerHTML = '<p>Invalid configuration</p>'; return; }

    out.innerHTML = `
        <div class="dc-results-grid">
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.systems}</div><div class="dc-result-label">${result.spec.name} Systems</div></div>
            <div class="dc-result-item"><div class="dc-result-value highlight">${result.racks}</div><div class="dc-result-label">Racks Required</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.totalPowerMW} MW</div><div class="dc-result-label">Total Power</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.scalableUnits}</div><div class="dc-result-label">Scalable Units</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.floorSpaceSqFt.toLocaleString()} ft\u00B2</div><div class="dc-result-label">Floor Space</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${(result.totalWeight / 1000).toFixed(1)}t</div><div class="dc-result-label">Total Weight</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.ibCables}</div><div class="dc-result-label">InfiniBand Cables</div></div>
            <div class="dc-result-item"><div class="dc-result-value">${result.spec.cooling}</div><div class="dc-result-label">Cooling Method</div></div>
        </div>
        <div style="margin-top:16px;padding:14px;background:#EEF2FF;border-radius:10px;font-size:0.85rem;color:#4338CA;">
            <strong>SuperPOD Config:</strong> ${result.scalableUnits} SU x ${result.spec.suSystems} systems/SU = ${result.scalableUnits * result.spec.suSystems} systems (${result.scalableUnits * result.spec.suSystems * result.spec.perSystem} GPUs max).
            Cable constraint: all InfiniBand runs must be &le; ${result.spec.cableMax}m.
        </div>
    `;
}

// --- Render Design Project ---
function renderDesignProject() {
    const container = document.getElementById('dcDesignContent');
    if (!container) return;

    const budget = calcBudget(dcState.design.totalMW);
    const rackResult = calcRacks(dcState.design.gpuModel, dcState.design.gpuCount);
    const tierNames = { 1: 'Tier I - Basic', 2: 'Tier II - Redundant Components', 3: 'Tier III - Concurrently Maintainable', 4: 'Tier IV - Fault Tolerant' };

    container.innerHTML = `
        <div class="dc-card" style="margin-bottom:20px;">
            <h3 class="dc-card-title">My ${dcState.design.totalMW}MW AI Data Center Design</h3>
            <p class="dc-card-subtitle">Fill in your design decisions below. All calculations auto-update.</p>
            <div class="dc-calc-grid">
                <div class="dc-calc-inputs">
                    <div class="dc-calc-group">
                        <label>Project Name</label>
                        <input type="text" id="dcDesignName" value="${dcState.design.siteName}" placeholder="My AI Data Center" onchange="dcState.design.siteName=this.value;saveDCState()">
                    </div>
                    <div class="dc-calc-group">
                        <label>Location</label>
                        <input type="text" id="dcDesignLocation" value="${dcState.design.location}" placeholder="e.g., Dallas, TX" onchange="dcState.design.location=this.value;saveDCState()">
                    </div>
                    <div class="dc-calc-group">
                        <label>Total IT Load (MW)</label>
                        <input type="number" id="dcDesignMW" value="${dcState.design.totalMW}" min="1" max="500" onchange="dcState.design.totalMW=parseFloat(this.value)||10;saveDCState();renderDesignProject()">
                    </div>
                    <div class="dc-calc-group">
                        <label>GPU Model</label>
                        <select id="dcDesignGPU" onchange="dcState.design.gpuModel=this.value;saveDCState();renderDesignProject()">
                            <option value="h100"${dcState.design.gpuModel==='h100'?' selected':''}>NVIDIA DGX H100</option>
                            <option value="b300"${dcState.design.gpuModel==='b300'?' selected':''}>NVIDIA DGX B300</option>
                            <option value="gb200"${dcState.design.gpuModel==='gb200'?' selected':''}>NVIDIA DGX GB200</option>
                        </select>
                    </div>
                    <div class="dc-calc-group">
                        <label>Total GPU Count</label>
                        <input type="number" id="dcDesignGPUCount" value="${dcState.design.gpuCount}" min="8" onchange="dcState.design.gpuCount=parseInt(this.value)||512;saveDCState();renderDesignProject()">
                    </div>
                    <div class="dc-calc-group">
                        <label>Redundancy Level</label>
                        <select id="dcDesignRedundancy" onchange="dcState.design.redundancy=this.value;saveDCState();renderDesignProject()">
                            <option value="n+1"${dcState.design.redundancy==='n+1'?' selected':''}>N+1</option>
                            <option value="2n"${dcState.design.redundancy==='2n'?' selected':''}>2N</option>
                            <option value="2n+1"${dcState.design.redundancy==='2n+1'?' selected':''}>2(N+1)</option>
                        </select>
                    </div>
                    <div class="dc-calc-group">
                        <label>Uptime Tier</label>
                        <select id="dcDesignTier" onchange="dcState.design.tierLevel=parseInt(this.value);saveDCState();renderDesignProject()">
                            ${[1,2,3,4].map(t => `<option value="${t}"${dcState.design.tierLevel===t?' selected':''}>${tierNames[t]}</option>`).join('')}
                        </select>
                    </div>
                    <div class="dc-calc-group">
                        <label>Design Notes</label>
                        <textarea style="padding:10px 14px;border:2px solid #E2E8F0;border-radius:10px;font-size:0.9rem;min-height:80px;resize:vertical;font-family:inherit;" placeholder="Additional design notes..." onchange="dcState.design.notes=this.value;saveDCState()">${dcState.design.notes}</textarea>
                    </div>
                </div>
                <div class="dc-calc-outputs">
                    <h4 style="margin:0 0 12px;color:#475569;">Auto-Calculated Specs</h4>
                    <div class="dc-results-grid" style="grid-template-columns:1fr 1fr;">
                        <div class="dc-result-item"><div class="dc-result-value highlight">${rackResult ? rackResult.racks : '-'}</div><div class="dc-result-label">Total Racks</div></div>
                        <div class="dc-result-item"><div class="dc-result-value">${rackResult ? rackResult.totalPowerMW : '-'} MW</div><div class="dc-result-label">Compute Power</div></div>
                        <div class="dc-result-item"><div class="dc-result-value">${rackResult ? rackResult.floorSpaceSqFt.toLocaleString() : '-'} ft\u00B2</div><div class="dc-result-label">Floor Space</div></div>
                        <div class="dc-result-item"><div class="dc-result-value">${rackResult ? rackResult.scalableUnits : '-'}</div><div class="dc-result-label">Scalable Units</div></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="dc-card" style="margin-bottom:20px;">
            <h3 class="dc-card-title">Budget Estimation</h3>
            <p class="dc-card-subtitle">Based on $10-15M per MW industry average (midpoint $12.5M/MW)</p>
            <table class="dc-budget-table">
                <thead><tr><th>Category</th><th>% of Total</th><th>Estimated Cost</th></tr></thead>
                <tbody>
                    <tr><td>Land & Site Prep</td><td>8%</td><td>$${budget.land}M</td></tr>
                    <tr><td>Building / Shell</td><td>12%</td><td>$${budget.building}M</td></tr>
                    <tr><td>Electrical Infrastructure</td><td>28%</td><td>$${budget.electrical}M</td></tr>
                    <tr><td>Mechanical (Cooling)</td><td>22%</td><td>$${budget.mechanical}M</td></tr>
                    <tr><td>IT Infrastructure</td><td>17%</td><td>$${budget.it}M</td></tr>
                    <tr><td>Network / Telecom</td><td>6%</td><td>$${budget.network}M</td></tr>
                    <tr><td>Soft Costs (Design, PM)</td><td>7%</td><td>$${budget.soft}M</td></tr>
                    <tr class="total-row"><td>Total CAPEX</td><td>100%</td><td>$${budget.total}M</td></tr>
                </tbody>
            </table>
        </div>

        <div class="dc-card" style="margin-bottom:20px;">
            <h3 class="dc-card-title">Construction Timeline</h3>
            <p class="dc-card-subtitle">Typical 18-24 month build for ${dcState.design.totalMW}MW facility</p>
            <div class="dc-gantt">
                <div class="dc-gantt-months">
                    ${Array.from({length:24}, (_,i) => `<div class="dc-gantt-month">M${i+1}</div>`).join('')}
                </div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Utility Power</div><div class="dc-gantt-track"><div class="dc-gantt-bar power" style="left:0%;width:50%">12 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Site & Foundation</div><div class="dc-gantt-track"><div class="dc-gantt-bar structure" style="left:0%;width:16.7%">4 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Building Shell</div><div class="dc-gantt-track"><div class="dc-gantt-bar structure" style="left:12.5%;width:25%">6 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Electrical Install</div><div class="dc-gantt-track"><div class="dc-gantt-bar power" style="left:25%;width:33.3%">8 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Mechanical Install</div><div class="dc-gantt-track"><div class="dc-gantt-bar cooling" style="left:29.2%;width:29.2%">7 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Network / Telecom</div><div class="dc-gantt-track"><div class="dc-gantt-bar network" style="left:45.8%;width:16.7%">4 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">IT Deployment</div><div class="dc-gantt-track"><div class="dc-gantt-bar it-deploy" style="left:58.3%;width:16.7%">4 mo</div></div></div>
                <div class="dc-gantt-row"><div class="dc-gantt-label">Commissioning</div><div class="dc-gantt-track"><div class="dc-gantt-bar commissioning" style="left:75%;width:12.5%">3 mo</div></div></div>
            </div>
        </div>

        <button class="dc-export-btn" onclick="exportDesign()">Export Design Summary</button>
    `;
}

// --- Render Resources ---
function renderResources() {
    const container = document.getElementById('dcResourcesContent');
    if (!container) return;

    let html = '';
    DC_RESOURCE_CATEGORIES.forEach(cat => {
        const catResources = DC_RESOURCES.filter(r => r.cat === cat.id);
        if (catResources.length === 0) return;

        const completedCount = catResources.filter(r => dcState.resourceStatus[r.id] === 'completed').length;

        html += '<div class="dc-resource-category" style="margin-bottom:24px;">';
        html += '<div class="dc-resource-cat-header" style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px 16px;background:' + cat.color + '15;border-left:4px solid ' + cat.color + ';border-radius:0 8px 8px 0;">';
        html += '<span style="font-size:1.3rem;">' + cat.icon + '</span>';
        html += '<span style="font-weight:700;font-size:1rem;color:#1E293B;">' + cat.name + '</span>';
        html += '<span style="margin-left:auto;font-size:0.8rem;color:#64748B;font-weight:600;">' + completedCount + '/' + catResources.length + ' done</span>';
        html += '</div>';
        html += '<div class="dc-resources-grid">';

        catResources.forEach(r => {
            const status = dcState.resourceStatus[r.id] || 'not-started';
            const statusLabels = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed' };

            html += '<div class="dc-resource-card">';
            html += '<div class="dc-resource-header">';
            html += '<span class="dc-resource-title">' + r.title + '</span>';
            html += '<span class="dc-resource-badge ' + r.badge + '">' + r.badge.toUpperCase() + '</span>';
            html += '</div>';
            html += '<span class="dc-resource-desc">' + r.desc + '</span>';
            html += '<a href="' + r.url + '" target="_blank" rel="noopener" class="dc-resource-link">Open Resource →</a>';
            html += '<div class="dc-resource-meta">';
            html += '<span class="dc-resource-week">Week ' + r.week + '</span>';
            html += '<button class="dc-resource-status ' + status + '" onclick="cycleResourceStatus(' + String.fromCharCode(39) + r.id + String.fromCharCode(39) + ')">' + statusLabels[status] + '</button>';
            html += '</div></div>';
        });

        html += '</div></div>';
    });

    container.innerHTML = html;
}

function cycleResourceStatus(id) {
    const order = ['not-started', 'in-progress', 'completed'];
    const current = dcState.resourceStatus[id] || 'not-started';
    const idx = order.indexOf(current);
    dcState.resourceStatus[id] = order[(idx + 1) % order.length];
    saveDCState();
    renderResources();
}

// --- Export ---
function exportDesign() {
    const { total, done, percent } = getOverallProgress();
    const budget = calcBudget(dcState.design.totalMW);
    const rackResult = calcRacks(dcState.design.gpuModel, dcState.design.gpuCount);
    const powerResult = calcPower(dcState.design.totalMW, dcState.design.redundancy);
    const tierNames = { 1: 'Tier I', 2: 'Tier II', 3: 'Tier III', 4: 'Tier IV' };

    const summary = `
========================================
AI DATA CENTER DESIGN SUMMARY
========================================
Project: ${dcState.design.siteName || 'Untitled'}
Location: ${dcState.design.location || 'TBD'}
Date: ${new Date().toLocaleDateString()}

LEARNING PROGRESS: ${percent}% (${done}/${total} tasks)
STUDY TIME: ${(dcState.timer.total / 3600).toFixed(1)} hours

--- COMPUTE ---
GPU Model: ${GPU_SPECS[dcState.design.gpuModel]?.name || dcState.design.gpuModel}
Total GPUs: ${dcState.design.gpuCount}
Systems: ${rackResult?.systems || '-'}
Racks: ${rackResult?.racks || '-'}
Scalable Units: ${rackResult?.scalableUnits || '-'}

--- POWER ---
IT Load: ${dcState.design.totalMW} MW
Redundancy: ${dcState.design.redundancy.toUpperCase()}
Total Facility Power: ${powerResult.totalFacilityPower} MW (PUE ${powerResult.pue})
Transformers: ${powerResult.transformers} x 2.5MVA
UPS Units: ${powerResult.upsUnits} x 1MW
Generators: ${powerResult.generators} x 2.5MW
Annual Power Cost: ${formatMoney(powerResult.annualPowerCost)}

--- RELIABILITY ---
Uptime Tier: ${tierNames[dcState.design.tierLevel]}

--- BUDGET ---
Total CAPEX: $${budget.total}M
  Electrical: $${budget.electrical}M (28%)
  Mechanical: $${budget.mechanical}M (22%)
  IT Infra:   $${budget.it}M (17%)
  Building:   $${budget.building}M (12%)
  Land:       $${budget.land}M (8%)
  Soft Costs: $${budget.soft}M (7%)
  Network:    $${budget.network}M (6%)

--- NOTES ---
${dcState.design.notes || 'None'}
========================================
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dc-design-${(dcState.design.siteName || 'project').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Initialize ---
function initDCDashboard() {
    loadDCState();

    // Sub-tab switching
    document.querySelectorAll('.dc-subtab').forEach(btn => {
        btn.addEventListener('click', () => switchDCSubtab(btn.dataset.dctab));
    });

    // Timer buttons
    document.getElementById('dcTimerStart')?.addEventListener('click', startTimer);
    document.getElementById('dcTimerStop')?.addEventListener('click', stopTimer);
    document.getElementById('dcTimerReset')?.addEventListener('click', resetTimer);

    // Calculator inputs
    ['dcPowerMW', 'dcPowerRedundancy'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', renderPowerCalc);
    });
    ['dcCoolKW', 'dcCoolRacks', 'dcCoolType'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', renderCoolingCalc);
    });
    ['dcRackGPU', 'dcRackCount'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', renderRackCalc);
    });

    // Set active subtab
    switchDCSubtab(dcState.activeSubtab || 'roadmap');

    // Render all sections
    updateProgressBanner();
    renderRoadmap();
    renderPowerCalc();
    renderCoolingCalc();
    renderRackCalc();
    renderDesignProject();
    renderResources();

    // Timer display
    const display = document.getElementById('dcTimerDisplay');
    if (display) display.textContent = formatTime(dcState.timer.total);
    updateTimerButtons();
}

// Auto-init when tab is shown
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Will be called when datacenter tab is activated
    });
}
