import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import { BranchAddResponse, BranchListResponse } from '@/lib/types';
import { AddBranchFormValues } from '@/lib/validations/branch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerBranch = async (
  payload: AddBranchFormValues,
): Promise<BranchAddResponse> => {
  const { data } = await apiClient.post('/branches', payload);
  return data;
};

export const useRegisterBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Church branch ha been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

const fetchBranches = async (
  page = 1,
  search = '',
): Promise<BranchListResponse> => {
  const { data } = await apiClient.get(
    `/branches?page=${page}&search=${search}`,
  );
  return data;
};

export const useFetchBranches = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['branches', page, search],
    queryFn: () => fetchBranches(page, search),
  });
};

// const fetchJobById = async (id: string): Promise<JobFetchByIdResponse> => {
//   const { data } = await apiClient.get(`/jobs/${id}`);
//   return data;
// };

// export const useFetchJobById = (id: string) => {
//   return useQuery({
//     queryKey: ['job', id],
//     queryFn: () => fetchJobById(id),
//     enabled: !!id,
//   });
// };

// const updateJob = async ({
//   id,
//   payload,
// }: {
//   id: string;
//   payload: JobFormValues;
// }): Promise<Job> => {
//   const { data } = await apiClient.patch(`/jobs/${id}`, payload);
//   return data;
// };

// export const useUpdateJob = (id: string) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: updateJob,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['jobs'] });
//       queryClient.invalidateQueries({ queryKey: ['job', id] });
//       toast.success('Job updated successfully.', {
//         style: successToastStyle,
//       });
//     },
//   });
// };

// const deleteJob = async (id: string): Promise<void> => {
//   await apiClient.delete(`/jobs/${id}`);
// };

// export const useDeleteJob = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: deleteJob,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['jobs'] });
//       toast.success('Job deleted successfully.', {
//         style: successToastStyle,
//       });
//     },
//   });
// };

// const fetchSelectedJobSeekersByJobId = async (
//   id: string,
// ): Promise<JobSeekerFetchResponse> => {
//   const { data } = await apiClient.get(`/jobs/${id}/selected-jobseekers`);
//   return data;
// };

// export const useFetchSelectedJobSeekersByJobId = (id: string) => {
//   return useQuery({
//     queryKey: ['job-selected-jobseekers', id],
//     queryFn: () => fetchSelectedJobSeekersByJobId(id),
//     enabled: !!id,
//   });
// };
