import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { countries } from 'countries-list';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import PhoneInputComponent, {
  Country,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Custom input component that matches your UI
const CustomPhoneInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <Input
      className={cn(
        'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

CustomPhoneInput.displayName = 'CustomPhoneInput';

// Custom country select component
const CountrySelect = ({
  value,
  onChange,
  options,
  ...rest
}: {
  value?: Country;
  onChange: (value?: Country) => void;
  options: { value?: Country; label: string }[];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  // const selectedCountry = value
  //   ? countries[value as keyof typeof countries]
  //   : null;
  return (
    <div className='relative'>
      <button
        type='button'
        className='flex items-center gap-1 px-3 py-2 border rounded-l-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring'
        onClick={() => setIsOpen(!isOpen)}
        {...rest}
      >
        <span className='text-sm'>
          {value
            ? `${getCountryFlag(value)} +${getCountryCallingCode(value)}`
            : '🌍'}
        </span>
        <ChevronDown className='size-3' />
      </button>
      {isOpen && (
        <div className='absolute top-full left-0 z-50 mt-1 w-64 max-h-60 overflow-auto border rounded-md bg-popover shadow-lg'>
          {options.map(option => {
            const countryCode = option.value;
            const country = countryCode
              ? countries[countryCode as keyof typeof countries]
              : null;
            return (
              <button
                key={option.value || 'none'}
                type='button'
                className='w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 text-sm'
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{countryCode ? getCountryFlag(countryCode) : '🌍'}</span>
                <span>{country?.name || 'Unknown'}</span>
                <span className='ml-auto text-muted-foreground'>
                  {countryCode ? `+${getCountryCallingCode(countryCode)}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper function to get country flag emoji
const getCountryFlag = (countryCode: Country): string => {
  if (!countryCode) return '🌍';
  // Convert country code to regional indicator symbols
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

// Main PhoneInput component
interface PhoneInputProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  className?: string;
  defaultCountry?: Country;
  disabled?: boolean;
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      className,
      placeholder = 'Enter phone number',
      defaultCountry = 'KE',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex border rounded-md focus-within:ring-2 focus-within:ring-ring',
          className,
        )}
      >
        <PhoneInputComponent
          {...props}
          onChange={props.onChange ?? (() => {})}
          defaultCountry={defaultCountry}
          placeholder={placeholder}
          inputComponent={CustomPhoneInput}
          countrySelectComponent={CountrySelect}
          className='flex w-full'
        />
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

// Utility functions for validation
export const validatePhoneNumber = (phoneNumber?: string): boolean => {
  if (!phoneNumber) return false;
  return isValidPhoneNumber(phoneNumber);
};

export const formatPhoneNumber = (phoneNumber?: string): string => {
  if (!phoneNumber) return '';
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed?.formatInternational() || phoneNumber;
  } catch {
    return phoneNumber;
  }
};

export { PhoneInput };

// Usage example in your form:
/*
// For phone number:
<FormField
  control={churchForm.control}
  name='phoneNumber'
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Phone Number <span className='text-red-500'>*</span>
      </FormLabel>
      <FormControl>
        <PhoneInput
          value={field.value}
          onChange={field.onChange}
          defaultCountry="KE"
          placeholder="Enter phone number"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Form validation schema:
const formSchema = z.object({
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((val) => validatePhoneNumber(val), {
      message: "Please enter a valid phone number",
    }),
  country: z.string().min(1, "Please select a country"),
});
*/
