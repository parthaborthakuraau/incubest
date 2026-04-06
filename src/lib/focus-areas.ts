// Predefined focus areas for incubation programs
// Incubators can pick from this list + add custom ones

export const FOCUS_AREAS: { category: string; areas: string[] }[] = [
  {
    category: "Agriculture & Allied",
    areas: [
      "Agriculture", "Horticulture", "Dairy", "Fisheries", "Poultry",
      "Organic Farming", "Agri-Processing", "Farm Mechanization",
      "Seed Technology", "Soil Health", "Irrigation", "Animal Husbandry",
    ],
  },
  {
    category: "Energy & Environment",
    areas: [
      "Clean Energy", "Solar", "Wind", "Biomass", "Waste Management",
      "Water Treatment", "Carbon Credits", "Climate Tech", "Sustainability",
      "Electric Vehicles", "Green Hydrogen",
    ],
  },
  {
    category: "Healthcare & Life Sciences",
    areas: [
      "Healthcare", "Biotech", "Pharma", "Medical Devices", "Diagnostics",
      "Telemedicine", "Mental Health", "Public Health", "Nutrition",
      "Ayurveda & Traditional Medicine",
    ],
  },
  {
    category: "Technology",
    areas: [
      "AI / ML", "IoT", "Blockchain", "Cybersecurity", "Cloud Computing",
      "AR / VR", "Robotics", "Drones", "3D Printing", "Quantum Computing",
      "SaaS", "Deep Tech",
    ],
  },
  {
    category: "Education & Skill Development",
    areas: [
      "EdTech", "Skill Development", "Vocational Training", "STEM Education",
      "Online Learning", "Language Learning", "Special Education",
    ],
  },
  {
    category: "Financial Services",
    areas: [
      "FinTech", "Digital Payments", "InsurTech", "Lending",
      "Wealth Management", "Micro-Finance", "Rural Banking",
    ],
  },
  {
    category: "Social Impact",
    areas: [
      "Rural Development", "Women Empowerment", "Tribal Welfare",
      "Disability", "Affordable Housing", "Sanitation", "Livelihood",
      "Social Enterprise", "Inclusive Growth",
    ],
  },
  {
    category: "Manufacturing & Industry",
    areas: [
      "Manufacturing", "Textiles", "Handloom", "Handicrafts",
      "Food Processing", "Packaging", "Supply Chain", "Logistics",
      "Defense & Aerospace",
    ],
  },
  {
    category: "Others",
    areas: [
      "E-Commerce", "Travel & Tourism", "Sports Tech", "Media & Entertainment",
      "Legal Tech", "PropTech", "FoodTech", "Retail Tech", "GovTech",
    ],
  },
];

export const ALL_FOCUS_AREAS = FOCUS_AREAS.flatMap((c) => c.areas);
