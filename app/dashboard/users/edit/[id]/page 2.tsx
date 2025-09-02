'use client';

import RenderApiError from '@/components/api-error';
import { BranchListInput } from '@/components/branch-list-input';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import { PhoneInput } from '@/components/phone-number-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { useFetchUserById } from '@/lib/hooks/user/use-user-queries';
import type { Branch } from '@/lib/types/branch';
import {
  GENDER_OPTIONS,
  getRelativeYear,
  MARITAL_STATUS_OPTIONS,
  MEMBER_ROLE_OPTIONS,
} from '@/lib/utils';
import {
  type UpdateUserPayload,
  userUpdateSchema,
} from '@/lib/validations/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarIcon,
  Church,
  Save,
  Shield,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// const formSchema = z.object({
//   // Basic fields
//   firstName: z.string().min(2, 'First name must be at least 2 characters'),
//   lastName: z.string().min(2, 'Last name must be at least 2 characters'),
//   email: z.email().optional(),
//   phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
//   address: z.object({
//     street: z.string().min(2, 'Street address must be at least 2 characters'),
//     city: z.string().min(2, 'City name must be at least 2 characters'),
//     state: z.string().optional(),
//     zipCode: z.string().optional(),
//     country: z.string().min(2, 'Country name must be at least 2 characters'),
//   }),
//   dateOfBirth: z.date().optional(),
//   gender: z.enum(['male', 'female'], {
//     error: 'Gender is required',
//   }),
//   maritalStatus: z
//     .enum(['single', 'married', 'divorced', 'widowed'])
//     .optional(),
//   occupation: z.string().optional(),
//   emergencyDetails: z.object({
//     emergencyContactFullName: z.string().optional(),
//     emergencyContactEmail: z.email().optional(),
//     emergencyContactPhoneNumber: z.string().optional(),
//     emergencyContactRelationship: z.string().optional(),
//     emergencyContactAddress: z.string().optional(),
//     emergencyContactNotes: z.string().optional(),
//   }),
//   // Role-specific fields
//   role: z.enum([
//     'member',
//     'pastor',
//     'bishop',
//     'admin',
//     'superadmin',
//     'visitor',
//   ]),
//   branchId: z.string().min(1, 'Please select a branch'),
//   isMember: z.boolean(),
//   isStaff: z.boolean(),
//   isVolunteer: z.boolean(),
//   // Member fields
//   memberId: z.string().optional(),
//   membershipDate: z.date().optional(),
//   membershipStatus: z
//     .enum(['active', 'inactive', 'transferred', 'deceased'])
//     .optional(),
//   baptismDate: z.date().optional(),
//   joinedDate: z.date().optional(),
//   // Pastor fields
//   pastorId: z.string().optional(),
//   ordinationDate: z.date().optional(),
//   qualifications: z.array(z.string()).optional(),
//   specializations: z.array(z.string()).optional(),
//   sermonCount: z.number().optional(),
//   counselingSessions: z.number().optional(),
//   biography: z.string().optional(),
//   // Bishop fields
//   bishopId: z.string().optional(),
//   appointmentDate: z.date().optional(),
//   jurisdictionArea: z.string().optional(),
//   achievements: z.array(z.string()).optional(),
//   // Staff fields
//   staffId: z.string().optional(),
//   jobTitle: z.string().optional(),
//   department: z.string().optional(),
//   startDate: z.date().optional(),
//   endDate: z.date().optional(),
//   salary: z.number().optional(),
//   employmentType: z
//     .enum(['full-time', 'part-time', 'contract', 'casual'])
//     .optional(),
//   isActive: z.boolean().optional(),
//   // Volunteer fields
//   volunteerId: z.string().optional(),
//   volunteerStatus: z
//     .enum(['active', 'inactive', 'on_hold', 'suspended'])
//     .optional(),
//   skills: z.array(z.string()).optional(),
//   hoursContributed: z.number().optional(),
//   // Admin fields
//   adminId: z.string().optional(),
//   accessLevel: z.enum(['branch', 'regional', 'national', 'global']).optional(),
//   // Visitor fields
//   visitorId: z.string().optional(),
//   visitDate: z.date().optional(),
//   howDidYouHear: z
//     .enum(['friend', 'family', 'online', 'flyer', 'other'])
//     .optional(),
//   followUpStatus: z
//     .enum(['pending', 'contacted', 'interested', 'not_interested'])
//     .optional(),
//   interestedInMembership: z.boolean().optional(),
// });

// type FormData = z.infer<typeof formSchema>;

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // 👈 unwrap the promise
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useFetchUserById(id);

  const Address = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  };
  const BranchId = {
    _id: '',
    churchId: '',
    branchName: '',
    address: Address,
    capacity: 0,
    pastorId: '',
    users: 0,
    establishedDate: '',
    isActive: false,
    createdAt: false,
    updatedAt: false,
  };
  const Department = {
    _id: '',
    churchId: '',
    branchId: BranchId,
    departmentName: '',
    meetingDay: [],
    meetingTime: '',
    description: '',
    isActive: false,
    createdAt: '',
    updatedAt: '',
  };
  const GroupId = {
    churchId: '',
    groupName: '',
    leaderId: '',
    meetingDay: [],
    meetingTime: [],
    description: '',
    category: 'youth',
    location: '',
    capacity: 0,
    isActive: false,
    createdAt: undefined,
    updatedAt: undefined,
  };
  const EmergencyDetails = {
    emergencyContactFullName: '',
    emergencyContactEmail: '',
    emergencyContactPhoneNumber: '',
    emergencyContactRelationship: '',
    emergencyContactAddress: '',
    emergencyContactNotes: '',
  };
  const MemberDetails = {
    memberId: '',
    membershipDate: undefined,
    membershipStatus: 'active' as const,
    departmentIds: [Department],
    groupIds: [GroupId],
    occupation: '',
    baptismDate: undefined,
    joinedDate: undefined,
  };
  const PastorDetails = {
    pastorId: '',
    ordinationDate: undefined,
    qualifications: [],
    specializations: [],
    assignments: [],
    sermonCount: 0,
    counselingSessions: 0,
    biography: '',
  };
  const BishopDetails = {
    bishopId: '',
    appointmentDate: undefined,
    jurisdictionArea: '',
    oversight: {},
    qualifications: [],
    achievements: [],
    biography: '',
  };
  const StaffDetails = {
    staffId: '',
    jobTitle: '',
    department: '',
    startDate: undefined,
    salary: 0,
    employmentType: 'full-time' as const,
    isActive: false,
  };
  const VolunteerDetails = {
    volunteerId: '',
    volunteerStatus: 'active' as const,
    availabilitySchedule: {},
    departments: [],
    volunteerRoles: [{}],
    backgroundCheck: {},
    hoursContributed: 0,
  };
  const AdminDetails = {
    adminId: '',
    accessLevel: 'national' as const,
    assignedBranches: [],
  };
  const SuperAdminDetails = {
    superAdminId: '',
    accessLevel: 'global' as const,
    systemSettings: {},
    companyInfo: {},
  };
  const VisitorDetails = {
    visitorId: '',
    visitDate: undefined,
    invitedBy: '',
    howDidYouHear: 'friend' as const,
    followUpStatus: 'interested' as const,
    followUpDate: undefined,
    followUpNotes: '',
    interestedInMembership: false,
    servicesAttended: [],
    occupation: '',
  };

  const form = useForm<UpdateUserPayload>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: Address,
      dateOfBirth: undefined,
      gender: 'male',
      profilePictureUrl: undefined,
      occupation: '',
      churchId: '',
      branchId: BranchId,
      isMember: false,
      role: 'member',
      isStaff: false,
      isVolunteer: false,
      /* Role-specific */
      memberDetails: MemberDetails,
      pastorDetails: PastorDetails,
      bishopDetails: BishopDetails,
      staffDetails: StaffDetails,
      volunteerDetails: VolunteerDetails,
      adminDetails: AdminDetails,
      superAdminDetails: SuperAdminDetails,
      visitorDetails: VisitorDetails,
      status: 'active',
      isEmailVerified: false,
      lastLogin: undefined,
      maritalStatus: 'single',
      emergencyDetails: EmergencyDetails,
      notes: '',
      skills: [],
      createdAt: undefined,
      updatedAt: undefined,
    },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        // Basic
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || Address,
        dateOfBirth: user?.dateOfBirth,
        gender: user?.gender || 'male',
        profilePictureUrl: user?.profilePictureUrl || undefined,
        occupation: user?.occupation || '',
        churchId: user?.churchId || '',
        branchId: user?.branchId || BranchId,
        isMember: user?.isMember ?? false,
        role: user?.role || 'member',
        isStaff: user?.isStaff ?? false,
        isVolunteer: user?.isVolunteer ?? false,
        status: user?.status || 'active',
        isEmailVerified: user?.isEmailVerified ?? false,
        lastLogin: user?.lastLogin,
        maritalStatus: user?.maritalStatus || 'single',
        emergencyDetails: user?.emergencyDetails || EmergencyDetails,
        notes: user?.notes || '',
        skills: user?.skills || [],
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,

        // Member details
        memberDetails: {
          memberId: user?.memberDetails?.memberId || '',
          membershipDate: user?.memberDetails?.membershipDate,
          membershipStatus: user?.memberDetails?.membershipStatus || 'active',
          departmentIds: user?.memberDetails?.departmentIds || [],
          groupIds: user?.memberDetails?.groupIds || [],
          occupation: user?.memberDetails?.occupation || '',
          baptismDate: user?.memberDetails?.baptismDate,
          joinedDate: user?.memberDetails?.joinedDate,
        },

        // Pastor details
        pastorDetails: {
          pastorId: user?.pastorDetails?.pastorId || '',
          ordinationDate: user?.pastorDetails?.ordinationDate,
          qualifications: user?.pastorDetails?.qualifications || [],
          specializations: user?.pastorDetails?.specializations || [],
          assignments: user?.pastorDetails?.assignments || [],
          sermonCount: user?.pastorDetails?.sermonCount || 0,
          counselingSessions: user?.pastorDetails?.counselingSessions || 0,
          biography: user?.pastorDetails?.biography || '',
        },

        // Bishop details
        bishopDetails: {
          bishopId: user?.bishopDetails?.bishopId || '',
          appointmentDate: user?.bishopDetails?.appointmentDate,
          jurisdictionArea: user?.bishopDetails?.jurisdictionArea || '',
          oversight: user?.bishopDetails?.oversight || {},
          qualifications: user?.bishopDetails?.qualifications || [],
          achievements: user?.bishopDetails?.achievements || [],
          biography: user?.bishopDetails?.biography || '',
        },

        // Staff details
        staffDetails: {
          staffId: user?.staffDetails?.staffId || '',
          jobTitle: user?.staffDetails?.jobTitle || '',
          department: user?.staffDetails?.department || '',
          startDate: user?.staffDetails?.startDate,
          salary: user?.staffDetails?.salary || 0,
          employmentType: user?.staffDetails?.employmentType || 'full-time',
          isActive: user?.staffDetails?.isActive ?? false,
        },

        // Volunteer details
        volunteerDetails: {
          volunteerId: user?.volunteerDetails?.volunteerId || '',
          volunteerStatus: user?.volunteerDetails?.volunteerStatus || 'active',
          availabilitySchedule:
            user?.volunteerDetails?.availabilitySchedule || {},
          departments: user?.volunteerDetails?.departments || [],
          volunteerRoles: user?.volunteerDetails?.volunteerRoles || [],
          backgroundCheck: user?.volunteerDetails?.backgroundCheck || {},
          hoursContributed: user?.volunteerDetails?.hoursContributed || 0,
        },

        // Admin details
        adminDetails: {
          adminId: user?.adminDetails?.adminId || '',
          accessLevel: user?.adminDetails?.accessLevel || 'national',
          assignedBranches: user?.adminDetails?.assignedBranches || [],
        },

        // Super admin details
        superAdminDetails: {
          superAdminId: user?.superAdminDetails?.superAdminId || '',
          accessLevel: user?.superAdminDetails?.accessLevel || 'global',
          systemSettings: user?.superAdminDetails?.systemSettings || {},
          companyInfo: user?.superAdminDetails?.companyInfo || {},
        },

        // Visitor details
        visitorDetails: {
          visitorId: user?.visitorDetails?.visitorId || '',
          visitDate: user?.visitorDetails?.visitDate,
          invitedBy: user?.visitorDetails?.invitedBy || '',
          howDidYouHear: user?.visitorDetails?.howDidYouHear || 'friend',
          followUpStatus: user?.visitorDetails?.followUpStatus || 'pending',
          followUpDate: user?.visitorDetails?.followUpDate,
          followUpNotes: user?.visitorDetails?.followUpNotes || '',
          interestedInMembership:
            user?.visitorDetails?.interestedInMembership ?? false,
          servicesAttended: user?.visitorDetails?.servicesAttended || [],
          occupation: user?.visitorDetails?.occupation || '',
        },
      });
    }
  }, [form.reset, user]);


  const currentRole = form.watch('role');

  const onSubmit = (data: FormData) => {
    // biome-ignore lint/suspicious/noConsole: ignore
    console.log('[v0] Form submitted:', data);
    // Handle form submission
  };

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
                name="memberId"
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
                name="membershipDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start bg-transparent text-left font-normal"
                            variant="outline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baptismDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baptism Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start bg-transparent text-left font-normal"
                            variant="outline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
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
                name="pastorId"
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
                name="ordinationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordination Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start bg-transparent text-left font-normal"
                            variant="outline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sermonCount"
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
                  name="counselingSessions"
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
                name="biography"
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
                name="bishopId"
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
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start bg-transparent text-left font-normal"
                            variant="outline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurisdictionArea"
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
                name="biography"
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
                name="adminId"
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
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
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
                name="adminId"
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
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      defaultValue="global"
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
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
                name="visitorId"
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
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className="w-full justify-start bg-transparent text-left font-normal"
                            variant="outline"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="howDidYouHear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How Did You Hear About Us?</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="flyer">Flyer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interestedInMembership"
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
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {isErrorUser && <RenderApiError error={errorUser} />}
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
            <div className="flex items-center space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={form.handleSubmit(onSubmit)}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs className="space-y-4" defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="role">Role Details</TabsTrigger>
                  <TabsTrigger value="church">Church Details</TabsTrigger>
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
                            alt={`${form.watch('firstName')} ${form.watch('lastName')}`}
                            src="/placeholder.svg?height=96&width=96"
                          />
                          <AvatarFallback className="text-lg">
                            {form.watch('firstName')?.[0]}
                            {form.watch('lastName')?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                        </Button>
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
                              <FormLabel>Skills (Array of strings)</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                </TabsContent>
                <TabsContent className="space-y-6" value="role">
                  {renderRoleSpecificFields()}
                </TabsContent>
                <TabsContent className="space-y-6" value="church">
                  {/* Church Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Church className="h-5 w-5" />
                        <span>Church Information</span>
                      </CardTitle>
                      <CardDescription>
                        Role and branch assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                            <FormLabel>
                              Branch <span className="text-red-500">*</span>
                            </FormLabel>
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
                      {/* Secondary role flags */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <FormField
                          control={form.control}
                          name="isVolunteer"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Volunteer</FormLabel>
                                <p className="text-gray-500 text-sm">
                                  This person also volunteers in church
                                  activities
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temporary Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              disabled
                              placeholder="Enter temporary password"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-gray-500 text-sm">
                            User will be prompted to change this on first login
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                      {user?.isStaff && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Staff Details</CardTitle>
                            <CardDescription>
                              Staff-specific information
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="staffId"
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
                                name="jobTitle"
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
                                name="department"
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
                              name="employmentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Employment Type</FormLabel>
                                  <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="full-time">
                                        Full-time
                                      </SelectItem>
                                      <SelectItem value="part-time">
                                        Part-time
                                      </SelectItem>
                                      <SelectItem value="contract">
                                        Contract
                                      </SelectItem>
                                      <SelectItem value="casual">
                                        Casual
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="salary"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Salary</FormLabel>
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
                          </CardContent>
                        </Card>
                      )}
                      {user?.isVolunteer && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Volunteer Details</CardTitle>
                            <CardDescription>
                              Volunteer-specific information
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="volunteerId"
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
                              name="volunteerStatus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Volunteer Status</FormLabel>
                                  <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                      <SelectItem value="on_hold">
                                        On Hold
                                      </SelectItem>
                                      <SelectItem value="suspended">
                                        Suspended
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="hoursContributed"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hours Contributed</FormLabel>
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
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
