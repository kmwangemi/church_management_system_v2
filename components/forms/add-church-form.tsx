'use client';

import RenderApiError from '@/components/ApiError';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
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
import { useRegisterChurch } from '@/lib/hooks/auth/use-register';
import { useLogoUpload } from '@/lib/hooks/upload/use-file-upload';
import {
  CHURCH_DENOMINATION_OPTIONS,
  NUMBER_OF_CHURCH_BRANCHES_OPTIONS,
  NUMBER_OF_CHURCH_MEMBERS_OPTIONS,
  SUBSCRIPTION_PLANS,
} from '@/lib/utils';
import {
  ChurchRegistrationPayload,
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

export function AddChurchForm() {
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
  } = useLogoUpload();
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
        country: '',
        website: '',
        churchLogoUrl: '',
        address: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
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
      toast.error('File size must be less than 2MB');
      return;
    }
    setLogoFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
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
          'churchData.address.address',
          'churchData.address.city',
          'churchData.country',
        ]);
        break;
      case 'admin':
        isValid = await form.trigger([
          'adminData.firstName',
          'adminData.lastName',
          'adminData.email',
          'adminData.phoneNumber',
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
    }
    setTabValidationState(prev => ({
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
      } catch (error) {
        toast.error('Failed to upload logo');
        return;
      } finally {
        setLogoUploading(false);
      }
    }
    const validation = churchRegistrationSchema.safeParse(payload);
    if (!validation.success) {
      console.log('Validation errors:', validation.error.issues);
      toast.error('Please fix all validation errors');
      return;
    }
    try {
      await registerChurchMutation(payload);
      toast.success('Church registered successfully!');
      reset();
      setLogoFile(null);
      setLogoPreview(null);
      setCurrentTab('basic');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    }
  };
  return (
    <Form {...form}>
      {isError && <RenderApiError error={error} />}
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 mt-6'>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger
              value='basic'
              className={tabValidationState.basic ? 'border-green-500' : ''}
            >
              Basic Info
              {tabValidationState.basic && (
                <span className='ml-1 text-green-500'>✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='contact'
              className={tabValidationState.contact ? 'border-green-500' : ''}
            >
              Contact
              {tabValidationState.contact && (
                <span className='ml-1 text-green-500'>✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='admin'
              className={tabValidationState.admin ? 'border-green-500' : ''}
            >
              Admin Info
              {tabValidationState.admin && (
                <span className='ml-1 text-green-500'>✓</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='subscription'
              className={
                tabValidationState.subscription ? 'border-green-500' : ''
              }
            >
              Plan
              {tabValidationState.subscription && (
                <span className='ml-1 text-green-500'>✓</span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='basic' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Church className='h-5 w-5' />
                  <span>Basic Church Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details about the church
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='churchData.churchName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Church Name <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Grace Community Church'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='churchData.denomination'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Denomination <span className='text-red-500'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='cursor-pointer'>
                              <SelectValue placeholder='Select denomination' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-[400px] overflow-y-auto'>
                            {CHURCH_DENOMINATION_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className='cursor-pointer'
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
                  name='churchData.description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the church's mission and vision..."
                          className='min-h-[100px]'
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
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='churchData.establishedDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Established Date{' '}
                          <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={date =>
                              field.onChange(date ? date.toISOString() : '')
                            }
                            placeholder='Select established date'
                            format='long'
                            maxDate={new Date()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Logo Upload Section */}
                  <div className='space-y-4'>
                    <FormLabel>Church Logo (Optional)</FormLabel>
                    <div className='flex items-center space-x-4'>
                      <Avatar className='h-16 w-16'>
                        <AvatarImage
                          src={
                            logoPreview ||
                            watch('churchData.churchLogoUrl') ||
                            ''
                          }
                          alt='Church Logo'
                        />
                        <AvatarFallback className='bg-blue-100 text-blue-600'>
                          <Church className='h-8 w-8' />
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/*'
                          onChange={handleLogoSelect}
                          className='hidden'
                        />
                        <div className='flex space-x-2'>
                          {!logoFile ? (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className='mr-2 h-4 w-4' />
                              Select Logo
                            </Button>
                          ) : (
                            <>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleLogoUpload}
                                disabled={logoUploading}
                              >
                                {logoUploading ? (
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                  <Upload className='mr-2 h-4 w-4' />
                                )}
                                {logoUploading ? 'Uploading...' : 'Upload'}
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleLogoRemove}
                              >
                                <X className='mr-2 h-4 w-4' />
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                        {/* Show upload progress */}
                        {isUploading && (
                          <div className='mt-2'>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className='text-xs text-gray-500 mt-1'>
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}
                        {/* Show error if any */}
                        {uploadError && (
                          <p className='text-xs text-red-500 mt-1'>
                            {uploadError}
                          </p>
                        )}
                        {!isUploading && !error && (
                          <p className='text-xs text-gray-500 mt-1'>
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
          <TabsContent value='contact' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <MapPin className='h-5 w-5' />
                  <span>Contact Information</span>
                </CardTitle>
                <CardDescription>
                  Church contact details and address information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='churchData.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='info@church.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='churchData.phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            defaultCountry='KE'
                            placeholder='Enter phone number'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='churchData.website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://www.church.com'
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
                <FormField
                  control={form.control}
                  name='churchData.address.address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Physical Address <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='123 Church Street' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='churchData.address.city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Nairobi' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='churchData.address.state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder='NY' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='churchData.address.zipCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder='10001' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='churchData.country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <CountrySelect
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Select your country'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {/* Admin Tab - Same as original */}
          <TabsContent value='admin' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <User className='h-5 w-5' />
                  <span>Admin Information</span>
                </CardTitle>
                <CardDescription>
                  Details about the church administrator
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='adminData.firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='John' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='adminData.lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Smith' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='adminData.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='admin@church.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='adminData.phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            defaultCountry='KE'
                            placeholder='Enter phone number'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='adminData.password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Create a strong password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='adminData.confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Confirm Password{' '}
                          <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Confirm your password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>
                    Administrator Account
                  </h4>
                  <p className='text-sm text-blue-700'>
                    The admin will be set up as the primary administrator with
                    full access to the church management system. They can add
                    additional users and assign roles as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Subscription Tab - Same as original */}
          <TabsContent value='subscription' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Building2 className='h-5 w-5' />
                  <span>Subscription Plan & Setup</span>
                </CardTitle>
                <CardDescription>
                  Choose the right plan for your church and provide initial
                  setup information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='churchData.subscriptionPlan'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Subscription Plan{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {SUBSCRIPTION_PLANS.map(plan => (
                            <div
                              key={plan.value}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === plan.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => field.onChange(plan.value)}
                            >
                              <div className='flex items-center space-x-2 mb-2'>
                                <input
                                  type='radio'
                                  checked={field.value === plan.value}
                                  onChange={() => field.onChange(plan.value)}
                                  className='text-blue-600'
                                />
                                <span className='font-medium'>
                                  {plan.label}
                                </span>
                              </div>
                              <p className='text-sm text-gray-600'>
                                {plan.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='churchData.churchSize'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Church Size <span className='text-red-500'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='cursor-pointer'>
                              <SelectValue placeholder='Select church size' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-[400px] overflow-y-auto'>
                            {NUMBER_OF_CHURCH_MEMBERS_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className='cursor-pointer'
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
                    name='churchData.numberOfBranches'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Number of Branches{' '}
                          <span className='text-red-500'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='cursor-pointer'>
                              <SelectValue placeholder='Select number' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-[400px] overflow-y-auto'>
                            {NUMBER_OF_CHURCH_BRANCHES_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className='cursor-pointer'
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
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h4 className='font-medium text-green-900 mb-2'>
                    What happens next?
                  </h4>
                  <ul className='text-sm text-green-700 space-y-1'>
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
        <div className='flex justify-between pt-6 border-t'>
          <Button
            type='button'
            variant='outline'
            onClick={handlePreviousTab}
            disabled={currentTab === 'basic'}
          >
            Previous
          </Button>
          {currentTab !== 'subscription' ? (
            <Button type='button' onClick={handleNextTab}>
              Next
            </Button>
          ) : (
            <Button type='submit' disabled={isPending || logoUploading}>
              {isPending ? 'Registering...' : 'Register Church'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
