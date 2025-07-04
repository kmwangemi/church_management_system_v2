// MultiSelect Component Implementation
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };
  const selectedLabels = selected.map(
    value => options.find(option => option.value === value)?.label || value,
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <div className='flex flex-wrap gap-1 max-w-full'>
            {selected.length === 0 ? (
              <span className='text-muted-foreground'>{placeholder}</span>
            ) : selected.length <= 2 ? (
              selectedLabels.map((label, index) => (
                <Badge
                  key={index}
                  variant='secondary'
                  className='text-xs'
                  onClick={e => {
                    e.stopPropagation();
                    handleRemove(selected[index]);
                  }}
                >
                  {label}
                  <X className='ml-1 h-3 w-3 cursor-pointer' />
                </Badge>
              ))
            ) : (
              <Badge variant='secondary' className='text-xs'>
                {selected.length} departments selected
              </Badge>
            )}
          </div>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search departments...' />
          <CommandEmpty>No department found.</CommandEmpty>
          <CommandGroup className='max-h-64 overflow-auto'>
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
                className='cursor-pointer'
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected.includes(option.value)
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
