'use client';

import RenderApiError from '@/components/api-error';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import { NumberInput } from '@/components/number-input';
import { PasswordInput } from '@/components/password-input';
import { PhoneInput } from '@/components/phone-number-input';
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
  FormDescription,
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
import { useRegisterChurch } from '@/lib/hooks/auth/use-register-queries';
import { useFileUpload } from '@/lib/hooks/upload/use-file-upload';
import { errorToastStyle } from '@/lib/toast-styles';
import {
  CHURCH_DENOMINATION_OPTIONS,
  GENDER_OPTIONS,
  NUMBER_OF_CHURCH_MEMBERS_OPTIONS,
  SUBSCRIPTION_PLANS,
} from '@/lib/utils';
import {
  type ChurchRegistrationPayload,
  churchRegistrationSchema,
} from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Church,
  Loader2,
  MapPin,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddChurchFormProps {
  onCloseDialog: () => void;
}

export function AddChurchForm({ onCloseDialog }: AddChurchFormProps) {
  const [currentTab, setCurrentTab] = useState('basic');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValidationState, setTabValidationState] = useState({
    basic: false,
    contact: false,
    admin: false,
    subscription: false,
  });
  const {
    upload,
    isUploading,
    uploadProgress,
    error: uploadError,
    clearError,
  } = useFileUpload('logo');
  const form = useForm<ChurchRegistrationPayload>({
    resolver: zodResolver(churchRegistrationSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      churchData: {
        churchName: '',
        denomination: '',
        description: '',
        establishedDate: '',
        email: '',
        phoneNumber: '',
        website: '',
        churchLogoUrl: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Kenya',
        },
        subscriptionPlan: 'basic',
        churchSize: '',
        numberOfBranches: '',
      },
      adminData: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: 'male',
        isMember: true,
        password: '',
        confirmPassword: '',
        role: 'admin',
      },
    },
  });
  const {
    mutateAsync: registerChurchMutation,
    isPending,
    isError,
    error,
  } = useRegisterChurch();
  const { reset, watch, setValue } = form;
  // Handle logo file selection
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setLogoFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  // Handle logo upload using the hook
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    try {
      // Use the upload function from the hook
      const uploadResponse = await upload(logoFile);
      setValue('churchData.churchLogoUrl', uploadResponse || '');
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.error('Logo upload error:', error);
    }
  };
  // Handle logo removal
  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setValue('churchData.churchLogoUrl', '');
    clearError(); // Clear any upload errors
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Validate current tab fields
  const validateCurrentTabFields = async (tabName: string) => {
    let isValid = true;
    switch (tabName) {
      case 'basic':
        isValid = await form.trigger([
          'churchData.churchName',
          'churchData.denomination',
          'churchData.establishedDate',
        ]);
        break;
      case 'contact':
        isValid = await form.trigger([
          'churchData.email',
          'churchData.phoneNumber',
          'churchData.address.street',
          'churchData.address.city',
          'churchData.address.country',
        ]);
        break;
      case 'admin':
        isValid = await form.trigger([
          'adminData.firstName',
          'adminData.lastName',
          'adminData.email',
          'adminData.phoneNumber',
          'adminData.gender',
          'adminData.password',
          'adminData.confirmPassword',
        ]);
        break;
      case 'subscription':
        isValid = await form.trigger([
          'churchData.subscriptionPlan',
          'churchData.churchSize',
          'churchData.numberOfBranches',
        ]);
        break;
      default:
        // biome-ignore lint/suspicious/noConsole: ignore here
        console.log('defaulted here');
    }
    setTabValidationState((prev) => ({
      ...prev,
      [tabName]: isValid,
    }));
    return isValid;
  };
  // Handle next tab navigation
  const handleNextTab = async () => {
    const tabs = ['basic', 'contact', 'admin', 'subscription'];
    const currentIndex = tabs.indexOf(currentTab);
    const isCurrentTabValid = await validateCurrentTabFields(currentTab);
    if (!isCurrentTabValid) {
      toast.error('Please fix the errors before proceeding');
      return;
    }
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };
  // Handle previous tab navigation
  const handlePreviousTab = () => {
    const tabs = ['basic', 'contact', 'admin', 'subscription'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };
  // Handle form submission
  const onSubmit = async (payload: ChurchRegistrationPayload) => {
    // Upload logo if selected but not uploaded yet
    if (logoFile && !payload.churchData.churchLogoUrl) {
      try {
        setLogoUploading(true);
        const churchLogoUrl = await upload(logoFile);
        payload.churchData.churchLogoUrl = churchLogoUrl || '';
      } catch (_error) {
        toast.error('Failed to upload logo');
        return;
      } finally {
        setLogoUploading(false);
      }
    }
    const validation = churchRegistrationSchema.safeParse(payload);
    if (!validation.success) {
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.log('Validation errors:', validation.error.issues);
      toast.error('Please fix all validation errors');
      return;
    }
    await registerChurchMutation(payload);
    reset();
    setLogoFile(null);
    setLogoPreview(null);
    setCurrentTab('basic');
    onCloseDialog();
  };
  return (
    <Form {...form}>
      {isError && <RenderApiError error={error} />}
      <form className="mt-6 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs onValueChange={setCurrentTab} value={currentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              className={tabValidationState.basic ? 'border-green-500' : ''}
              value="basic"
            >
              Basic Info
              {tabValidationState.basic && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              className={tabValidationState.contact ? 'border-green-500' : ''}
              value="contact"
            >
              Contact
              {tabValidationState.contact && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              className={tabValidationState.admin ? 'border-green-500' : ''}
              value="admin"
            >
              Admin Info
              {tabValidationState.admin && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              className={
                tabValidationState.subscription ? 'border-green-500' : ''
              }
              value="subscription"
            >
              Plan
              {tabValidationState.subscription && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="space-y-6" value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Church className="h-5 w-5" />
                  <span>Basic Church Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details about the church
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.churchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Church Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Grace Community Church"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="churchData.denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Denomination <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select denomination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[400px] overflow-y-auto">
                            {CHURCH_DENOMINATION_OPTIONS.map((option) => (
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
                <FormField
                  control={form.control}
                  name="churchData.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Brief description of the church's mission and vision..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description that will appear on the church
                        profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.establishedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Established Date{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            format="long"
                            maxDate={new Date()}
                            onChange={(date) =>
                              field.onChange(date ? date.toISOString() : '')
                            }
                            placeholder="Select established date"
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Logo Upload Section */}
                  <div className="space-y-4">
                    <FormLabel>Church Logo (Optional)</FormLabel>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          alt="Church Logo"
                          src={
                            logoPreview ||
                            watch('churchData.churchLogoUrl') ||
                            ''
                          }
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Church className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <input
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoSelect}
                          ref={fileInputRef}
                          type="file"
                        />
                        <div className="flex space-x-2">
                          {logoFile ? (
                            <>
                              <Button
                                disabled={logoUploading}
                                onClick={handleLogoUpload}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                {logoUploading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" />
                                )}
                                {logoUploading ? 'Uploading...' : 'Upload'}
                              </Button>
                              <Button
                                onClick={handleLogoRemove}
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
                              Select Logo
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Contact Tab - Same as original */}
          <TabsContent className="space-y-6" value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Church Contact Information</span>
                </CardTitle>
                <CardDescription>
                  Church contact details and address information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="info@church.com"
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
                    name="churchData.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
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
                </div>
                <FormField
                  control={form.control}
                  name="churchData.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.church.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional church website URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country <span className="text-red-500">*</span>
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
                    name="churchData.address.city"
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
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="churchData.address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="churchData.address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Physical Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Church Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {/* Admin Tab - Same as original */}
          <TabsContent className="space-y-6" value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Admin Information</span>
                </CardTitle>
                <CardDescription>
                  Details about the church administrator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="adminData.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminData.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="adminData.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@church.com"
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
                    name="adminData.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
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
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="adminData.gender"
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
                    name="adminData.isMember"
                    render={({ field }) => (
                      <FormItem className="mt-4 flex flex-row items-start space-x-3 space-y-0">
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
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="adminData.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Create a strong password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminData.confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Confirm Password{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
                    Administrator Account
                  </h4>
                  <p className="text-blue-700 text-sm">
                    The admin will be set up as the primary administrator with
                    full access to the church management system. They can add
                    additional users and assign roles as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Subscription Tab - Same as original */}
          <TabsContent className="space-y-6" value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Subscription Plan & Setup</span>
                </CardTitle>
                <CardDescription>
                  Choose the right plan for your church and provide initial
                  setup information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="churchData.subscriptionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Subscription Plan{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {SUBSCRIPTION_PLANS.map((plan) => (
                            <button
                              aria-pressed={field.value === plan.value}
                              className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-colors ${
                                field.value === plan.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              key={plan.value}
                              onClick={() => field.onChange(plan.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  field.onChange(plan.value);
                                }
                              }}
                              tabIndex={0}
                              type="button"
                            >
                              <div className="mb-2 flex items-center space-x-2">
                                <input
                                  aria-hidden="true"
                                  checked={field.value === plan.value}
                                  className="text-blue-600"
                                  onChange={() => field.onChange(plan.value)}
                                  tabIndex={-1}
                                  type="radio"
                                />
                                <span className="font-medium text-sm">
                                  {plan.label}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {plan.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="churchData.churchSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Church Size <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select church size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[400px] overflow-y-auto">
                            {NUMBER_OF_CHURCH_MEMBERS_OPTIONS.map((option) => (
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
                    name="churchData.numberOfBranches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Number of Branches{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <NumberInput placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <h4 className="mb-2 font-medium text-green-900">
                    What happens next?
                  </h4>
                  <ul className="space-y-1 text-green-700 text-sm">
                    <li>• Church account will be created and activated</li>
                    <li>• Admin will receive login credentials via email</li>
                    <li>• 30-day free trial will begin automatically</li>
                    <li>• Our support team will help with initial setup</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between border-t pt-6">
          <Button
            disabled={currentTab === 'basic'}
            onClick={handlePreviousTab}
            type="button"
            variant="outline"
          >
            Previous
          </Button>
          {currentTab !== 'subscription' ? (
            <Button onClick={handleNextTab} type="button">
              Next
            </Button>
          ) : (
            <Button disabled={isPending || isUploading} type="submit">
              {isPending || isUploading ? 'Registering...' : 'Register Church'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
