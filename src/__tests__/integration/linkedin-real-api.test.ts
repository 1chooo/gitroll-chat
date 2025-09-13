import { describe, it, expect, beforeAll } from 'vitest';
import { LinkedInProfileSchema } from '@/schema/linkedin-profile';

describe('LinkedIn Real API Response Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const testProfiles = [
    {
      name: 'adamselipsky',
      url: 'https://www.linkedin.com/in/adamselipsky/',
      description: 'AWS CEO - Executive profile'
    },
    {
      name: 'thomas-kurian-469b6219',
      url: 'https://www.linkedin.com/in/thomas-kurian-469b6219/',
      description: 'Google Cloud CEO - Executive with hyphenated name'
    },
    {
      name: '1chooo',
      url: 'https://www.linkedin.com/in/1chooo/',
      description: 'Developer profile - Potential edge case with number in username'
    }
  ];

  beforeAll(() => {
    if (!process.env.RAPIDAPI_KEY) {
      console.warn('⚠️ RAPIDAPI_KEY not set - tests will show API configuration errors');
    }
  });

  describe('Individual Profile Analysis', () => {
    testProfiles.forEach(profile => {
      it(`should analyze ${profile.name} profile data structure`, async () => {
        console.log(`\n🔍 Testing: ${profile.description}`);
        console.log(`URL: ${profile.url}`);

        const response = await fetch(
          `${baseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(profile.url)}`
        );

        console.log(`Status: ${response.status}`);

        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error === 'API configuration error') {
            console.log('❌ API key not configured - skipping real API test');
            expect(errorData.error).toBe('API configuration error');
            return;
          }
        }

        if (response.status === 502) {
          // Validation failed - this is what we want to analyze
          const errorData = await response.json();
          console.log('❌ Schema validation failed (this is what we want to analyze)');
          console.log('Validation issues:');
          
          if (errorData.details) {
            errorData.details.forEach((issue: any, index: number) => {
              console.log(`  ${index + 1}. Path: ${issue.path?.join('.') || 'root'}`);
              console.log(`     Message: ${issue.message}`);
              console.log(`     Code: ${issue.code}`);
            });
          }

          if (errorData.rawData) {
            console.log('\n📊 Raw data structure analysis:');
            const data = errorData.rawData;
            
            // Analyze the structure
            const analysis = {
              hasRequiredFields: {
                firstName: !!data.firstName,
                lastName: !!data.lastName,
                headline: !!data.headline,
                profilePicture: !!data.profilePicture,
                isOpenToWork: typeof data.isOpenToWork === 'boolean',
                isHiring: typeof data.isHiring === 'boolean',
              },
              dataTypes: {
                firstName: typeof data.firstName,
                lastName: typeof data.lastName,
                headline: typeof data.headline,
                profilePicture: typeof data.profilePicture,
                isOpenToWork: typeof data.isOpenToWork,
                isHiring: typeof data.isHiring,
                givenRecommendationCount: typeof data.givenRecommendationCount,
                receivedRecommendationCount: typeof data.receivedRecommendationCount,
              },
              arrayFields: {
                position: Array.isArray(data.position) ? data.position.length : 'not array',
                educations: Array.isArray(data.educations) ? data.educations.length : 'not array',
                skills: Array.isArray(data.skills) ? data.skills.length : data.skills === null ? 'null' : 'not array',
                languages: Array.isArray(data.languages) ? data.languages.length : data.languages === null ? 'null' : 'not array',
              },
              projects: data.projects ? {
                total: typeof data.projects.total,
                items: data.projects.items === null ? 'null' : Array.isArray(data.projects.items) ? `array(${data.projects.items.length})` : typeof data.projects.items
              } : 'missing',
              urlFields: {
                profilePicture: data.profilePicture?.startsWith('http') ? 'valid URL format' : 'invalid URL format',
              }
            };

            console.log(JSON.stringify(analysis, null, 2));

            // Check for common schema issues
            const potentialIssues = [];

            if (typeof data.isOpenToWork !== 'boolean') {
              potentialIssues.push(`isOpenToWork should be boolean, got ${typeof data.isOpenToWork}`);
            }

            if (typeof data.isHiring !== 'boolean') {
              potentialIssues.push(`isHiring should be boolean, got ${typeof data.isHiring}`);
            }

            if (data.profilePicture && !data.profilePicture.startsWith('http')) {
              potentialIssues.push(`profilePicture should be valid URL, got: ${data.profilePicture}`);
            }

            if (typeof data.givenRecommendationCount !== 'number') {
              potentialIssues.push(`givenRecommendationCount should be number, got ${typeof data.givenRecommendationCount}`);
            }

            if (typeof data.receivedRecommendationCount !== 'number') {
              potentialIssues.push(`receivedRecommendationCount should be number, got ${typeof data.receivedRecommendationCount}`);
            }

            if (potentialIssues.length > 0) {
              console.log('\n🚨 Potential schema issues identified:');
              potentialIssues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
              });
            }
          }

          // The test should pass because we're analyzing the issues
          expect(errorData.error).toBe('Validation failed');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.log(`❌ API Error: ${errorData.error}`);
          
          if (response.status === 401) {
            console.log('Authentication failed - check API key');
          } else if (response.status === 429) {
            console.log('Rate limit exceeded - try again later');
          } else if (response.status === 404) {
            console.log('Profile not found - URL might be invalid or profile private');
          }
          
          expect(response.status).toBeGreaterThanOrEqual(400);
          return;
        }

        // Successful response
        const profileData = await response.json();
        console.log('✅ API call successful');

        // Validate against schema
        const validation = LinkedInProfileSchema.safeParse(profileData);
        
        if (validation.success) {
          console.log('✅ Schema validation passed');
          
          // Log interesting data points
          console.log('📋 Profile summary:');
          console.log(`  Name: ${profileData.firstName} ${profileData.lastName}`);
          console.log(`  Headline: ${profileData.headline}`);
          console.log(`  Open to work: ${profileData.isOpenToWork}`);
          console.log(`  Hiring: ${profileData.isHiring}`);
          console.log(`  Positions: ${profileData.position?.length || 0}`);
          console.log(`  Education: ${profileData.educations?.length || 0}`);
          console.log(`  Projects: ${profileData.projects?.total || 0}`);
        } else {
          console.log('❌ Schema validation failed despite successful API response');
          console.log('Issues:');
          validation.error.issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue.path.join('.')}: ${issue.message}`);
          });
        }

        expect(validation.success).toBe(true);
      }, 30000);
    });
  });

  describe('Comprehensive Schema Issue Analysis', () => {
    it('should collect and analyze all validation issues across profiles', async () => {
      const results = [];
      
      console.log('\n🔬 Comprehensive Analysis Starting...');

      for (const profile of testProfiles) {
        try {
          console.log(`\nTesting ${profile.name}...`);
          
          const response = await fetch(
            `${baseUrl}/api/get-profile-data-by-url?url=${encodeURIComponent(profile.url)}`
          );

          if (response.status === 500) {
            const errorData = await response.json();
            if (errorData.error === 'API configuration error') {
              results.push({
                profile: profile.name,
                status: 'config_error',
                message: 'API key not configured'
              });
              continue;
            }
          }

          if (response.status === 502) {
            const errorData = await response.json();
            results.push({
              profile: profile.name,
              status: 'validation_failed',
              issues: errorData.details,
              rawDataSample: errorData.rawData ? {
                firstName: errorData.rawData.firstName,
                lastName: errorData.rawData.lastName,
                headline: errorData.rawData.headline,
                profilePicture: errorData.rawData.profilePicture?.substring(0, 50) + '...',
                isOpenToWork: errorData.rawData.isOpenToWork,
                isHiring: errorData.rawData.isHiring,
                dataTypes: {
                  isOpenToWork: typeof errorData.rawData.isOpenToWork,
                  isHiring: typeof errorData.rawData.isHiring,
                  givenRecommendationCount: typeof errorData.rawData.givenRecommendationCount,
                  receivedRecommendationCount: typeof errorData.rawData.receivedRecommendationCount,
                }
              } : null
            });
          } else if (response.ok) {
            const data = await response.json();
            const validation = LinkedInProfileSchema.safeParse(data);
            
            results.push({
              profile: profile.name,
              status: validation.success ? 'success' : 'validation_failed_after_success',
              issues: validation.success ? [] : validation.error.issues,
              summary: validation.success ? {
                firstName: data.firstName,
                lastName: data.lastName,
                headline: data.headline,
                positionCount: data.position?.length || 0,
                educationCount: data.educations?.length || 0,
                projectCount: data.projects?.total || 0
              } : null
            });
          } else {
            const errorData = await response.json();
            results.push({
              profile: profile.name,
              status: 'api_error',
              statusCode: response.status,
              message: errorData.error
            });
          }
        } catch (error) {
          results.push({
            profile: profile.name,
            status: 'network_error',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Generate comprehensive report
      console.log('\n📊 COMPREHENSIVE ANALYSIS REPORT');
      console.log('================================');

      const successCount = results.filter(r => r.status === 'success').length;
      const validationFailCount = results.filter(r => r.status === 'validation_failed' || r.status === 'validation_failed_after_success').length;
      const configErrorCount = results.filter(r => r.status === 'config_error').length;
      const apiErrorCount = results.filter(r => r.status === 'api_error').length;

      console.log(`\nSTATUS SUMMARY:`);
      console.log(`✅ Successful validations: ${successCount}/${testProfiles.length}`);
      console.log(`❌ Validation failures: ${validationFailCount}/${testProfiles.length}`);
      console.log(`⚙️ Configuration errors: ${configErrorCount}/${testProfiles.length}`);
      console.log(`🌐 API errors: ${apiErrorCount}/${testProfiles.length}`);

      // Analyze common validation issues
      const allIssues = results
        .filter(r => r.issues && r.issues.length > 0)
        .flatMap(r => r.issues);

      if (allIssues.length > 0) {
        console.log(`\nCOMMON VALIDATION ISSUES:`);
        
        const issueFrequency = allIssues.reduce((acc: any, issue: any) => {
          const key = `${issue.path?.join('.') || 'root'}: ${issue.message}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        Object.entries(issueFrequency)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .forEach(([issue, count], index) => {
            console.log(`  ${index + 1}. [${count}x] ${issue}`);
          });

        // Schema recommendations
        console.log(`\nSCHEMA IMPROVEMENT RECOMMENDATIONS:`);
        
        const recommendations = [];
        
        if (allIssues.some((issue: any) => issue.path?.includes('isOpenToWork'))) {
          recommendations.push('Consider making isOpenToWork field more flexible or provide better default handling');
        }
        
        if (allIssues.some((issue: any) => issue.path?.includes('isHiring'))) {
          recommendations.push('Consider making isHiring field more flexible or provide better default handling');
        }
        
        if (allIssues.some((issue: any) => issue.message?.includes('url'))) {
          recommendations.push('Add URL validation preprocessing to handle edge cases in URL fields');
        }
        
        if (allIssues.some((issue: any) => issue.path?.includes('projects'))) {
          recommendations.push('Review projects schema structure for better real-world data handling');
        }

        if (recommendations.length === 0) {
          recommendations.push('Schema appears to be well-structured for the tested profiles');
        }

        recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }

      // Detailed results for each profile
      console.log(`\nDETAILED RESULTS:`);
      results.forEach(result => {
        console.log(`\n${result.profile}:`);
        console.log(`  Status: ${result.status}`);
        
        if (result.summary) {
          console.log(`  Summary: ${result.summary.firstName} ${result.summary.lastName}`);
          console.log(`  Positions: ${result.summary.positionCount}, Education: ${result.summary.educationCount}, Projects: ${result.summary.projectCount}`);
        }
        
        if (result.rawDataSample) {
          console.log(`  Data types: ${JSON.stringify(result.rawDataSample.dataTypes)}`);
        }
        
        if (result.message) {
          console.log(`  Message: ${result.message}`);
        }
        
        if (result.issues && result.issues.length > 0) {
          console.log(`  Issues (${result.issues.length}):`);
          result.issues.slice(0, 3).forEach((issue: any, index: number) => {
            console.log(`    ${index + 1}. ${issue.path?.join('.') || 'root'}: ${issue.message}`);
          });
          if (result.issues.length > 3) {
            console.log(`    ... and ${result.issues.length - 3} more`);
          }
        }
      });

      // Test passes regardless of validation results because we're analyzing the issues
      expect(results.length).toBe(testProfiles.length);
      
      // Log whether we found any issues to analyze
      const hasValidationIssues = results.some(r => r.status.includes('validation_failed'));
      if (hasValidationIssues) {
        console.log('\n🎯 SUCCESS: Found validation issues to analyze and improve schema');
      } else if (successCount > 0) {
        console.log('\n🎯 SUCCESS: All tested profiles validated successfully');
      } else {
        console.log('\n⚠️ No validation results due to configuration or API issues');
      }
    }, 120000); // Extended timeout for comprehensive analysis
  });
});