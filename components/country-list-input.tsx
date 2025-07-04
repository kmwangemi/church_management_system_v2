import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { countries } from 'countries-list';
import { ChevronDown, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CountrySelectComponent = React.forwardRef<
  HTMLDivElement,
  CountrySelectProps
>(
  (
    {
      className,
      placeholder = 'Select country',
      value,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // Convert countries object to array and sort alphabetically
    const countryOptions = useMemo(() => {
      return Object.entries(countries)
        .map(([code, country]) => ({
          name: country.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }, []);
    // Filter countries based on search term (only by name now)
    const filteredCountries = useMemo(() => {
      if (!searchTerm) return countryOptions;
      return countryOptions.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [countryOptions, searchTerm]);
    const selectedCountry = countryOptions.find(
      country => country.name === value,
    );
    const handleSelect = (countryName: string) => {
      onChange?.(countryName);
      setIsOpen(false);
      setSearchTerm('');
    };
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <button
          type='button'
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className='flex items-center gap-2'>
            {selectedCountry ? (
              <span>{selectedCountry.name}</span>
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </button>
        {isOpen && (
          <div className='absolute top-full left-0 z-50 mt-1 w-full border rounded-md bg-popover shadow-lg'>
            <div className='p-2 border-b'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Search countries...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>
            <div className='max-h-60 overflow-auto'>
              {filteredCountries.length > 0 ? (
                filteredCountries.map(country => (
                  <button
                    key={country.name}
                    type='button'
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 text-sm',
                      value === country.name && 'bg-accent',
                    )}
                    onClick={() => handleSelect(country.name)}
                  >
                    <span>{country.name}</span>
                  </button>
                ))
              ) : (
                <div className='px-3 py-2 text-sm text-muted-foreground'>
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

CountrySelectComponent.displayName = 'CountrySelect';

export { CountrySelectComponent as CountrySelect };
