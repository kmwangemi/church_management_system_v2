'use client';

import RenderApiError from '@/components/api-error';
import { BranchListInput } from '@/components/branch-list-input';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import { MultiSelect } from '@/components/multi-select';
import { PhoneInput } from '@/components/phone-number-input';
import { TimeInput } from '@/components/time-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { UserListInput } from '@/components/user-list-input';
import { useFetchDepartments } from '@/lib/hooks/department/use-department-queries';
import { useFetchGroups } from '@/lib/hooks/group/use-group-queries';
import { useFileUpload } from '@/lib/hooks/upload/use-file-upload';
import {
  useFetchUserById,
  useUpdateUserById,
} from '@/lib/hooks/user/use-user-queries';
import { errorToastStyle } from '@/lib/toast-styles';
import type { Branch } from '@/lib/types/branch';
import type { UserResponse } from '@/lib/types/user';
import {
  ADMIN_ACCESS_LEVEL_OPTIONS,
  capitalizeFirstLetter,
  EMPLOYMENT_TYPE_OPTIONS,
  FOLLOW_UP_STATUS_OPTIONS,
  GENDER_OPTIONS,
  getFirstLetter,
  getRelativeYear,
  MARITAL_STATUS_OPTIONS,
  MEMBER_ROLE_OPTIONS,
  MEMBERSHIP_STATUS_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  SUPERADMIN_ACCESS_LEVEL_OPTIONS,
  USER_STATUS_OPTIONS,
  VOLUNTEER_STATUS_OPTIONS,
} from '@/lib/utils';
import {
  type UpdateUserPayload,
  userUpdateSchema,
} from '@/lib/validations/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save, Shield, Upload, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useFetchUserById(id);
  const {
    upload,
    isUploading,
    uploadProgress,
    error: uploadError,
    clearError,
  } = useFileUpload('logo');
  const {
    data: departments,
    // isLoading: isLoadingDepartments,
    // isError: isErrorDepartments,
    // error: errorDepartments,
  } = useFetchDepartments();
  const {
    data: groups,
    // isLoading: isLoadingGroups,
    // isError: isErrorGroups,
    // error: errorGroups,
  } = useFetchGroups();
  const form = useForm<UpdateUserPayload>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      dateOfBirth: undefined,
      gender: 'male',
      profilePictureUrl: undefined,
      occupation: '',
      branchId: {
        branchName: '',
      },
      isMember: false,
      role: 'member',
      isStaff: false,
      isVolunteer: false,
      status: 'active',
      lastLogin: undefined,
      maritalStatus: 'single',
      emergencyDetails: {
        emergencyContactFullName: '',
        emergencyContactEmail: '',
        emergencyContactPhoneNumber: '',
        emergencyContactRelationship: '',
        emergencyContactAddress: '',
        emergencyContactNotes: '',
      },
      notes: '',
      skills: [],
      createdAt: undefined,
      memberDetails: {
        memberId: '',
        membershipDate: undefined,
        membershipStatus: 'active',
        departmentIds: [],
        groupIds: [],
        occupation: '',
        baptismDate: undefined,
        joinedDate: undefined,
      },
      pastorDetails: {
        pastorId: '',
        ordinationDate: undefined,
        qualifications: [],
        specializations: [],
        assignments: [],
        sermonCount: 0,
        counselingSessions: 0,
        biography: '',
      },
      bishopDetails: {
        bishopId: '',
        appointmentDate: undefined,
        jurisdictionArea: '',
        oversight: {},
        qualifications: [],
        achievements: [],
        biography: '',
      },
      staffDetails: {
        staffId: '',
        jobTitle: '',
        department: '',
        startDate: undefined,
        salary: 0,
        employmentType: 'full-time',
        isActive: false,
      },
      volunteerDetails: {
        volunteerId: '',
        volunteerStatus: 'active',
        availabilitySchedule: {},
        departments: [],
        volunteerRoles: [],
        backgroundCheck: {},
        hoursContributed: 0,
      },
      adminDetails: {
        adminId: '',
        accessLevel: 'national',
        assignedBranches: [],
      },
      superAdminDetails: {
        superAdminId: '',
        accessLevel: 'global',
        systemSettings: {},
        companyInfo: {},
      },
      visitorDetails: {
        visitorId: '',
        visitDate: undefined,
        invitedBy: '',
        howDidYouHear: 'friend',
        followUpStatus: 'pending',
        followUpDate: undefined,
        followUpNotes: '',
        interestedInMembership: false,
        servicesAttended: [],
        occupation: '',
      },
    },
  });
  useEffect(() => {
    if (user) {
      const formData: any = {
        firstName: capitalizeFirstLetter(user?.firstName || ''),
        lastName: capitalizeFirstLetter(user?.lastName || ''),
        email: user?.email || undefined, // undefined instead of empty string
        phoneNumber: user?.phoneNumber || '',
        address: {
          street: user?.address?.street
            ? capitalizeFirstLetter(user.address.street)
            : undefined,
          city: user?.address?.city
            ? capitalizeFirstLetter(user.address.city)
            : undefined,
          state: user?.address?.state
            ? capitalizeFirstLetter(user.address.state)
            : undefined,
          zipCode: user?.address?.zipCode || undefined,
          country: user?.address?.country || undefined,
        },
        dateOfBirth: user?.dateOfBirth || undefined,
        gender: user?.gender || 'male',
        profilePictureUrl: user?.profilePictureUrl || undefined,
        occupation: user?.occupation
          ? capitalizeFirstLetter(user.occupation)
          : undefined,
        branchId: user?.branchId?._id || undefined,
        isMember: user?.isMember,
        role: user?.role || 'member',
        isStaff: user?.isStaff,
        isVolunteer: user?.isVolunteer,
        status: user?.status || 'active',
        maritalStatus: user?.maritalStatus || 'single',
        emergencyDetails: {
          emergencyContactFullName:
            user?.emergencyDetails?.emergencyContactFullName || undefined,
          emergencyContactEmail:
            user?.emergencyDetails?.emergencyContactEmail || undefined,
          emergencyContactPhoneNumber:
            user?.emergencyDetails?.emergencyContactPhoneNumber || undefined,
          emergencyContactRelationship:
            user?.emergencyDetails?.emergencyContactRelationship || undefined,
          emergencyContactAddress:
            user?.emergencyDetails?.emergencyContactAddress || undefined,
          emergencyContactNotes:
            user?.emergencyDetails?.emergencyContactNotes || undefined,
        },
        notes: user?.notes || undefined,
        skills: user?.skills || [],
      };
      // Only add role-specific details that actually exist
      // Member details
      formData.memberDetails = {
        memberId: user?.memberDetails?.memberId || '',
        membershipDate: user?.memberDetails?.membershipDate || undefined,
        membershipStatus: user?.memberDetails?.membershipStatus || 'active',
        departmentIds: user?.memberDetails?.departmentIds || [],
        groupIds: user?.memberDetails?.groupIds || [],
        baptismDate: user?.memberDetails?.baptismDate || undefined,
        joinedDate: user?.memberDetails?.joinedDate || undefined,
      };
      // Pastor details
      formData.pastorDetails = {
        pastorId: user?.pastorDetails?.pastorId || '',
        ordinationDate: user?.pastorDetails?.ordinationDate || undefined,
        qualifications: user?.pastorDetails?.qualifications || [],
        specializations: user?.pastorDetails?.specializations || [],
        assignments: user?.pastorDetails?.assignments || [],
        sermonCount: user?.pastorDetails?.sermonCount || 0,
        counselingSessions: user?.pastorDetails?.counselingSessions || 0,
        biography: user?.pastorDetails?.biography || '',
      };
      // Bishop details
      if (user?.bishopDetails) {
        formData.bishopDetails = {
          bishopId: user?.bishopDetails?.bishopId || '',
          appointmentDate: user?.bishopDetails?.appointmentDate || undefined,
          jurisdictionArea: user?.bishopDetails?.jurisdictionArea || '',
          oversight: user?.bishopDetails?.oversight || {},
          qualifications: user?.bishopDetails?.qualifications || [],
          achievements: user?.bishopDetails?.achievements || [],
          biography: user?.bishopDetails?.biography || '',
        };
      }
      // Admin details
      if (user?.adminDetails) {
        formData.adminDetails = {
          adminId: user?.adminDetails?.adminId || '',
          accessLevel: user?.adminDetails?.accessLevel || 'national',
          assignedBranches: user?.adminDetails?.assignedBranches || [],
        };
      }
      // Super admin details
      if (user?.superAdminDetails) {
        formData.superAdminDetails = {
          superAdminId: user?.superAdminDetails?.superAdminId || '',
          accessLevel: user?.superAdminDetails?.accessLevel || 'global',
          systemSettings: user?.superAdminDetails?.systemSettings || {},
          companyInfo: user?.superAdminDetails?.companyInfo || {},
        };
      }
      // Super admin details
      if (user?.superAdminDetails) {
        formData.superAdminDetails = {
          superAdminId: user?.superAdminDetails?.superAdminId || '',
          accessLevel: user?.superAdminDetails?.accessLevel || 'global',
          systemSettings: user?.superAdminDetails?.systemSettings || {},
          companyInfo: user?.superAdminDetails?.companyInfo || {},
        };
      }
      // Visitor details
      if (user?.visitorDetails) {
        formData.visitorDetails = {
          visitorId: user?.visitorDetails?.visitorId || '',
          visitDate: user?.visitorDetails?.visitDate || undefined,
          invitedBy: user?.visitorDetails?.invitedBy || '',
          howDidYouHear: user?.visitorDetails?.howDidYouHear || 'friend',
          followUpStatus: user?.visitorDetails?.followUpStatus || 'pending',
          followUpDate: user?.visitorDetails?.followUpDate || undefined,
          followUpNotes: user?.visitorDetails?.followUpNotes || '',
          interestedInMembership: user?.visitorDetails?.interestedInMembership,
          servicesAttended: user?.visitorDetails?.servicesAttended || [],
        };
      }
      // Only add secondary role details if the flags are true
      // staff details
      if (user?.isStaff && user?.staffDetails) {
        formData.staffDetails = {
          staffId: user?.staffDetails?.staffId || '',
          jobTitle: capitalizeFirstLetter(user?.staffDetails?.jobTitle || ''),
          department: capitalizeFirstLetter(
            user?.staffDetails?.department || ''
          ),
          startDate: user?.staffDetails?.startDate || undefined,
          salary: user?.staffDetails?.salary || 0,
          employmentType: user?.staffDetails?.employmentType || 'full-time',
          isActive: user?.staffDetails?.isActive,
        };
      }
      // volunteer details
      if (user?.isVolunteer && user?.volunteerDetails) {
        formData.volunteerDetails = {
          volunteerId: user?.volunteerDetails?.volunteerId || '',
          volunteerStatus: user?.volunteerDetails?.volunteerStatus || 'active',
          availabilitySchedule:
            user?.volunteerDetails?.availabilitySchedule || {},
          departments: user?.volunteerDetails?.departments || [],
          volunteerRoles: user?.volunteerDetails?.volunteerRoles || [],
          backgroundCheck: user?.volunteerDetails?.backgroundCheck || {},
          hoursContributed: user?.volunteerDetails?.hoursContributed || 0,
        };
      }
      form.reset(formData);
    }
  }, [form, user]);
  const {
    mutateAsync: updateUserMutation,
    isPending,
    isError,
    error,
  } = useUpdateUserById(id);
  const { reset, watch, setValue } = form;
  console.log('errors--->', form.formState.errors);
  console.log('watch all values--->', watch());
  // Handle profile picture file selection
  const handleProfilePictureSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Clear any previous errors
    clearError();
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB', {
        style: errorToastStyle,
      });
      return;
    }
    setProfilePicFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  // Handle profile picture update using the hook
  const handleProfilePictureUpload = async () => {
    if (!profilePicFile) return;
    try {
      // Use the upload function from the hook
      const uploadResponse = await upload(profilePicFile);
      setValue('profilePictureUrl', uploadResponse || '');
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      toast.error('Failed to update profile picture');
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.error('Profile picture update error:', error);
    }
  };
  // Handle profile picture removal
  const handleProfilePicRemove = () => {
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setValue('profilePictureUrl', '');
    clearError(); // Clear any upload errors
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Handle form submission
  const onSubmit = async (payload: UpdateUserPayload) => {
    // Only upload profile picture if a file was selected
    if (profilePicFile) {
      setProfilePicUploading(true);
      try {
        const profilePicUrl = await upload(profilePicFile as File);
        payload.profilePictureUrl = profilePicUrl || '';
      } catch (_error) {
        toast.error('Failed to upload profile picture');
        return;
      } finally {
        setProfilePicUploading(false);
      }
    }
    // Validate the payload
    const validation = userUpdateSchema.safeParse(payload);
    if (!validation.success) {
      toast.error('Please fix all validation errors');
      return;
    }
    // Update user with proper error handling
    await updateUserMutation({ userId: id, payload });
    // Only reset on success
    reset();
    setProfilePicFile(null);
    setProfilePicPreview(null);
  };
  const currentRole = form.watch('role');
  const renderRoleSpecificFields = () => {
    switch (currentRole) {
      case 'member':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
              <CardDescription>Member-specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="memberDetails.memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberDetails.membershipDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-50)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Membership date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberDetails.membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select membership status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {MEMBERSHIP_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberDetails.baptismDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baptism Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-20)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Baptism date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberDetails.joinedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joined Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-50)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Joined date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 'pastor':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pastor Details</CardTitle>
              <CardDescription>Pastor-specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pastorDetails.pastorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pastor ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pastorDetails.ordinationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordination Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-50)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Ordination date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pastorDetails.sermonCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sermon Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastorDetails.counselingSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counseling Sessions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pastorDetails.biography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 'bishop':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bishop Details</CardTitle>
              <CardDescription>Bishop-specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bishopDetails.bishopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bishop ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bishopDetails.appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-50)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Appointment date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bishopDetails.jurisdictionArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction Area</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bishopDetails.biography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 'admin':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
              <CardDescription>Admin-specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="adminDetails.adminId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminDetails.accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {ADMIN_ACCESS_LEVEL_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 'superadmin':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Super Admin Details</CardTitle>
              <CardDescription>
                Super admin-specific information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="superAdminDetails.superAdminId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Super Admin ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="superAdminDetails.accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {SUPERADMIN_ACCESS_LEVEL_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 'visitor':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Visitor Details</CardTitle>
              <CardDescription>Visitor-specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="visitorDetails.visitorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitorDetails.visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={getRelativeYear(1)}
                        minDate={getRelativeYear(-50)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Visit date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitorDetails.howDidYouHear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How Did You Hear About Us?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select how you heard about us" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {REFERRAL_SOURCE_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitorDetails.followUpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow Up Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select follow up status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {FOLLOW_UP_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitorDetails.interestedInMembership"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Interested in Membership
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitorDetails.invitedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invited By</FormLabel>
                    <FormControl>
                      <UserListInput
                        className="w-full"
                        onChange={(member) => {
                          setSelectedMember(member);
                          field.onChange(member?._id || ''); // ✅ Store only the ID
                        }}
                        placeholder="Search and select a member"
                        value={selectedMember} // ✅ Use state for display
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };
  const renderStaffDetails = () => {
    if (user?.isStaff || form.watch('isStaff') === true) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Staff Details</CardTitle>
            <CardDescription>Staff-specific information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="staffDetails.staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staffDetails.jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staffDetails.department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="staffDetails.employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[400px] overflow-y-auto">
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staffDetails.startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      format="long"
                      maxDate={getRelativeYear(1)}
                      minDate={getRelativeYear(-50)}
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString() : '')
                      }
                      placeholder="Start date"
                      value={field.value ? new Date(field.value) : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staffDetails.salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staffDetails.isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Currently Active
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      );
    }
    return null;
  };
  const renderVolunteerDetails = () => {
    if (user?.isVolunteer || form.watch('isVolunteer') === true) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Details</CardTitle>
            <CardDescription>Volunteer-specific information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Volunteer Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="volunteerDetails.volunteerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volunteer ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volunteerDetails.volunteerStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volunteer Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select volunteer Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {VOLUNTEER_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Availability Schedule */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Availability Schedule</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="volunteerDetails.availabilitySchedule.days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Days</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                            'Sunday',
                          ].map((day) => (
                            <label
                              className="flex items-center space-x-2"
                              key={day}
                            >
                              <input
                                checked={field.value?.includes(day)}
                                className="cursor-pointer rounded"
                                onChange={(e) => {
                                  const currentDays = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentDays, day]);
                                  } else {
                                    field.onChange(
                                      currentDays.filter(
                                        (d: string) => d !== day
                                      )
                                    );
                                  }
                                }}
                                type="checkbox"
                              />
                              <span className="text-sm">{day}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteerDetails.availabilitySchedule.preferredTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Times</FormLabel>
                      <FormControl>
                        <TimeInput
                          multiSelect
                          onChange={field.onChange}
                          placeholder="Select preferre times"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Departments */}
            <FormField
              control={form.control}
              name="volunteerDetails.departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departments</FormLabel>
                  <FormControl>
                    <MultiSelect
                      onChange={field.onChange}
                      options={
                        departments?.departments?.map((dept) => ({
                          label: capitalizeFirstLetter(dept?.departmentName),
                          value: dept?._id,
                        })) || []
                      }
                      placeholder="Select department(s)"
                      selected={field.value || []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Background Check */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Background Check</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="volunteerDetails.backgroundCheck.completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Background Check Completed
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteerDetails.backgroundCheck.clearanceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clearance Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select clearance level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="enhanced">Enhanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.watch('volunteerDetails.backgroundCheck.completed') && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="volunteerDetails.backgroundCheck.completedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            format="long"
                            maxDate={new Date()}
                            minDate={getRelativeYear(-10)}
                            onChange={(date) =>
                              field.onChange(date ? date.toISOString() : '')
                            }
                            placeholder="Completed date"
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="volunteerDetails.backgroundCheck.expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            format="long"
                            maxDate={getRelativeYear(10)}
                            minDate={new Date()}
                            onChange={(date) =>
                              field.onChange(date ? date.toISOString() : '')
                            }
                            placeholder="Expiry date"
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            {/* Hours Contributed */}
            <FormField
              control={form.control}
              name="volunteerDetails.hoursContributed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Contributed</FormLabel>
                  <FormControl>
                    <Input
                      min="0"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      );
    }
    return null;
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      {isErrorUser && <RenderApiError error={errorUser} />}
      {isError && <RenderApiError error={error} />}
      {isLoadingUser ? (
        <SpinnerLoader description="Loading user data..." />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/users">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Members
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-3xl tracking-tight">
                  Edit Member
                </h1>
                <p className="text-muted-foreground">
                  Update member information and settings
                </p>
              </div>
            </div>
            <Button
              disabled={isPending || isUploading}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending || isUploading ? 'Saving changes...' : ' Save Changes'}
            </Button>
          </div>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs className="space-y-4" defaultValue="personal">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="role">Role Details</TabsTrigger>
                  {/* <TabsTrigger value="church">Church Details</TabsTrigger> */}
                  <TabsTrigger value="staff">Staff Details</TabsTrigger>
                  <TabsTrigger value="volunteer">Volunteer Details</TabsTrigger>
                </TabsList>
                <TabsContent className="space-y-6" value="personal">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Photo */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                        <CardDescription>
                          Update member's profile picture
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            alt={user?.firstName || 'User'}
                            src={
                              profilePicPreview ||
                              watch('profilePictureUrl') ||
                              ''
                            }
                          />
                          <AvatarFallback className="text-lg">{`${getFirstLetter(
                            user?.firstName || ''
                          )}${getFirstLetter(user?.lastName || '')}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <input
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePictureSelect}
                            ref={fileInputRef}
                            type="file"
                          />
                          <div className="flex space-x-2">
                            {profilePicFile ? (
                              <>
                                <Button
                                  disabled={profilePicUploading}
                                  onClick={handleProfilePictureUpload}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  {profilePicUploading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                  )}
                                  {profilePicUploading
                                    ? 'Uploading...'
                                    : 'Upload'}
                                </Button>
                                <Button
                                  onClick={handleProfilePicRemove}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Remove
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Photo
                              </Button>
                            )}
                          </div>
                          {/* Show upload progress */}
                          {isUploading && (
                            <div className="mt-2">
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="mt-1 text-gray-500 text-xs">
                                Uploading... {uploadProgress}%
                              </p>
                            </div>
                          )}
                          {/* Show error if any */}
                          {uploadError && (
                            <p className="mt-1 text-red-500 text-xs">
                              {uploadError}
                            </p>
                          )}
                          {!(isUploading || error) && (
                            <p className="mt-1 text-gray-500 text-xs">
                              PNG, JPG up to 2MB
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                          Personal details and contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  defaultCountry="KE"
                                  onChange={field.onChange}
                                  placeholder="Enter phone number"
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <FormLabel>Address</FormLabel>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="address.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Country{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <CountrySelect
                                      onChange={field.onChange}
                                      placeholder="Select your country"
                                      value={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    City <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nairobi" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address.street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Street Address{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123 Main Street"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address.zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="00100" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>
                          Additional personal information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Gender <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[400px] overflow-y-auto">
                                  {GENDER_OPTIONS.map((option) => (
                                    <SelectItem
                                      className="cursor-pointer"
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <DatePicker
                                  format="long"
                                  maxDate={getRelativeYear(1)}
                                  minDate={getRelativeYear(-100)}
                                  onChange={(date) =>
                                    field.onChange(
                                      date ? date.toISOString() : ''
                                    )
                                  }
                                  placeholder="Select date of birth"
                                  value={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maritalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Marital Status{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[400px] overflow-y-auto">
                                  {MARITAL_STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                      className="cursor-pointer"
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Occupation</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills (comma-separated)</FormLabel>
                              <FormControl>
                                <Input
                                  onChange={(e) => {
                                    const skillsArray = e.target.value
                                      .split(',')
                                      .map((skill) => skill.trim())
                                      .filter((skill) => skill.length > 0);
                                    field.onChange(skillsArray);
                                  }}
                                  placeholder="e.g., Teaching, Music, Administration"
                                  value={field.value?.join(', ') || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    {/* Emergency Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Emergency Contact</span>
                        </CardTitle>
                        <CardDescription>
                          Emergency contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="emergencyDetails.emergencyContactFullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Contact full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyDetails.emergencyContactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Contact email"
                                    type="email"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyDetails.emergencyContactPhoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Phone Number</FormLabel>
                                <FormControl>
                                  <PhoneInput
                                    defaultCountry="KE"
                                    onChange={field.onChange}
                                    placeholder="Phone number"
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyDetails.emergencyContactRelationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Spouse, Parent, Sibling"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="emergencyDetails.emergencyContactAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Physical Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123 Church Street, Nairobi"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyDetails.emergencyContactNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Additional emergency contact information"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Ministry Involvement */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ministry Involvement</CardTitle>
                        <CardDescription>
                          Current ministry participation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="memberDetails.departmentIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departments</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  onChange={field.onChange}
                                  options={
                                    departments?.departments?.map((dept) => ({
                                      label: capitalizeFirstLetter(
                                        dept?.departmentName
                                      ),
                                      value: dept?._id,
                                    })) || []
                                  }
                                  placeholder="Select department(s)"
                                  selected={field.value || []}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="memberDetails.groupIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Active Groups</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  onChange={field.onChange}
                                  options={
                                    groups?.groups?.map((group) => ({
                                      label: capitalizeFirstLetter(
                                        group?.groupName
                                      ),
                                      value: group?._id,
                                    })) || []
                                  }
                                  placeholder="Select group(s)"
                                  selected={field.value || []}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    {/* Additional Notes Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>
                          General notes and status information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Additional notes about this member"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[400px] overflow-y-auto">
                                  {USER_STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                      className="cursor-pointer"
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent className="space-y-6" value="role">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Role <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[400px] overflow-y-auto">
                            {MEMBER_ROLE_OPTIONS.map((option) => (
                              <SelectItem
                                className="cursor-pointer"
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <BranchListInput
                            className="w-full"
                            onChange={(branch) => {
                              setSelectedBranch(branch);
                              field.onChange(branch?._id || '');
                            }}
                            placeholder="Search and select a branch"
                            value={selectedBranch}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Secondary role flag */}
                  <FormField
                    control={form.control}
                    name="isMember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Church Member</FormLabel>
                          <p className="text-gray-500 text-sm">
                            This person is also a church member
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  {renderRoleSpecificFields()}
                </TabsContent>
                <TabsContent className="space-y-6" value="staff">
                  {/* Secondary role flag */}
                  <FormField
                    control={form.control}
                    name="isStaff"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Staff Member</FormLabel>
                          <p className="text-gray-500 text-sm">
                            This person is also a paid staff member
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  {renderStaffDetails()}
                </TabsContent>
                <TabsContent className="space-y-6" value="volunteer">
                  {/* Secondary role flag */}
                  <FormField
                    control={form.control}
                    name="isVolunteer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            // disabled
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Volunteer</FormLabel>
                          <p className="text-gray-500 text-sm">
                            This person also volunteers in church activities
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  {renderVolunteerDetails()}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
