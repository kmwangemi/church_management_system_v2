import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TimeInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'onChange'
  > {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiSelect?: boolean;
  format24Hour?: boolean;
  step?: number; // minutes step (5, 10, 15, 30)
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      className,
      value,
      onChange,
      multiSelect = false,
      format24Hour = true,
      step = 15,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState<string[]>(() => {
      if (multiSelect) {
        return Array.isArray(value) ? value : value ? [value] : [];
      }
      return [];
    });
    const [singleTime, setSingleTime] = useState<string>(() => {
      if (!multiSelect) {
        return Array.isArray(value) ? value[0] || '' : value || '';
      }
      return '';
    });
    const containerRef = useRef<HTMLDivElement>(null);
    // const inputRef = useRef<HTMLInputElement>(null);

    // Generate time options based on step
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ignore excessive complexity
    const generateTimeOptions = () => {
      // biome-ignore lint/suspicious/noEvolvingTypes: ignore
      const options = [];
      const totalMinutes = 24 * 60; // Total minutes in a day
      for (let i = 0; i < totalMinutes; i += step) {
        const hours = Math.floor(i / 60);
        const minutes = i % 60;
        if (format24Hour) {
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          options.push(timeString);
        } else {
          const displayHour =
            hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          const valueString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          options.push({ display: timeString, value: valueString });
        }
      }
      return options;
    };

    const timeOptions = generateTimeOptions();

    // Handle clicking outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleTimeSelect = (timeValue: string) => {
      if (multiSelect) {
        const newSelectedTimes = selectedTimes.includes(timeValue)
          ? selectedTimes.filter((t) => t !== timeValue)
          : [...selectedTimes, timeValue].sort();
        setSelectedTimes(newSelectedTimes);
        onChange?.(newSelectedTimes);
      } else {
        setSingleTime(timeValue);
        onChange?.(timeValue);
        setIsOpen(false);
      }
    };

    const removeTime = (timeToRemove: string) => {
      if (multiSelect) {
        const newSelectedTimes = selectedTimes.filter(
          (t) => t !== timeToRemove
        );
        setSelectedTimes(newSelectedTimes);
        onChange?.(newSelectedTimes);
      }
    };

    const formatDisplayTime = (time: string) => {
      if (format24Hour) return time;
      const [hours, minutes] = time.split(':').map(Number);
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const getDisplayValue = () => {
      if (multiSelect) {
        return selectedTimes.length > 0
          ? `${selectedTimes.length} time${selectedTimes.length > 1 ? 's' : ''} selected`
          : '';
      }
      return singleTime ? formatDisplayTime(singleTime) : '';
    };

    const getPlaceholderText = () => {
      if (placeholder) return placeholder;
      if (multiSelect) return 'Select times';
      return format24Hour ? 'Select time (24h)' : 'Select time (12h)';
    };

    return (
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Input
            className={cn('cursor-pointer pe-10', className)}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            placeholder={getPlaceholderText()}
            readOnly
            ref={ref}
            value={getDisplayValue()}
            {...props}
          />
          <button
            className="-translate-y-1/2 absolute top-1/2 right-3 transform text-muted-foreground"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setIsOpen(!isOpen);
            }}
            title="Select time"
            type="button"
          >
            <Clock className="size-5 cursor-pointer" />
          </button>
        </div>

        {/* Multi-select chips */}
        {multiSelect && selectedTimes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTimes.map((time) => (
              <div
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary text-sm"
                key={time}
              >
                <span>{formatDisplayTime(time)}</span>
                <button
                  className="rounded-full p-0.5 hover:bg-primary/20"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTime(time);
                  }}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg">
            <div className="p-2">
              <div className="grid grid-cols-3 gap-1">
                {timeOptions.map((option) => {
                  const timeValue =
                    typeof option === 'string' ? option : option.value;
                  const displayTime =
                    typeof option === 'string'
                      ? formatDisplayTime(option)
                      : option.display;
                  const isSelected = multiSelect
                    ? selectedTimes.includes(timeValue)
                    : singleTime === timeValue;
                  return (
                    <button
                      className={cn(
                        'rounded p-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        isSelected &&
                          'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                      key={timeValue}
                      onClick={() => handleTimeSelect(timeValue)}
                      type="button"
                    >
                      {displayTime}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TimeInput.displayName = 'TimeInput';

export { TimeInput };



// With form integration single time selection
// <TimeInput {...field} />;
