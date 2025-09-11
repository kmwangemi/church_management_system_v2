import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFetchUsers } from '@/lib/hooks/church/user/use-user-queries';
import type { UserResponse } from '@/lib/types/user';
import { capitalizeFirstLetter, cn, getFirstLetter } from '@/lib/utils';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { useState } from 'react';

interface UserComboboxProps {
  value?: string | null; // user ID
  onChange?: (userId: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function UserCombobox({
  value,
  onChange,
  placeholder = 'Select member...',
  className,
  disabled = false,
}: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users with search term
  const { data, isLoading } = useFetchUsers(1, searchTerm);
  const users = data?.users || [];

  // Find selected user
  const selectedUser = users.find((user) => user._id === value);

  const handleSelect = (userId: string) => {
    const newValue = userId === value ? null : userId;
    onChange?.(newValue);
    setOpen(false);
  };

  const getDisplayName = (user: UserResponse): string => {
    return `${capitalizeFirstLetter(user.firstName || '')} ${capitalizeFirstLetter(user.lastName || '')}`.trim();
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {/** biome-ignore lint/a11y/useSemanticElements: ignore */}
        <Button
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          role="combobox"
          variant="outline"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {selectedUser ? (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate">{getDisplayName(selectedUser)}</span>
                {selectedUser.email && (
                  <span className="truncate text-muted-foreground text-xs">
                    {selectedUser.email}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setSearchTerm}
            placeholder="Search members..."
            value={searchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading members...' : 'No members found.'}
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  className="flex items-center gap-2"
                  key={user._id}
                  onSelect={handleSelect}
                  value={user._id}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === user._id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={user?.firstName || 'Member'}
                      src={user?.profilePictureUrl || ''}
                    />
                    <AvatarFallback>
                      {`${getFirstLetter(user?.firstName || '')}${getFirstLetter(user?.lastName || '')}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {getDisplayName(user)}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      {user.email && (
                        <span className="truncate">{user.email}</span>
                      )}
                      {user.branchId?.branchName && (
                        <>
                          {user.email && <span>•</span>}
                          <span>{user.branchId.branchName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// import { UserCombobox } from './path/to/UserCombobox';

// <FormField
//   control={form.control}
//   name="userId" // Make sure your form expects a string ID
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>Member</FormLabel>
//       <FormControl>
//         <UserCombobox
//           className="w-full"
//           value={field.value}
//           onChange={field.onChange}
//           placeholder="Search and select a member"
//         />
//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />;
