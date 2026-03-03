# Comprehensive Knowledge Base for ATS

# 1. Skill Synonyms (Normalization Map)
SKILL_SYNONYMS = {
    # Languages
    "py": "python", "js": "javascript", "ts": "typescript", "golang": "go", "cpp": "c++",
    "c#": "csharp", "dot net": ".net", "dotnet": ".net",
    
    # Web
    "reactjs": "react", "react.js": "react", "vuejs": "vue", "vue.js": "vue",
    "angularjs": "angular", "node.js": "node", "nodejs": "node",
    "expressjs": "express", "nextjs": "next.js", "next.js": "next.js",
    
    # Cloud / DevOps
    "amazon web services": "aws", "gcp": "google cloud", "google cloud platform": "google cloud",
    "azure": "microsoft azure", "k8s": "kubernetes", "kube": "kubernetes",
    "docker containers": "docker",
    
    # AI/ML
    "ml": "machine learning", "ai": "artificial intelligence", "dl": "deep learning",
    "nlp": "natural language processing", "cv": "computer vision",
    "tensorflow": "tf", "scikit-learn": "sklearn"
}

# 2. Categorized Skill Sets (For Contextual Scoring)
SKILL_CATEGORIES = {
    "languages": {"python", "java", "javascript", "typescript", "c++", "go", "ruby", "php", "swift", "kotlin", "rust", "c#", "scala", "r", "matlab", "perl", "bash", "shell", "html", "css", "sql"},
    "frameworks": {"react", "angular", "vue", "next.js", "django", "flask", "fastapi", "spring", "spring boot", "ruby on rails", "laravel", "express", "nestjs", "pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn"},
    "infrastructure": {"aws", "azure", "google cloud", "docker", "kubernetes", "jenkins", "gitlab ci", "github actions", "terraform", "ansible", "linux", "unix", "nginx", "apache", "kafka", "redis", "rabbitmq", "elasticsearch"},
    "databases": {"postgresql", "postgres", "mysql", "mongodb", "dynamodb", "redis", "cassandra", "oracle", "sql server", "sqlite", "neo4j"},
    "concepts": {"rest api", "graphql", "microservices", "distributed systems", "ci/cd", "agile", "scrum", "oop", "functional programming", "mvc", "tdd", "bdd"}
}

# 3. Company-Specific Value Dictionaries & Secret Sauce
COMPANY_DNA = {
    "Google": {
        "values": ["googliness", "inclusive", "impact", "scale", "complexity", "ambiguity", "bias for action", "data-driven", "user-first"],
        "tech_bias": ["python", "java", "c++", "go", "kubernetes", "tensorflow", "bigtable", "angular", "bazel"],
        "secret_sauce": {
            "xyz_formula": r"accomplished [X] as measured by [Y], by doing [Z]", # Conceptual regex
            "elite_school_bias": 1.1, # Slight multiplier for top CS schools signal
            "open_source_bias": 1.2
        }
    },
    "Amazon": {
        "values": ["customer obsession", "ownership", "invent and simplify", "are right a lot", "learn and be curious", "hire and develop the best", "insist on the highest standards", "think big", "bias for action", "frugality", "earn trust", "dive deep", "have backbone", "disagree and commit", "deliver results"],
        "tech_bias": ["java", "aws", "dynamodb", "lambda", "ec2", "s3", "redshift", "react"],
        "secret_sauce": {
            "metrics_obsession": 1.5, # Huge multiplier for highly quantified bullets
            "star_format": 1.2 # Bonus for Situation-Task-Action-Result structure
        }
    },
    "Microsoft": {
        "values": ["growth mindset", "one microsoft", "diverse and inclusive", "making a difference", "empower every person", "customer focus"],
        "tech_bias": ["c#", ".net", "azure", "sql server", "typescript", "react", "powershell", "openai"],
        "secret_sauce": {
            "enterprise_experience": 1.2,
            "collaboration_focus": 1.1
        }
    },
    "Apple": {
        "values": ["innovation", "simplicity", "perfection", "collaboration", "secrecy", "ecosystem", "user experience", "privacy"],
        "tech_bias": ["swift", "objective-c", "ios", "macos", "c++", "python", "siri", "ml"],
        "secret_sauce": {
            "design_perf_bias": 1.3,
            "patent_publication_bonus": 1.4
        }
    },
    "Meta": {
        "values": ["move fast", "focus on impact", "be open", "build social value", "live in the future"],
        "tech_bias": ["hack", "php", "react", "graphql", "pytorch", "android", "ios", "cassandra"],
        "secret_sauce": {
            "hacker_culture": 1.2, # Competitions, side projects
            "scale_bias": 1.2 # "Billions of users"
        }
    }
}

# 4. Action Verbs for Strong Bullets (Boosts Tier 2 Score)
# 4. Action Verbs for Strong Bullets (Categorized)
POWER_VERBS = {
    "leadership": ["orchestrated", "spearheaded", "governed", "coordinated", "mentored", "supervised", "delegated", "chaired", "mobilized"],
    "achievement": ["accelerated", "outpaced", "surpassed", "amplified", "maximized", "refined", "revamped", "modernized", "pioneered"],
    "technical": ["engineered", "architected", "deployed", "automated", "optimized", "implemented", "debugged", "formulated", "coded"],
    "analytical": ["interpreted", "deciphered", "evaluated", "visualized", "forecasted", "diagnosed", "audited", "quantified", "extracted"],
    "collaboration": ["fostered", "advocated", "mediated", "negotiated", "partnered", "harmonized", "consulted", "co-authored"]
}

# 5. Overused/Weak Words => Strong Alternatives
WEAK_WORDS_MAP = {
    "helped": ["facilitated", "supported", "collaborated with", "assisted in"],
    "did": ["executed", "performed", "discharged", "implemented"],
    "made": ["created", "developed", "produced", "forged"],
    "worked on": ["spearheaded", "contributed to", "collaborated on", "orchestrated"],
    "responsible for": ["accountable for", "charged with", "managed", "overlooked"],
    "handled": ["managed", "directed", "coordinated", "resolved"],
    "try": ["attempted", "endeavored", "strived"],
    "things": ["components", "elements", "assets", "deliverables"]
}
