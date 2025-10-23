'use client';

import type { AdminGetMembersParams } from '@/lib/actions/admin/member-management';
import {
  adminAddMemberToOrganization,
  adminGetMemberByUserId,
  adminGetMemberStatistics,
  adminGetOrganizationMembers,
  adminRemoveMemberFromOrganization,
  adminUpdateMemberDetails,
  adminUpdateMemberRole,
} from '@/lib/actions/admin/member-management';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch organization members with filters and pagination
 */
export function useOrganizationMembers(params: AdminGetMembersParams) {
  return useQuery({
    queryKey: ['organization-members', params],
    queryFn: async () => {
      const result = await adminGetOrganizationMembers(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch members');
      }
      return result.data;
    },
    enabled: !!params.organizationId,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single member's full details
 */
export function useMemberDetails(userId: string, organizationId?: string) {
  return useQuery({
    queryKey: ['member-details', userId, organizationId],
    queryFn: async () => {
      const result = await adminGetMemberByUserId(userId, organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch member details');
      }
      return result.data;
    },
    enabled: !!userId,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch member statistics for an organization
 */
export function useMemberStatistics(organizationId: string) {
  return useQuery({
    queryKey: ['member-statistics', organizationId],
    queryFn: async () => {
      const result = await adminGetMemberStatistics(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }
      return result.data;
    },
    enabled: !!organizationId,
    staleTime: 60_000, // 1 minute
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to add a new member to an organization
 */
export function useAddMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAddMemberToOrganization,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch members list
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: ['member-statistics', organizationId],
        });
        toast.success(data.message || 'Member added successfully');
      } else {
        toast.error(data.error || 'Failed to add member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add member');
    },
  });
}

/**
 * Hook to update member details
 */
export function useUpdateMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateMemberDetails,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate specific member details
        queryClient.invalidateQueries({
          queryKey: ['member-details', variables.userId],
        });
        // Invalidate members list
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
        toast.success(data.message || 'Member updated successfully');
      } else {
        toast.error(data.error || 'Failed to update member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member');
    },
  });
}

/**
 * Hook to remove a member from an organization
 */
export function useRemoveMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      adminRemoveMemberFromOrganization(organizationId, userId),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate members list
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: ['member-statistics', organizationId],
        });
        toast.success(data.message || 'Member removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });
}

/**
 * Hook to update member role
 */
export function useAdminUpdateMemberRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: any }) =>
      adminUpdateMemberRole(organizationId, userId, newRole),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate member details
        queryClient.invalidateQueries({
          queryKey: ['member-details', variables.userId],
        });
        // Invalidate members list
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: ['member-statistics', organizationId],
        });
        toast.success(data.message || 'Member role updated successfully');
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

// ============================================
// USAGE EXAMPLES IN COMPONENTS
// ============================================

/*
// Example 1: Fetch members with filters
function MembersList({ organizationId }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, error } = useOrganizationMembers({
    organizationId,
    page,
    pageSize: 20,
    search,
    role: roleFilter,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members..."
      />
      
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
        <option value="STAFF">Staff</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((member) => (
            <tr key={member.userId}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.organizationRoles.join(', ')}</td>
              <td>{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        Page {data.pagination.page} of {data.pagination.totalPages}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === data.pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Example 2: View member details
function MemberProfile({ userId, organizationId }) {
  const { data: member, isLoading } = useMemberDetails(userId, organizationId);

  if (isLoading) return <div>Loading...</div>;
  if (!member) return <div>Member not found</div>;

  return (
    <div>
      <h1>{member.user.name}</h1>
      <p>Email: {member.user.email}</p>
      <p>Phone: {member.user.phoneNumber}</p>
      
      {member.address && (
        <div>
          <h2>Address</h2>
          <p>{member.address.street}</p>
          <p>{member.address.city}, {member.address.country}</p>
        </div>
      )}
      
      {member.memberDetails && (
        <div>
          <h2>Membership</h2>
          <p>Status: {member.memberDetails.membershipStatus}</p>
          <p>Member since: {new Date(member.memberDetails.membershipDate).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}

// Example 3: Add member
function AddMemberForm({ organizationId }) {
  const addMember = useAddMember(organizationId);

  const handleSubmit = (formData) => {
    addMember.mutate({
      organizationId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      organizationRole: 'MEMBER',
      phoneNumber: formData.phoneNumber,
      address: {
        street: formData.street,
        city: formData.city,
        country: formData.country,
      },
      sendWelcomeEmail: true,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      // Form fields
      <button type="submit" disabled={addMember.isPending}>
        {addMember.isPending ? 'Adding...' : 'Add Member'}
      </button>
    </form>
  );
}

// Example 4: Update member
function EditMemberForm({ organizationId, userId }) {
  const updateMember = useUpdateMember(organizationId);
  const { data: member } = useMemberDetails(userId);

  const handleSubmit = (formData) => {
    updateMember.mutate({
      organizationId,
      userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      position: formData.position,
      address: {
        street: formData.street,
        city: formData.city,
        country: formData.country,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      // Form fields pre-filled with member data
      <button type="submit" disabled={updateMember.isPending}>
        {updateMember.isPending ? 'Updating...' : 'Update Member'}
      </button>
    </form>
  );
}

// Example 5: Remove member
function RemoveMemberButton({ organizationId, userId }) {
  const removeMember = useRemoveMember(organizationId);

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMember.mutate({ userId });
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={removeMember.isPending}
    >
      {removeMember.isPending ? 'Removing...' : 'Remove Member'}
    </button>
  );
}

// Example 6: Statistics dashboard
function MemberStatistics({ organizationId }) {
  const { data: stats, isLoading } = useMemberStatistics(organizationId);

  if (isLoading) return <div>Loading...</div>;
  if (!stats) return <div>No statistics available</div>;

  return (
    <div>
      <h2>Member Statistics</h2>
      <div className="stats">
        <div>
          <h3>Total Members</h3>
          <p>{stats.totalMembers}</p>
        </div>
        <div>
          <h3>Active Members</h3>
          <p>{stats.activeMembers}</p>
        </div>
        <div>
          <h3>Inactive Members</h3>
          <p>{stats.inactiveMembers}</p>
        </div>
      </div>

      <h3>Members by Role</h3>
      <ul>
        {stats.byRole.map(({ role, count }) => (
          <li key={role}>
            {role}: {count}
          </li>
        ))}
      </ul>

      <h3>Recent Joins</h3>
      <ul>
        {stats.recentJoins.map((member) => (
          <li key={member.userId}>
            {member.name} - {new Date(member.joinedAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/
