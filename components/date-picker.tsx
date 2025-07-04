'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Date formatting utility
function formatDate(
  date: Date | undefined,
  format: 'long' | 'short' | 'iso' = 'long',
) {
  if (!date) {
    return '';
  }
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
  }
}

// Date validation utility
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

// Parse date from string
function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isValidDate(date) ? date : undefined;
}

// Custom Input Component for react-datepicker
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder, disabled, className, ...props }, ref) => (
    <div className={cn('relative', className)}>
      <Input
        ref={ref}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className='pr-10 cursor-pointer'
        onClick={onClick}
        {...props}
      />
      <Button
        type='button'
        variant='ghost'
        disabled={disabled}
        className='absolute top-1/2 right-2 size-6 -translate-y-1/2 hover:bg-accent'
        onClick={onClick}
      >
        <CalendarIcon className='size-3.5' />
        <span className='sr-only'>Select date</span>
      </Button>
    </div>
  ),
);

CustomInput.displayName = 'CustomInput';

interface DatePickerComponentProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  format?: 'long' | 'short' | 'iso';
  minDate?: Date;
  maxDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  showWeekNumbers?: boolean;
  dateFormat?: string;
}

const DatePickerComponent = React.forwardRef<
  HTMLDivElement,
  DatePickerComponentProps
>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date',
      className,
      disabled = false,
      format = 'long',
      minDate,
      maxDate,
      showYearDropdown = true,
      showMonthDropdown = true,
      scrollableYearDropdown = true,
      yearDropdownItemNumber = 50,
      showWeekNumbers = false,
      dateFormat,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    // Determine date format based on format prop
    const getDateFormat = () => {
      if (dateFormat) return dateFormat;
      switch (format) {
        case 'short':
          return 'MM/dd/yyyy';
        case 'iso':
          return 'yyyy-MM-dd';
        default:
          return 'MMMM dd, yyyy';
      }
    };
    const handleDateChange = (date: Date | null) => {
      onChange?.(date || undefined);
      setOpen(false);
    };
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div>
              <CustomInput
                value={value ? formatDate(value, format) : ''}
                onClick={() => !disabled && setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className='w-full'
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start' sideOffset={4}>
            <DatePicker
              selected={value}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              showYearDropdown={showYearDropdown}
              showMonthDropdown={showMonthDropdown}
              scrollableYearDropdown={scrollableYearDropdown}
              yearDropdownItemNumber={yearDropdownItemNumber}
              showWeekNumbers={showWeekNumbers}
              dateFormat={getDateFormat()}
              inline
              calendarClassName='react-datepicker-custom'
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DatePickerComponent.displayName = 'DatePickerComponent';

// Date Range Picker Component
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  format?: 'long' | 'short' | 'iso';
  minDate?: Date;
  maxDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  selectsRange?: boolean;
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      startDate,
      endDate,
      onStartDateChange,
      onEndDateChange,
      className,
      disabled = false,
      format = 'long',
      minDate,
      maxDate,
      showYearDropdown = true,
      showMonthDropdown = true,
      scrollableYearDropdown = true,
      yearDropdownItemNumber = 50,
      selectsRange = false,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    // Determine date format
    const getDateFormat = () => {
      switch (format) {
        case 'short':
          return 'MM/dd/yyyy';
        case 'iso':
          return 'yyyy-MM-dd';
        default:
          return 'MMMM dd, yyyy';
      }
    };
    if (selectsRange) {
      // Single DatePicker with range selection
      const handleRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        onStartDateChange?.(start || undefined);
        onEndDateChange?.(end || undefined);
        if (start && end) {
          setOpen(false);
        }
      };
      return (
        <div ref={ref} className={cn('relative', className)} {...props}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div>
                <CustomInput
                  value={
                    startDate && endDate
                      ? `${formatDate(startDate, format)} - ${formatDate(
                          endDate,
                          format,
                        )}`
                      : startDate
                      ? formatDate(startDate, format)
                      : ''
                  }
                  onClick={() => !disabled && setOpen(true)}
                  placeholder='Select date range'
                  disabled={disabled}
                  className='w-full'
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start' sideOffset={4}>
              <DatePicker
                selected={startDate}
                onChange={handleRangeChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                minDate={minDate}
                maxDate={maxDate}
                showYearDropdown={showYearDropdown}
                showMonthDropdown={showMonthDropdown}
                scrollableYearDropdown={scrollableYearDropdown}
                yearDropdownItemNumber={yearDropdownItemNumber}
                dateFormat={getDateFormat()}
                inline
                calendarClassName='react-datepicker-custom'
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    // Separate DatePickers for start and end dates
    return (
      <div ref={ref} className={cn('flex gap-2', className)} {...props}>
        <DatePickerComponent
          value={startDate}
          onChange={onStartDateChange}
          placeholder='Start date'
          disabled={disabled}
          format={format}
          minDate={minDate}
          maxDate={endDate || maxDate}
          showYearDropdown={showYearDropdown}
          showMonthDropdown={showMonthDropdown}
          scrollableYearDropdown={scrollableYearDropdown}
          yearDropdownItemNumber={yearDropdownItemNumber}
          className='flex-1'
        />
        <DatePickerComponent
          value={endDate}
          onChange={onEndDateChange}
          placeholder='End date'
          disabled={disabled}
          format={format}
          minDate={startDate || minDate}
          maxDate={maxDate}
          showYearDropdown={showYearDropdown}
          showMonthDropdown={showMonthDropdown}
          scrollableYearDropdown={scrollableYearDropdown}
          yearDropdownItemNumber={yearDropdownItemNumber}
          className='flex-1'
        />
      </div>
    );
  },
);

DateRangePicker.displayName = 'DateRangePicker';

export {
  DatePickerComponent as DatePicker,
  DateRangePicker,
  formatDate,
  isValidDate,
  parseDate,
};

/*
Installation:
npm install react-datepicker
npm install --save-dev @types/react-datepicker

Usage Examples:

// Basic usage with enhanced month/year scrolling
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>

// With custom date range limits
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date('2020-01-01')}
  maxDate={new Date('2030-12-31')}
  placeholder="Select date"
/>

// Different formats
<DatePicker
  value={date}
  onChange={setDate}
  format="short" // MM/dd/yyyy
  placeholder="MM/DD/YYYY"
/>

<DatePicker
  value={date}
  onChange={setDate}
  format="iso" // yyyy-MM-dd
  placeholder="YYYY-MM-DD"
/>

// Custom date format
<DatePicker
  value={date}
  onChange={setDate}
  dateFormat="dd/MM/yyyy"
  placeholder="DD/MM/YYYY"
/>

// With week numbers
<DatePicker
  value={date}
  onChange={setDate}
  showWeekNumbers={true}
/>

// More year dropdown items
<DatePicker
  value={date}
  onChange={setDate}
  yearDropdownItemNumber={20}
/>

// Date range picker (separate inputs)
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  format="short"
/>

// Date range picker (single input with range selection)
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  selectsRange={true}
  format="short"
/>

// In a form with validation
<FormField
  control={form.control}
  name='birthDate'
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Birth Date <span className='text-red-500'>*</span>
      </FormLabel>
      <FormControl>
        <DatePicker
          value={field.value}
          onChange={field.onChange}
          placeholder="Select your birth date"
          format="long"
          maxDate={new Date()}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Disabled state
<DatePicker
  value={date}
  onChange={setDate}
  disabled={true}
/>
*/
