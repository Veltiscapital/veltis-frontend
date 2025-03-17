import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Type for API response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Custom hook for GET requests
export function useApiQuery<T>(
  queryKey: string[],
  apiFunction: () => Promise<AxiosResponse<ApiResponse<T>>>,
  options?: Omit<UseQueryOptions<AxiosResponse<ApiResponse<T>>, AxiosError, T, QueryKey>, 'queryKey' | 'queryFn' | 'select'>
) {
  return useQuery<AxiosResponse<ApiResponse<T>>, AxiosError, T, QueryKey>({
    queryKey,
    queryFn: apiFunction,
    select: (response) => response.data.data,
    ...options,
  });
}

// Custom hook for POST/PUT/DELETE requests
export function useApiMutation<T, V>(
  mutationFn: (variables: V) => Promise<AxiosResponse<ApiResponse<T>>> | { request: Promise<AxiosResponse<ApiResponse<T>>> },
  options?: UseMutationOptions<AxiosResponse<ApiResponse<T>>, AxiosError, V, unknown>
) {
  return useMutation<AxiosResponse<ApiResponse<T>>, AxiosError, V>({
    mutationFn: async (variables) => {
      // Handle both regular promise returns and the complex return with request property
      const result = mutationFn(variables);
      if ('request' in result) {
        return result.request;
      }
      return result;
    },
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
      
      // Show success toast if there's a message
      if (response.data.message) {
        toast.success(response.data.message);
      }
    },
    onError: (error, variables, context) => {
      if (options?.onError) {
        options.onError(error, variables, context);
      }
      
      // Show error toast
      const errorMessage = (error.response?.data as any)?.message || 
        (error.response?.data as any)?.error ||
        (typeof error.message === 'string' ? error.message : 'An error occurred');
      toast.error(errorMessage);
    },
    ...options,
  });
}

// Pre-configured hooks for common API operations

// Auth hooks
export interface User {
  id: string;
  wallet_address: string;
  smart_account_address?: string;
  email?: string;
  name?: string;
  institution?: string;
  role?: string;
  kyc_status?: string;
  terms_accepted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useUser<T = User>() {
  return useApiQuery<T>(['user'], api.auth.getUser, {
    retry: false,
    enabled: !!localStorage.getItem('auth_token'),
  });
}

// IP-NFT hooks
export function useIPNFTs<T = unknown>() {
  return useApiQuery<T>(['ipnfts'], api.ipnft.getAll);
}

export function useIPNFT<T = unknown>(id: string) {
  return useApiQuery<T>(['ipnft', id], () => api.ipnft.getById(id), {
    enabled: !!id,
  });
}

export function useIPNFTValuation<T = unknown>(id: string) {
  return useApiQuery<T>(['ipnft', id, 'valuation'], () => api.ipnft.getValuation(id), {
    enabled: !!id,
  });
}

// Define types for API requests
export interface MintIPNFTRequest {
  name: string;
  description: string;
  ipType: string;
  files: File[];
  metadata: Record<string, any>;
}

export function useMintIPNFT<T = unknown>() {
  return useApiMutation<T, MintIPNFTRequest>((data) => {
    return api.ipnft.mint(data);
  });
}

// Market hooks
export function useMarketListings<T = unknown>() {
  return useApiQuery<T>(['market', 'listings'], api.market.getListings);
}

export function useMarketOffers<T = unknown>() {
  return useApiQuery<T>(['market', 'offers'], api.market.getOffers);
}

export function useAcceptOffer<T = unknown>() {
  return useApiMutation<T, string>((offerId: string) => api.market.acceptOffer(offerId));
}

// Analytics hooks
export function useMarketAnalytics<T = unknown>() {
  return useApiQuery<T>(['analytics', 'market'], api.analytics.getMarketData);
}

export function usePortfolioAnalytics<T = unknown>() {
  return useApiQuery<T>(['analytics', 'portfolio'], api.analytics.getPortfolioData);
}

// Consulting hooks
export function useConsultingServices<T = unknown>() {
  return useApiQuery<T>(['consulting', 'services'], api.consulting.getServices);
}

export function useConsultingBookings<T = unknown>() {
  return useApiQuery<T>(['consulting', 'bookings'], api.consulting.getBookings);
}

export interface BookingRequest {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export function useCreateBooking<T = unknown>() {
  return useApiMutation<T, BookingRequest>(api.consulting.createBooking);
}

// KYC hooks
export function useKYCStatus<T = unknown>() {
  return useApiQuery<T>(['kyc', 'status'], api.kyc.getStatus);
}

export interface KYCSubmitRequest {
  fullName: string;
  email: string;
  country: string;
  idType: string;
  idNumber: string;
  idDocument: File;
}

export function useSubmitKYC<T = unknown>() {
  return useApiMutation<T, KYCSubmitRequest>(api.kyc.submit);
}

// Legal hooks
export function useTerms<T = unknown>() {
  return useApiQuery<T>(['legal', 'terms'], api.legal.getTerms);
}

export function usePrivacyPolicy<T = unknown>() {
  return useApiQuery<T>(['legal', 'privacy'], api.legal.getPrivacyPolicy);
}
