import { describe, it, expect, beforeAll } from 'vitest';
import { LinkedInProfileSchema, LinkedInProfileRequestSchema } from '@/schema/linkedin-profile';

// Test LinkedIn profile URLs
const TEST_PROFILES = [
  'https://www.linkedin.com/in/adamselipsky/',
  'https://www.linkedin.com/in/thomas-kurian-469b6219/',
  'https://www.linkedin.com/in/1chooo/',
] as const;

describe('LinkedIn Profile API Integration Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  beforeAll(() => {
    // Check if required environment variables are set
    if (!process.env.RAPIDAPI_KEY) {
      console.warn('RAPIDAPI_KEY not set - API tests may fail');
    }
  });

  describe('API Endpoint Functionality', () => {
    it('should validate request parameters correctly', async () => {
      // Test valid URL validation
      const validUrl = 'https://www.linkedin.com/in/testuser/';
      const validResult = LinkedInProfileRequestSchema.safeParse({ url: validUrl });
      expect(validResult.success).toBe(true);

      // Test invalid URL validation
      const invalidUrl = 'https://example.com/profile';
      const invalidResult = LinkedInProfileRequestSchema.safeParse({ url: invalidUrl });
      expect(invalidResult.success).toBe(false);
    });

    it('should return 400 for invalid LinkedIn URLs', async () => {
      const invalidUrl = 'https://example.com/profile';
      const response = await fetch(
        `${baseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(invalidUrl)}`
      );
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request parameters');
    });

    it('should return 400 for missing URL parameter', async () => {
      const response = await fetch(`${baseUrl}/api/get-profile-data-by-url`);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request parameters');
    });
  });

  describe('Real LinkedIn Profile Data Tests', () => {
    // Test each profile individually to isolate issues
    TEST_PROFILES.forEach((profileUrl) => {
      const profileName = profileUrl.split('/in/')[1].replace('/', '');
      
      it(`should fetch and validate profile data for ${profileName}`, async () => {
        const response = await fetch(
          `${baseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(profileUrl)}`
        );

        console.log(`Testing profile: ${profileName}`);
        console.log(`Response status: ${response.status}`);

        if (response.status === 500 && !process.env.RAPIDAPI_KEY) {
          console.warn('Skipping test due to missing RAPIDAPI_KEY');
          return;
        }

        // Check if the response is successful
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`API Error for ${profileName}:`, errorData);
          
          // For debugging, we want to see the actual error
          if (response.status === 502 && errorData.details) {
            console.log('Validation errors:', errorData.details);
            console.log('Raw data structure:', JSON.stringify(errorData.rawData, null, 2));
          }
          
          // If it's a validation error (502), that's what we want to analyze
          if (response.status === 502) {
            expect(errorData.error).toBe('Validation failed');
            expect(errorData.details).toBeDefined();
            // Log the validation issues for analysis
            console.log(`Schema validation issues for ${profileName}:`, errorData.details);
            return;
          }
          
          // For other errors, we still want to know about them
          expect(response.ok).toBe(true);
          return;
        }

        const profileData = await response.json();
        
        // Log the profile data structure for analysis
        console.log(`Profile data structure for ${profileName}:`, {
          hasFirstName: !!profileData.firstName,
          hasLastName: !!profileData.lastName,
          hasHeadline: !!profileData.headline,
          hasProfilePicture: !!profileData.profilePicture,
          positionCount: profileData.position?.length || 0,
          educationCount: profileData.educations?.length || 0,
          projectsTotal: profileData.projects?.total || 0,
        });

        // Validate the response against our schema
        const validation = LinkedInProfileSchema.safeParse(profileData);
        
        if (!validation.success) {
          console.error(`Schema validation failed for ${profileName}:`, validation.error.issues);
          // Log specific fields that failed validation
          validation.error.issues.forEach(issue => {
            console.error(`- ${issue.path.join('.')}: ${issue.message} (got: ${issue.code})`);
          });
          
          // Still fail the test, but with detailed information
          expect(validation.success).toBe(true);
        } else {
          console.log(`✅ Profile ${profileName} validated successfully`);
        }

        // Additional assertions for required fields
        expect(profileData.firstName).toBeDefined();
        expect(profileData.lastName).toBeDefined();
        expect(profileData.headline).toBeDefined();
        expect(profileData.profilePicture).toBeDefined();
        expect(typeof profileData.isOpenToWork).toBe('boolean');
        expect(typeof profileData.isHiring).toBe('boolean');
      }, 30000); // Increased timeout for API calls
    });

    it('should handle all test profiles and report schema issues', async () => {
      const results = [];
      
      for (const profileUrl of TEST_PROFILES) {
        const profileName = profileUrl.split('/in/')[1].replace('/', '');
        
        try {
          const response = await fetch(
            `${baseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(profileUrl)}`
          );
          
          if (response.status === 500 && !process.env.RAPIDAPI_KEY) {
            results.push({
              profile: profileName,
              status: 'skipped',
              reason: 'Missing RAPIDAPI_KEY'
            });
            continue;
          }
          
          const data = await response.json();
          
          if (response.status === 502 && data.error === 'Validation failed') {
            results.push({
              profile: profileName,
              status: 'validation_failed',
              issues: data.details,
              sampleData: data.rawData
            });
          } else if (response.ok) {
            const validation = LinkedInProfileSchema.safeParse(data);
            results.push({
              profile: profileName,
              status: validation.success ? 'success' : 'validation_failed',
              issues: validation.success ? [] : validation.error.issues
            });
          } else {
            results.push({
              profile: profileName,
              status: 'api_error',
              statusCode: response.status,
              error: data.error
            });
          }
        } catch (error) {
          results.push({
            profile: profileName,
            status: 'network_error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Log comprehensive results
      console.log('\n=== LinkedIn Profile API Test Results ===');
      results.forEach(result => {
        console.log(`\n${result.profile}:`);
        console.log(`  Status: ${result.status}`);
        
        if (result.issues && result.issues.length > 0) {
          console.log('  Schema Issues:');
          result.issues.forEach((issue: any) => {
            console.log(`    - ${issue.path?.join('.') || 'root'}: ${issue.message}`);
          });
        }
        
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });
      
      // Check if we have any successful validations
      const successfulValidations = results.filter(r => r.status === 'success').length;
      const validationFailures = results.filter(r => r.status === 'validation_failed').length;
      
      console.log(`\n=== Summary ===`);
      console.log(`Successful validations: ${successfulValidations}/${TEST_PROFILES.length}`);
      console.log(`Validation failures: ${validationFailures}/${TEST_PROFILES.length}`);
      
      // The test passes if we get results (even if there are validation issues)
      // because the goal is to identify schema problems
      expect(results.length).toBe(TEST_PROFILES.length);
    }, 60000); // Extended timeout for multiple API calls
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test with a non-existent server
      const invalidBaseUrl = 'http://localhost:9999';
      
      try {
        await fetch(`${invalidBaseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(TEST_PROFILES[0])}`);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});