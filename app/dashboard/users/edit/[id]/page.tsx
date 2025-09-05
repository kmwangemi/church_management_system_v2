'use client';

import RenderApiError from '@/components/api-error';
import { BranchCombobox } from '@/components/branch-combobox';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import { MultiSelect } from '@/components/multi-select';
import { PhoneInput } from '@/components/phone-number-input';
import {
  RenderMemberDetails,
  RenderRoleSpecificFields,
  RenderStaffDetails,
  RenderVolunteerDetails,
} from '@/components/role-specific';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFetchDepartments } from '@/lib/hooks/department/use-department-queries';
import { useFetchGroups } from '@/lib/hooks/group/use-group-queries';
import { useFileUpload } from '@/lib/hooks/upload/use-file-upload';
import {
  useFetchUserById,
  useUpdateUserById,
} from '@/lib/hooks/user/use-user-queries';
import { errorToastStyle } from '@/lib/toast-styles';
import {
  capitalizeFirstLetter,
  GENDER_OPTIONS,
  getFirstLetter,
  getRelativeYear,
  MARITAL_STATUS_OPTIONS,
  MEMBER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
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
      branchId: undefined,
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
  // Helper function to determine if isMember checkbox should be shown
  const shouldShowIsMemberCheckbox = () => {
    return currentRole && currentRole !== 'member' && currentRole !== 'visitor';
  };
  // Handle role changes and update isMember accordingly
  useEffect(() => {
    if (currentRole === 'member') {
      setValue('isMember', true);
    }
    // else {
    //   setValue('isMember', false);
    // }
  }, [currentRole, setValue]);
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <BranchCombobox
                              className="w-full"
                              onChange={field.onChange}
                              placeholder="Search and select a branch"
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  </div>
                  {/* Conditionally show isMember checkbox */}
                  {shouldShowIsMemberCheckbox() && (
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
                  )}
                  <RenderMemberDetails
                    currentRole={currentRole}
                    form={form}
                    user={user}
                  />
                  <RenderRoleSpecificFields
                    currentRole={currentRole}
                    form={form}
                  />
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
                  <RenderStaffDetails form={form} user={user} />
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
                  <RenderVolunteerDetails form={form} user={user} />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
