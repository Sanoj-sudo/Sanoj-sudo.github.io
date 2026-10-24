// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE — all portfolio content lives here.
//  The 3D scene (skill orbits etc.) is generated from this data.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Sanoj Kumar',
  firstName: 'Sanoj',
  handle: 'sanoj', // used in the terminal prompts
  role: 'DevOps & Infrastructure Engineer',
  // Cycled by the typewriter in the hero
  roles: ['DevOps Engineer', 'Infrastructure Engineer', 'Multi-Cloud Architect', 'AI-Powered Automation Builder'],
  location: 'Noida, India',
  openToWork: true,
  tagline:
    '5 years building and operating reliable, scalable cloud infrastructure on AWS, Azure and GCP - now supercharging DevOps workflows with AI (Claude, Gemini and OpenAI).',
  email: 'sanojkumar715@gmail.com',
  phone: '', // e.g. '+91 93546 07106' — left empty so it isn't published to scrapers
  // Either a Google Drive share link (file must be shared as "Anyone with the link")
  // e.g. 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'
  // or a local file in /public, e.g. './resume.pdf'
  resume: 'https://drive.google.com/file/d/15TBkVXGwgFS75mbY7yU9FSJH1GYXDPpB/view?usp=sharing',

  // Pre-filled Gmail drafts that recruiters see when they click "Email me" / "Request resume".
  // Text in [brackets] is for the sender to fill in.
  emailTemplates: {
    hire: {
      subject: 'Job Opportunity – [Job Title] at [Company Name]',
      body: `Hi Sanoj,

I came across your portfolio and was impressed by your experience designing and operating multi-cloud infrastructure on AWS, Azure and GCP, as well as your work bringing AI into DevOps workflows with Claude, Gemini and Databricks.

We are currently hiring for a [Job Title] position at [Company Name], and I believe your background in Kubernetes, Terraform, GitOps (ArgoCD) and CI/CD automation would make you a strong fit for our team.

Role details:
• Position: [Job Title]
• Location / Work mode: [City / Remote / Hybrid]
• Experience required: [X+ years]
• Job description: [Link]

I would love to schedule a quick call to discuss the opportunity and learn more about your career goals. Please let me know a time that works for you, or share your availability for this week.

Looking forward to hearing from you.

Best regards,
[Your Name]
[Designation], [Company Name]
[Phone] | [LinkedIn profile]`,
    },
    resume: {
      subject: 'Resume Request – [Job Title] at [Company Name]',
      body: `Hi Sanoj,

I visited your portfolio and I'm interested in your profile for a [Job Title] role at [Company Name]. Your experience with multi-cloud infrastructure, Kubernetes and AI-powered DevOps automation stood out.

Could you please share your latest resume, along with your current notice period and expected compensation?

Role details:
• Position: [Job Title]
• Location / Work mode: [City / Remote / Hybrid]
• Job description: [Link]

Thank you, and I look forward to hearing from you.

Best regards,
[Your Name]
[Designation], [Company Name]
[Phone] | [LinkedIn profile]`,
    },
  },

  socials: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/sanoj-sudo' },
    { label: 'GitHub', url: 'https://github.com/sanoj-sudo' },
  ],

  about: [
    "I'm a DevOps Engineer with 5 years of experience designing, automating and running production infrastructure across AWS, Azure and GCP — from Terraform and Kubernetes to GitOps delivery with ArgoCD.",
    'I care about reliability: I join on-call, chase incidents to root cause, write the runbooks, and automate the toil away with Python and Bash. I partner closely with software engineers so deployments are boring and fast.',
    'Lately I bring AI into the platform — Claude skills that review pull requests and manage releases inside GitHub Actions, and an AI-based Data Product Workbench built on Anthropic, Gemini and Databricks.',
  ],

  education: { degree: 'B.Tech — Computer Science & Engineering', school: 'Delhi Technical Campus, Haryana', year: '2021' },

  // `value` counts up when the numeric part is a number
  stats: [
    { value: '5+', label: 'years in DevOps' },
    { value: '3', label: 'clouds · AWS · Azure · GCP' },
    { value: '40+', label: 'tools & technologies' },
    { value: '24/7', label: 'on-call & incident response' },
  ],

  // Shown in the hero ticker
  ticker: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform', 'ArgoCD', 'GitHub Actions', 'Claude', 'Gemini', 'Databricks', 'Snowflake', 'Docker', 'Helm', 'Prometheus', 'Grafana', 'Datadog', 'Python', 'Linux'],

  // AI × DevOps section
  ai: {
    intro:
      'I embed LLMs directly into delivery pipelines and data platforms — so reviews, releases and data work get faster without losing control.',
    models: ['Anthropic Claude', 'Google Gemini', 'Databricks'],
    items: [
      {
        icon: '⟲',
        title: 'Claude-powered PR reviews',
        text: 'Claude skills wired into GitHub Actions automatically review every pull request — flagging bugs, security issues and style problems before a human looks.',
        flow: ['PR opened', 'Claude skill review', 'inline feedback', 'merge'],
      },
      {
        icon: '⇪',
        title: 'AI release management',
        text: 'Release workflows where Claude drafts changelogs and release notes from merged work, keeping versioning and announcements consistent.',
        flow: ['merge to main', 'Claude release notes', 'tag & publish'],
      },
      {
        icon: '◈',
        title: 'Data Product Workbench',
        text: 'An AI-based application for building and exploring data products, combining Anthropic Claude and Google Gemini with Databricks.',
        flow: ['data product', 'Databricks', 'Claude / Gemini', 'insights'],
      },
    ],
  },

  // Each category becomes an orbit ring in the 3D skills scene (first 6 items shown in 3D).
  skills: [
    { category: 'Cloud', color: '#22d3ee', items: ['AWS', 'Azure', 'GCP', 'EC2 · S3 · VPC', 'Lambda', 'CloudFront', 'Route 53', 'RDS'] },
    { category: 'Containers', color: '#a855f7', items: ['Kubernetes', 'Docker', 'EKS', 'Helm', 'Cloud Run', 'Container Apps'] },
    { category: 'IaC & CI/CD', color: '#4ade80', items: ['Terraform', 'GitHub Actions', 'ArgoCD', 'Ansible', 'Jenkins', 'Terragrunt'] },
    { category: 'AI & Data', color: '#fb7185', items: ['Claude', 'Gemini', 'Databricks', 'Snowflake', 'Claude Skills', 'OpenMetadata'] },
    { category: 'Observability', color: '#fbbf24', items: ['Prometheus', 'Grafana', 'Datadog', 'CloudWatch', 'New Relic', 'Splunk', 'Azure Monitor', 'Nagios'] },
    { category: 'Security & IAM', color: '#60a5fa', items: ['IAM', 'OIDC', 'Azure RBAC', 'KMS', 'Key Vault', 'tfsec', 'Checkov', 'SonarQube'] },
    { category: 'Linux & Code', color: '#f472b6', items: ['Linux', 'Bash', 'Python', 'Git', 'Windows Server', 'JavaScript', 'C'] },
  ],

  // status: 'running' for your current job, 'passed' for previous ones.
  experience: [
    {
      role: 'Infrastructure Engineer',
      company: 'Thoughtworks',
      period: 'Dec 2023 — Present · Pune',
      status: 'running',
      points: [
        'Designed, built and run multi-cloud infrastructure (AWS, Azure, GCP) for a Data-as-a-Product platform.',
        'Implemented GitOps delivery with ArgoCD on Kubernetes — consistent, auditable deployments with fast rollbacks.',
        'Led migration of enterprise infrastructure from on-prem / Windows servers to AWS with minimal downtime.',
        'Deployed OpenMetadata on Amazon EKS with Python-automated metadata ingestion.',
        'Automated provisioning with Terraform + GitHub Actions using keyless OIDC & Workload Identity Federation.',
        'Built traffic management with Ingress, CloudFront, Route 53, Azure Front Door and Google Cloud Load Balancing.',
        'On-call incident response, end-to-end observability, least-privilege IAM/RBAC, KMS, Key Vault and tfsec scanning.',
        'Brought AI into delivery: Claude skills for PR review & release management in GitHub workflows.',
      ],
      stack: ['AWS', 'Azure', 'GCP', 'EKS', 'ArgoCD', 'Terraform', 'GitHub Actions', 'Helm', 'Claude'],
    },
    {
      role: 'Software Engineer (DevOps)',
      company: 'Programmers.io',
      period: 'Jul 2021 — Oct 2023 · Jaipur',
      status: 'passed',
      points: [
        'Built Jenkins CI/CD with Declarative Pipelines and Groovy to automate build and release.',
        'Containerized apps with Docker and ran them on Kubernetes — workloads, networking, ingress and load balancing.',
        'Provisioned AWS (EC2, S3, VPC, RDS, IAM, CloudWatch) with Terraform; configuration management with Ansible.',
        'Hardened and patched RHEL/Ubuntu and Windows servers; production troubleshooting and on-call support.',
        'Secured cloud access with VPC Peering, MFA and SSO; maintained runbooks in Confluence.',
      ],
      stack: ['Jenkins', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Ansible', 'Linux'],
    },
  ],

  // `repo` is optional — cards without it are not links.
  projects: [
    {
      name: 'claude-devops-workflows',
      description: 'Claude skills embedded in GitHub Actions for automated pull-request review and AI-driven release management (changelogs, release notes, tagging).',
      tags: ['Claude', 'GitHub Actions', 'AI'],
      highlight: true,
    },
    {
      name: 'data-product-workbench',
      description: 'AI-based application for building and exploring data products, powered by Anthropic Claude, Google Gemini and Databricks.',
      tags: ['Anthropic', 'Gemini', 'Databricks'],
      highlight: true,
    },
    {
      name: 'openmetadata-on-eks',
      description: 'OpenMetadata deployed on Amazon EKS with Helm, plus Python automation for scheduled metadata ingestion across data sources.',
      tags: ['EKS', 'Helm', 'Python'],
    },
    {
      name: 'legacy-to-aws-migration',
      description: 'Migrated enterprise workloads from on-prem and Windows servers to AWS with minimal downtime and improved reliability.',
      tags: ['AWS', 'Migration', 'Terraform'],
    },
    {
      name: 'keyless-multicloud-cicd',
      description: 'Terraform + GitHub Actions pipelines that deploy to AWS, Azure and GCP with OIDC and Workload Identity Federation — no long-lived secrets.',
      tags: ['Terraform', 'OIDC', 'Multi-cloud'],
    },
    {
      name: 'gitops-delivery-platform',
      description: 'ArgoCD GitOps with standardized Helm charts, readiness/liveness probes and automated releases for consistent, auditable Kubernetes delivery.',
      tags: ['ArgoCD', 'Helm', 'Kubernetes'],
    },
  ],
};
