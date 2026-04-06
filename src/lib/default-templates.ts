// Default report templates for common Indian incubation programs

export interface TemplateField {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "date" | "checkbox";
  required: boolean;
  options?: string[];
}

export interface DefaultTemplate {
  name: string;
  description: string;
  grantor: string;
  fields: TemplateField[];
}

export const DEFAULT_TEMPLATES: Record<string, DefaultTemplate[]> = {
  AIM: [
    {
      name: "AIM Monthly Progress Report",
      description: "Standard monthly reporting format for Atal Incubation Centres",
      grantor: "AIM",
      fields: [
        { name: "revenue", label: "Monthly Revenue (INR)", type: "number", required: true },
        { name: "employees_count", label: "Total Employees", type: "number", required: true },
        { name: "new_hires", label: "New Hires This Month", type: "number", required: true },
        { name: "customers_count", label: "Total Customers/Users", type: "number", required: true },
        { name: "funding_raised", label: "Funding Raised This Month (INR)", type: "number", required: false },
        { name: "funding_source", label: "Funding Source", type: "text", required: false },
        { name: "patents_filed", label: "Patents Filed This Month", type: "number", required: false },
        { name: "product_updates", label: "Key Product Updates", type: "textarea", required: true },
        { name: "mentoring_sessions", label: "Mentoring Sessions Attended", type: "number", required: true },
        { name: "events_attended", label: "Events/Workshops Attended", type: "number", required: false },
        { name: "social_impact", label: "Social Impact / Beneficiaries", type: "textarea", required: false },
        { name: "challenges", label: "Key Challenges", type: "textarea", required: true },
        { name: "support_needed", label: "Support Needed from Incubator", type: "textarea", required: false },
        { name: "dpiit_recognized", label: "DPIIT Recognized", type: "checkbox", required: false },
      ],
    },
    {
      name: "AIM Quarterly Review",
      description: "Quarterly review template for AIM grantors",
      grantor: "AIM",
      fields: [
        { name: "quarterly_revenue", label: "Quarterly Revenue (INR)", type: "number", required: true },
        { name: "quarterly_growth", label: "Revenue Growth (%)", type: "number", required: true },
        { name: "total_employees", label: "Total Employees (end of quarter)", type: "number", required: true },
        { name: "total_funding", label: "Cumulative Funding Raised (INR)", type: "number", required: true },
        { name: "key_milestones", label: "Key Milestones Achieved", type: "textarea", required: true },
        { name: "market_traction", label: "Market Traction / Key Wins", type: "textarea", required: true },
        { name: "ip_status", label: "IP Status (patents/trademarks)", type: "textarea", required: false },
        { name: "next_quarter_goals", label: "Goals for Next Quarter", type: "textarea", required: true },
      ],
    },
  ],

  DST: [
    {
      name: "DST-NIDHI Monthly Report",
      description: "Monthly reporting for DST NIDHI-supported incubators",
      grantor: "DST",
      fields: [
        { name: "revenue", label: "Monthly Revenue (INR)", type: "number", required: true },
        { name: "employees", label: "Total Employment Generated", type: "number", required: true },
        { name: "direct_jobs", label: "Direct Jobs Created", type: "number", required: true },
        { name: "indirect_jobs", label: "Indirect Jobs Created", type: "number", required: false },
        { name: "funding_raised", label: "External Funding Raised (INR)", type: "number", required: false },
        { name: "grant_utilized", label: "Seed Fund Utilized (INR)", type: "number", required: false },
        { name: "technology_status", label: "Technology Readiness Level (1-9)", type: "number", required: true },
        { name: "product_stage", label: "Product Stage", type: "select", required: true, options: ["Concept", "Prototype", "MVP", "Market-ready", "Scaling"] },
        { name: "women_employment", label: "Women Employed", type: "number", required: false },
        { name: "rural_impact", label: "Rural Area Impact (beneficiaries)", type: "number", required: false },
        { name: "publications", label: "Research Publications", type: "number", required: false },
        { name: "progress_summary", label: "Monthly Progress Summary", type: "textarea", required: true },
      ],
    },
  ],

  RKVY: [
    {
      name: "RKVY-RAFTAAR Monthly Report",
      description: "Monthly reporting for RKVY-RAFTAAR agri-startups",
      grantor: "RKVY",
      fields: [
        { name: "revenue", label: "Monthly Revenue (INR)", type: "number", required: true },
        { name: "farmers_impacted", label: "Farmers Impacted", type: "number", required: true },
        { name: "villages_covered", label: "Villages Covered", type: "number", required: false },
        { name: "employees", label: "Total Employees", type: "number", required: true },
        { name: "women_employees", label: "Women Employees", type: "number", required: false },
        { name: "agri_output", label: "Agricultural Output Improved (tonnes/hectares)", type: "text", required: false },
        { name: "funding_raised", label: "Funding Raised (INR)", type: "number", required: false },
        { name: "grant_utilized", label: "RKVY Grant Utilized (INR)", type: "number", required: true },
        { name: "product_updates", label: "Product/Technology Updates", type: "textarea", required: true },
        { name: "market_linkages", label: "Market Linkages Established", type: "number", required: false },
        { name: "fpo_partnerships", label: "FPO/FPC Partnerships", type: "number", required: false },
        { name: "challenges", label: "Key Challenges", type: "textarea", required: true },
      ],
    },
  ],

  DPIIT: [
    {
      name: "DPIIT Startup Monthly Report",
      description: "Monthly reporting for DPIIT-recognized startups",
      grantor: "DPIIT",
      fields: [
        { name: "revenue", label: "Monthly Revenue (INR)", type: "number", required: true },
        { name: "employees", label: "Total Employees", type: "number", required: true },
        { name: "customers", label: "Total Customers", type: "number", required: true },
        { name: "funding_raised", label: "Funding Raised This Month (INR)", type: "number", required: false },
        { name: "exports", label: "Export Revenue (INR)", type: "number", required: false },
        { name: "ip_filed", label: "IP Applications Filed", type: "number", required: false },
        { name: "progress", label: "Key Progress", type: "textarea", required: true },
        { name: "compliance_status", label: "Regulatory Compliance Status", type: "textarea", required: false },
      ],
    },
  ],

  BIRAC: [
    {
      name: "BIRAC Monthly Report",
      description: "Monthly reporting for BIRAC-supported biotech startups",
      grantor: "BIRAC",
      fields: [
        { name: "revenue", label: "Monthly Revenue (INR)", type: "number", required: true },
        { name: "employees", label: "Total Employees", type: "number", required: true },
        { name: "research_spend", label: "R&D Expenditure (INR)", type: "number", required: true },
        { name: "clinical_stage", label: "Clinical/Trial Stage", type: "text", required: false },
        { name: "patents_filed", label: "Patents Filed", type: "number", required: false },
        { name: "publications", label: "Publications", type: "number", required: false },
        { name: "regulatory_approvals", label: "Regulatory Approvals Obtained", type: "text", required: false },
        { name: "grant_utilized", label: "Grant Amount Utilized (INR)", type: "number", required: true },
        { name: "progress", label: "Technical Progress Summary", type: "textarea", required: true },
        { name: "collaborations", label: "New Collaborations/Partnerships", type: "textarea", required: false },
      ],
    },
  ],
};

// Get templates for a given program type
export function getDefaultTemplates(programType: string): DefaultTemplate[] {
  return DEFAULT_TEMPLATES[programType] || [];
}
