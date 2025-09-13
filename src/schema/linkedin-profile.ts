import { z } from "zod";

// Date schema for LinkedIn profile dates
const LinkedInDateSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
});

// Background image schema
const BackgroundImageSchema = z.object({
  width: z.number(),
  height: z.number(),
  url: z.url(),
});

// Geo location schema
const GeoSchema = z.object({
  country: z.string(),
  city: z.string(),
  full: z.string(),
});

// Education schema
const EducationSchema = z.object({
  start: LinkedInDateSchema,
  end: LinkedInDateSchema,
  fieldOfStudy: z.string(),
  degree: z.string(),
  grade: z.string(),
  schoolName: z.string(),
  description: z.string(),
  activities: z.string(),
  url: z.url(),
  schoolId: z.string(),
});

// Position/Experience schema
const PositionSchema = z.object({
  companyName: z.string().optional(),
  companyUsername: z.string().optional(),
  companyURL: z.string().url().optional(),
  companyLogo: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyStaffCountRange: z.string().optional(),
  title: z.string().optional(),
  multiLocaleTitle: z
    .object({
      en_US: z.string().optional(),  // <-- was required
    })
    .optional(),
  multiLocaleCompanyName: z
    .object({
      en_US: z.string().optional(),  // <-- was required
    })
    .optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  employmentType: z.string().optional(),
  start: LinkedInDateSchema.optional(),
  end: LinkedInDateSchema.optional(),
});

// Multi-locale schemas
const MultiLocaleStringSchema = z.object({
  en: z.string().optional(), // <-- safe against missing
});

// Projects schema
const ProjectsSchema = z.object({
  total: z.number(),
  items: z.null().or(z.array(z.any())).optional(),
});

// Supported locales schema
const SupportedLocaleSchema = z.object({
  country: z.string(),
  language: z.string(),
});

// Main LinkedIn profile schema
export const LinkedInProfileSchema = z.object({
  urn: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  isCreator: z.boolean().optional(),
  isOpenToWork: z.boolean(),
  isHiring: z.boolean(),
  isPrime: z.boolean().optional(),
  profilePicture: z.url(),
  backgroundImage: z.array(BackgroundImageSchema).optional(),
  summary: z.string().optional(),
  headline: z.string(),
  geo: GeoSchema.optional(),
  languages: z.null().or(z.array(z.string())).optional(),
  educations: z.array(EducationSchema).optional(),
  position: z.array(PositionSchema).optional(),
  fullPositions: z.array(PositionSchema).optional(),
  skills: z.null().or(z.array(z.any())).optional(),
  givenRecommendation: z.null().optional(),
  givenRecommendationCount: z.number(),
  receivedRecommendation: z.null().optional(),
  receivedRecommendationCount: z.number(),
  courses: z.null().or(z.array(z.any())).optional(),
  certifications: z.null().or(z.array(z.any())).optional(),
  honors: z.null().or(z.array(z.any())).optional(),
  projects: ProjectsSchema,
  volunteering: z.null().or(z.array(z.any())).optional(),
  supportedLocales: z.array(SupportedLocaleSchema).optional(),
  multiLocaleFirstName: MultiLocaleStringSchema.optional(),
  multiLocaleLastName: MultiLocaleStringSchema.optional(),
  multiLocaleHeadline: MultiLocaleStringSchema.optional(),
});

// Request validation schema
export const LinkedInProfileRequestSchema = z.object({
  url: z
    .url()
    .refine((url) => url.includes("linkedin.com/in/"), {
      message: "URL must be a valid LinkedIn profile URL",
    }),
});

// Type exports
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type LinkedInProfileRequest = z.infer<
  typeof LinkedInProfileRequestSchema
>;
export type LinkedInDate = z.infer<typeof LinkedInDateSchema>;
export type BackgroundImage = z.infer<typeof BackgroundImageSchema>;
export type Geo = z.infer<typeof GeoSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;
