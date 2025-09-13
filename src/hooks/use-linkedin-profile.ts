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

// Hook for multiple LinkedIn profiles
export function useLinkedInProfiles(
  linkedinUrls: string[],
  options: UseLinkedInProfileOptions = {},
) {
  const profiles = linkedinUrls.map((url) => useLinkedInProfile(url, options));

  const isLoading = profiles.some((profile) => profile.isLoading);
  const isError = profiles.some((profile) => profile.isError);
  const hasData = profiles.every((profile) => profile.profile);

  return {
    profiles: profiles.map((p) => p.profile),
    profileDetails: profiles,
    isLoading,
    isError,
    hasData,
    errors: profiles.filter((p) => p.error).map((p) => p.error),
    refetchAll: () => profiles.forEach((p) => p.refetch()),
    resetAll: () => profiles.forEach((p) => p.reset()),
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
