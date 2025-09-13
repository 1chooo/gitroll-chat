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
  countryCode: z.string().optional(),
});

// Language schema - LinkedIn typically returns language objects
const LanguageSchema = z.object({
  name: z.string(),
  proficiency: z.string().optional(),
});

// Logo schema for education and companies
const LogoSchema = z.object({
  url: z.url(),
  width: z.number(),
  height: z.number(),
});

// Education schema - Fixed URL handling
const EducationSchema = z.object({
  start: LinkedInDateSchema,
  end: LinkedInDateSchema,
  fieldOfStudy: z.string(),
  degree: z.string(),
  grade: z.string(),
  schoolName: z.string(),
  description: z.string(),
  activities: z.string(),
  // Fixed: Handle empty strings and invalid URLs
  url: z
    .string()
    .transform((val) => val === "" ? null : val)
    .pipe(z.url().nullable())
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => {
      if (!val || val === "") return null;
      try {
        new URL(val);
        return val;
      } catch {
        return null;
      }
    }),
  schoolId: z.string(),
  logo: z.array(LogoSchema).nullable().optional(),
});

// Position/Experience schema
const PositionSchema = z.object({
  companyId: z.number().optional(),
  companyName: z.string().optional(),
  companyUsername: z.string().optional(),
  // Fixed: Handle invalid URLs more gracefully
  companyURL: z
    .string()
    .transform((val) => val === "" ? null : val)
    .pipe(z.url().nullable())
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => {
      if (!val || val === "") return null;
      try {
        new URL(val);
        return val;
      } catch {
        return null;
      }
    })
    .optional(),
  companyLogo: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyStaffCountRange: z.string().optional(),
  title: z.string().optional(),
  multiLocaleTitle: z
    .object({
      en_US: z.string().optional(),
    })
    .optional(),
  multiLocaleCompanyName: z
    .object({
      en_US: z.string().optional(),
    })
    .optional(),
  location: z.string().optional(),
  locationType: z.string().optional(),
  description: z.string().optional(),
  employmentType: z.string().optional(),
  start: LinkedInDateSchema.optional(),
  end: LinkedInDateSchema.optional(),
});

// Skills schema
const SkillSchema = z.object({
  name: z.string(),
  passedSkillAssessment: z.boolean(),
  endorsementsCount: z.number().optional(),
});

// Course schema
const CourseSchema = z.object({
  name: z.string(),
  number: z.string(),
});

// Certification schema
const CertificationSchema = z.object({
  name: z.string(),
  start: LinkedInDateSchema.optional(),
  end: LinkedInDateSchema.optional(),
  authority: z.string().optional(),
  company: z.object({
    name: z.string(),
    universalName: z.string(),
    logo: z.string().optional(),
    staffCountRange: z.object({}).optional(),
    headquarter: z.object({}).optional(),
  }).optional(),
  timePeriod: z.object({
    start: LinkedInDateSchema.optional(),
    end: LinkedInDateSchema.optional(),
  }).optional(),
});

// Volunteering schema
const VolunteeringSchema = z.object({
  title: z.string(),
  start: LinkedInDateSchema.optional(),
  end: LinkedInDateSchema.optional(),
  companyName: z.string().optional(),
  CompanyId: z.string().optional(),
  companyUrl: z.url().optional(),
  companyLogo: z.string().optional(),
});

// Multi-locale schemas
const MultiLocaleStringSchema = z.object({
  en: z.string().optional(),
  en_US: z.string().optional(),
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

// Main LinkedIn profile schema - Updated to match the actual data structure
export const LinkedInProfileSchema = z.object({
  id: z.number().optional(),
  urn: z.string().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isPremium: z.boolean().optional(),
  isCreator: z.boolean().optional(),
  isOpenToWork: z.boolean(),
  isHiring: z.boolean(),
  isPrime: z.boolean().optional(),
  profilePicture: z.url().optional(),
  backgroundImage: z.array(BackgroundImageSchema).optional(),
  summary: z.string().optional(),
  headline: z.string().optional(),
  geo: GeoSchema.optional(),
  // Fixed languages schema - now accepts null, array of strings, or array of language objects
  languages: z
    .union([
      z.null(),
      z.array(z.string()),
      z.array(LanguageSchema),
    ])
    .optional(),
  educations: z.array(EducationSchema).optional(),
  position: z.array(PositionSchema).optional(),
  fullPositions: z.array(PositionSchema).optional(),
  skills: z.array(SkillSchema).nullable().optional(),
  givenRecommendation: z.null().optional(),
  givenRecommendationCount: z.number(),
  receivedRecommendation: z.null().optional(),
  receivedRecommendationCount: z.number(),
  courses: z.array(CourseSchema).nullable().optional(),
  certifications: z.array(CertificationSchema).nullable().optional(),
  honors: z.null().or(z.array(z.any())).optional(),
  projects: ProjectsSchema,
  volunteering: z.array(VolunteeringSchema).nullable().optional(),
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

// Validation response schema
export const ValidationResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    code: z.string(),
    format: z.string().optional(),
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })),
  rawData: LinkedInProfileSchema,
});

// Type exports
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type LinkedInProfileRequest = z.infer<typeof LinkedInProfileRequestSchema>;
export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;
export type LinkedInDate = z.infer<typeof LinkedInDateSchema>;
export type BackgroundImage = z.infer<typeof BackgroundImageSchema>;
export type Geo = z.infer<typeof GeoSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Volunteering = z.infer<typeof VolunteeringSchema>;

// Helper function to clean and validate LinkedIn profile data
export function cleanLinkedInProfileData(rawData: any): LinkedInProfile {
  // Pre-process the data to handle empty URL strings
  if (rawData.educations) {
    rawData.educations = rawData.educations.map((edu: any) => ({
      ...edu,
      url: edu.url === "" ? null : edu.url,
    }));
  }
  
  if (rawData.position) {
    rawData.position = rawData.position.map((pos: any) => ({
      ...pos,
      companyURL: pos.companyURL === "" ? null : pos.companyURL,
    }));
  }
  
  if (rawData.fullPositions) {
    rawData.fullPositions = rawData.fullPositions.map((pos: any) => ({
      ...pos,
      companyURL: pos.companyURL === "" ? null : pos.companyURL,
    }));
  }
  
  return LinkedInProfileSchema.parse(rawData);
}
