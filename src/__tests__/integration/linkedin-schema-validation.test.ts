import { describe, it, expect } from 'vitest';
import { LinkedInProfileSchema } from '@/schema/linkedin-profile';

describe('LinkedIn Schema Validation Tests', () => {
  describe('Required Fields Validation', () => {
    it('should validate minimal required profile data', () => {
      const minimalProfile = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: {
          total: 0,
          items: null
        }
      };

      const result = LinkedInProfileSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
    });

    it('should fail when required fields are missing', () => {
      const incompleteProfile = {
        firstName: 'John',
        // lastName missing
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
      };

      const result = LinkedInProfileSchema.safeParse(incompleteProfile);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const missingFields = result.error.issues.map(issue => issue.path.join('.'));
        console.log('Missing required fields:', missingFields);
      }
    });
  });

  describe('URL Validation', () => {
    it('should validate proper URLs in profilePicture field', () => {
      const profileWithValidUrl = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://media.licdn.com/dms/image/profile.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null }
      };

      const result = LinkedInProfileSchema.safeParse(profileWithValidUrl);
      expect(result.success).toBe(true);
    });
  });

  describe('Optional Field Handling', () => {
    it('should handle null values in optional array fields', () => {
      const profileWithNulls = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        languages: null,
        skills: null,
        courses: null,
        certifications: null,
        honors: null,
        volunteering: null,
      };

      const result = LinkedInProfileSchema.safeParse(profileWithNulls);
      expect(result.success).toBe(true);
    });

    it('should handle undefined values in optional fields', () => {
      const profileWithUndefined = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        // Optional fields are undefined (not included)
      };

      const result = LinkedInProfileSchema.safeParse(profileWithUndefined);
      expect(result.success).toBe(true);
    });
  });

  describe('Position Schema Validation', () => {
    it('should validate position with all optional fields', () => {
      const profileWithPosition = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        position: [{
          companyName: 'Tech Corp',
          companyUsername: 'techcorp',
          companyURL: 'https://techcorp.com',
          companyLogo: 'https://techcorp.com/logo.png',
          companyIndustry: 'Technology',
          companyStaffCountRange: '1001-5000',
          title: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          description: 'Working on awesome products',
          employmentType: 'Full-time',
          start: { year: 2022, month: 1, day: 15 },
          end: { year: 2024, month: 6, day: 30 }
        }]
      };

      const result = LinkedInProfileSchema.safeParse(profileWithPosition);
      expect(result.success).toBe(true);
    });

    it('should handle position with minimal fields', () => {
      const profileWithMinimalPosition = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        position: [{}] // Empty position object - all fields are optional
      };

      const result = LinkedInProfileSchema.safeParse(profileWithMinimalPosition);
      expect(result.success).toBe(true);
    });

  });

  describe('Date Schema Validation', () => {
    it('should validate proper date objects', () => {
      const profileWithDates = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        educations: [{
          start: { year: 2018, month: 9, day: 1 },
          end: { year: 2022, month: 5, day: 31 },
          fieldOfStudy: 'Computer Science',
          degree: 'Bachelor',
          grade: 'A',
          schoolName: 'University of Technology',
          description: 'Studied computer science',
          activities: 'Programming club',
          url: 'https://university.edu',
          schoolId: 'univ-tech-123'
        }]
      };

      const result = LinkedInProfileSchema.safeParse(profileWithDates);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const profileWithInvalidDate = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        educations: [{
          start: { year: '2018', month: 9, day: 1 }, // year as string should fail
          end: { year: 2022, month: 5, day: 31 },
          fieldOfStudy: 'Computer Science',
          degree: 'Bachelor',
          grade: 'A',
          schoolName: 'University of Technology',
          description: 'Studied computer science',
          activities: 'Programming club',
          url: 'https://university.edu',
          schoolId: 'univ-tech-123'
        }]
      };

      const result = LinkedInProfileSchema.safeParse(profileWithInvalidDate);
      expect(result.success).toBe(false);
    });
  });

  describe('MultiLocale Field Validation', () => {
    it('should handle multiLocale fields with optional en property', () => {
      const profileWithMultiLocale = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        multiLocaleFirstName: { en: 'John' },
        multiLocaleLastName: { en: 'Doe' },
        multiLocaleHeadline: { en: 'Software Engineer' },
        position: [{
          multiLocaleTitle: { en_US: 'Software Engineer' },
          multiLocaleCompanyName: { en_US: 'Tech Corp' }
        }]
      };

      const result = LinkedInProfileSchema.safeParse(profileWithMultiLocale);
      expect(result.success).toBe(true);
    });

    it('should handle empty multiLocale objects', () => {
      const profileWithEmptyMultiLocale = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null },
        multiLocaleFirstName: {}, // Empty object should be valid
        multiLocaleLastName: {},
        multiLocaleHeadline: {}
      };

      const result = LinkedInProfileSchema.safeParse(profileWithEmptyMultiLocale);
      expect(result.success).toBe(true);
    });
  });

  describe('Projects Schema Validation', () => {
    it('should validate projects with total and null items', () => {
      const profileWithProjects = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: {
          total: 5,
          items: null
        }
      };

      const result = LinkedInProfileSchema.safeParse(profileWithProjects);
      expect(result.success).toBe(true);
    });

    it('should validate projects with array items', () => {
      const profileWithProjectItems = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: false,
        isHiring: false,
        givenRecommendationCount: 0,
        receivedRecommendationCount: 0,
        projects: {
          total: 2,
          items: [
            { name: 'Project 1', description: 'A cool project' },
            { name: 'Project 2', description: 'Another project' }
          ]
        }
      };

      const result = LinkedInProfileSchema.safeParse(profileWithProjectItems);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases and Real-World Scenarios', () => {
    it('should handle profiles with missing optional nested objects', () => {
      const realWorldProfile = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer at Tech Corp',
        profilePicture: 'https://media.licdn.com/dms/image/xyz/profile.jpg',
        isOpenToWork: true,
        isHiring: false,
        givenRecommendationCount: 3,
        receivedRecommendationCount: 7,
        projects: { total: 0, items: null },
        // Some fields might be present but empty
        position: [],
        educations: [],
        // Some might be null
        skills: null,
        languages: null,
        // Some might be missing entirely (undefined)
      };

      const result = LinkedInProfileSchema.safeParse(realWorldProfile);
      expect(result.success).toBe(true);
    });

    it('should handle profiles with inconsistent data types', () => {
      // This simulates potential data type issues from the API
      const inconsistentProfile = {
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        profilePicture: 'https://example.com/photo.jpg',
        isOpenToWork: 'true', // String instead of boolean
        isHiring: false,
        givenRecommendationCount: '5', // String instead of number
        receivedRecommendationCount: 0,
        projects: { total: 0, items: null }
      };

      const result = LinkedInProfileSchema.safeParse(inconsistentProfile);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        console.log('Type validation errors:', result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        })));
      }
    });
  });
});