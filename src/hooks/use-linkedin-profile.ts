import useSWR from "swr";
import type { LinkedInProfile } from "@/schema/linkedin-profile";
import type { LinkedInProfileApiError } from "@/app/api/get-profile-data-by-url/route";

// Fetcher function for SWR
const fetcher = async (url: string): Promise<LinkedInProfile> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData: LinkedInProfileApiError = await response.json();
    const error = new Error(
      errorData.error || "An error occurred while fetching the profile",
    );

    // Attach additional error information
    (error as any).status = response.status;
    (error as any).details = errorData.details;

    throw error;
  }

  return response.json();
};

// SWR configuration options
interface UseLinkedInProfileOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
}

// Custom hook for LinkedIn profile data
export function useLinkedInProfile(
  linkedinUrl: string | null | undefined,
  options: UseLinkedInProfileOptions = {},
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval = 0, // Don't auto-refresh by default
    errorRetryCount = 3,
    errorRetryInterval = 5000,
  } = options;

  // Create the API URL
  const apiUrl = linkedinUrl
    ? `/api/get-profile-data-by-url?url=${encodeURIComponent(linkedinUrl)}`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    LinkedInProfile,
    Error
  >(apiUrl, fetcher, {
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    dedupingInterval: 3600000, // Cache data for 1 hour
    errorRetryCount,
    errorRetryInterval,
  });

  return {
    profile: data,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
    // Helper methods
    refetch: () => mutate(),
    reset: () => mutate(undefined, false),
  };
}

// Hook for multiple LinkedIn profiles - FIXED VERSION
export function useLinkedInProfiles(
  linkedinUrls: string[],
  options: UseLinkedInProfileOptions = {},
) {
  // Create a single SWR key for all URLs combined
  const combinedKey = linkedinUrls.length > 0 
    ? `linkedin-profiles:${linkedinUrls.join('|')}` 
    : null;

  // Custom fetcher that handles multiple URLs
  const multiProfileFetcher = async (key: string): Promise<LinkedInProfile[]> => {
    const urls = key.split(':')[1].split('|');
    const promises = urls.map(url => {
      const apiUrl = `/api/get-profile-data-by-url?url=${encodeURIComponent(url)}`;
      return fetcher(apiUrl);
    });
    
    // Use Promise.allSettled to handle individual failures
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Return error information in a structured way
        throw new Error(`Failed to fetch profile for URL ${urls[index]}: ${result.reason.message}`);
      }
    });
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    LinkedInProfile[],
    Error
  >(combinedKey, multiProfileFetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    refreshInterval: options.refreshInterval ?? 0,
    dedupingInterval: 3600000,
    errorRetryCount: options.errorRetryCount ?? 3,
    errorRetryInterval: options.errorRetryInterval ?? 5000,
  });

  return {
    profiles: data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    hasData: !!data && data.length === linkedinUrls.length,
    refetchAll: () => mutate(),
    resetAll: () => mutate(undefined, false),
  };
}

// Alternative approach: Hook for multiple profiles with individual error handling
export function useLinkedInProfilesIndividual(
  linkedinUrls: string[],
  options: UseLinkedInProfileOptions = {},
) {
  // Create individual SWR keys for each URL
  const keys = linkedinUrls.map(url => 
    url ? `/api/get-profile-data-by-url?url=${encodeURIComponent(url)}` : null
  );

  // Use a single SWR call with a custom fetcher that handles multiple keys
  const multiKeyFetcher = async (): Promise<(LinkedInProfile | null)[]> => {
    const promises = keys.map(async (key) => {
      if (!key) return null;
      try {
        return await fetcher(key);
      } catch (error) {
        console.warn(`Failed to fetch profile for ${key}:`, error);
        return null; // Return null for failed requests instead of throwing
      }
    });
    
    return Promise.all(promises);
  };

  const combinedKey = keys.filter(Boolean).length > 0 
    ? `linkedin-profiles-individual:${keys.filter(Boolean).join('|')}` 
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    (LinkedInProfile | null)[],
    Error
  >(combinedKey, multiKeyFetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    refreshInterval: options.refreshInterval ?? 0,
    dedupingInterval: 3600000,
    errorRetryCount: options.errorRetryCount ?? 3,
    errorRetryInterval: options.errorRetryInterval ?? 5000,
  });

  const profiles = data || [];
  const successfulProfiles = profiles.filter((p): p is LinkedInProfile => p !== null);
  const failedCount = profiles.filter(p => p === null).length;

  return {
    profiles: successfulProfiles,
    allProfiles: profiles, // Includes null values for failed requests
    isLoading,
    isError: !!error,
    error,
    isValidating,
    hasData: successfulProfiles.length > 0,
    hasAllData: profiles.length === linkedinUrls.length && failedCount === 0,
    successCount: successfulProfiles.length,
    failedCount,
    refetchAll: () => mutate(),
    resetAll: () => mutate(undefined, false),
  };
}

// Utility function to validate LinkedIn URL format
export function isValidLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.linkedin.com" &&
      urlObj.pathname.startsWith("/in/")
    );
  } catch {
    return false;
  }
}

// Pre-built fetcher for manual fetching (outside of SWR)
export async function fetchLinkedInProfile(
  linkedinUrl: string,
): Promise<LinkedInProfile> {
  if (!isValidLinkedInUrl(linkedinUrl)) {
    throw new Error("Invalid LinkedIn URL format");
  }

  const apiUrl = `/api/get-profile-data-by-url?url=${encodeURIComponent(linkedinUrl)}`;
  return fetcher(apiUrl);
}

// Type exports for consumers
export type LinkedInProfileHookResult = ReturnType<typeof useLinkedInProfile>;
export type LinkedInProfilesHookResult = ReturnType<typeof useLinkedInProfiles>;
export type LinkedInProfilesIndividualHookResult = ReturnType<typeof useLinkedInProfilesIndividual>;
