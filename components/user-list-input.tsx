import { Input } from '@/components/ui/input';
import { useFetchUsers } from '@/lib/hooks/user/use-user-queries';
import { errorToastStyle } from '@/lib/toast-styles';
import type { UserResponse } from '@/lib/types/user';
import { capitalizeFirstLetter, cn, getFirstLetter } from '@/lib/utils';
import {
  ArrowUp,
  ChevronDown,
  Clock,
  Loader2,
  Search,
  User,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RecentSearch {
  id: string;
  member: UserResponse;
  searchedAt: Date;
}

interface UserListInputProps {
  value?: UserResponse | null;
  onChange?: (member: UserResponse | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  displayProperty?: keyof UserResponse;
  maxRecentSearches?: number;
}

const UserListInputComponent = React.forwardRef<
  HTMLDivElement,
  UserListInputProps
>(
  (
    {
      className,
      placeholder = 'Search members...',
      value,
      onChange,
      disabled,
      displayProperty = 'firstName',
      maxRecentSearches = 5,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [showRecentSearches, setShowRecentSearches] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // Load recent searches from localStorage on mount
    useEffect(() => {
      const saved = localStorage.getItem('member-search-recent');
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((item: any) => ({
            ...item,
            searchedAt: new Date(item.searchedAt),
          }));
          setRecentSearches(parsed);
        } catch (_error) {
          toast.error('Failed to parse recent searches:', {
            style: errorToastStyle,
          });
        }
      }
    }, []);
    // Save recent searches to localStorage
    const saveRecentSearches = useCallback((searches: RecentSearch[]) => {
      localStorage.setItem('member-search-recent', JSON.stringify(searches));
    }, []);
    // Add to recent searches
    const addToRecentSearches = useCallback(
      (member: UserResponse) => {
        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (item) => item.member._id !== member._id
          );
          const newSearches = [
            { id: crypto.randomUUID(), member, searchedAt: new Date() },
            ...filtered,
          ].slice(0, maxRecentSearches);
          saveRecentSearches(newSearches);
          return newSearches;
        });
      },
      [maxRecentSearches, saveRecentSearches]
    );
    // Remove from recent searches
    const removeFromRecentSearches = useCallback(
      (searchId: string) => {
        setRecentSearches((prev) => {
          const filtered = prev.filter((item) => item.id !== searchId);
          saveRecentSearches(filtered);
          return filtered;
        });
      },
      [saveRecentSearches]
    );
    // Clear all recent searches
    const clearRecentSearches = useCallback(() => {
      setRecentSearches([]);
      localStorage.removeItem('member-search-recent');
    }, []);
    // Debounce search term
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setShowRecentSearches(searchTerm.length === 0);
      }, 300);
      return () => clearTimeout(timer);
    }, [searchTerm]);
    // Fetch members using the provided hook
    const { data, isLoading, error } = useFetchUsers(1, debouncedSearchTerm);
    // Extract members array from the API response
    const members: UserResponse[] = useMemo(() => {
      if (!data?.users) return [];
      return data.users;
    }, [data]);
    // Combine recent searches and current results for keyboard navigation
    const allItems = useMemo(() => {
      const items: Array<{
        type: 'recent' | 'member' | 'action';
        data: any;
        index: number;
      }> = [];
      let currentIndex = 0;
      if (showRecentSearches && recentSearches.length > 0) {
        recentSearches.forEach((recent) => {
          items.push({ type: 'recent', data: recent, index: currentIndex++ });
        });
        if (recentSearches.length > 0) {
          items.push({ type: 'action', data: 'clear', index: currentIndex++ });
        }
      } else if (!isLoading && members.length > 0) {
        members.forEach((member) => {
          items.push({ type: 'member', data: member, index: currentIndex++ });
        });
      }
      return items;
    }, [showRecentSearches, recentSearches, members, isLoading]);
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < allItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < allItems.length) {
            const item = allItems[focusedIndex];
            if (item.type === 'recent') {
              handleSelect(item.data.member);
            } else if (item.type === 'member') {
              handleSelect(item.data);
            } else if (item.type === 'action' && item.data === 'clear') {
              clearRecentSearches();
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        default:
          // Add default case to satisfy linter
          break;
      }
    };
    // Scroll focused item into view
    useEffect(() => {
      if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
        itemRefs.current[focusedIndex]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }, [focusedIndex]);
    // Reset focused index when dropdown opens/closes
    useEffect(() => {
      if (isOpen) {
        setFocusedIndex(-1);
        // Focus input when dropdown opens
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [isOpen]);
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
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
    const handleSelect = (member: UserResponse) => {
      onChange?.(member);
      addToRecentSearches(member);
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    };
    const handleClear = () => {
      onChange?.(null);
      setSearchTerm('');
    };
    const handleOpen = () => {
      if (disabled) return;
      setIsOpen(true);
      setSearchTerm('');
      setShowRecentSearches(true);
    };
    const getDisplayValue = (member: UserResponse): string => {
      const propertyValue = member[displayProperty];
      return String(propertyValue || '');
    };
    const renderRecentSearches = () => {
      return recentSearches.map((recent, index) => (
        <button
          className={cn(
            'group flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-accent',
            focusedIndex === index && 'bg-accent'
          )}
          key={recent.id}
          onClick={() => handleSelect(recent.member)}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Clock className="size-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{getDisplayValue(recent.member)}</span>
              {recent.member.email && (
                <span className="truncate text-muted-foreground text-xs">
                  {recent.member.email}
                </span>
              )}
            </div>
          </div>
          <button
            className="rounded-sm p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              removeFromRecentSearches(recent.id);
            }}
            type="button"
          >
            <X className="size-3 text-muted-foreground hover:text-destructive" />
          </button>
        </button>
      ));
    };
    const renderMembers = () => {
      return members.map((member, index) => {
        const actualIndex = showRecentSearches
          ? recentSearches.length + 1 + index
          : index;
        return (
          <button
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent',
              value?._id === member._id && 'bg-accent/50',
              focusedIndex === actualIndex && 'bg-accent'
            )}
            key={member._id}
            onClick={() => handleSelect(member)}
            ref={(el) => {
              itemRefs.current[actualIndex] = el;
            }}
            type="button"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                alt={member?.firstName || 'Member'}
                src={member?.profilePictureUrl || ''}
              />
              <AvatarFallback>{`${getFirstLetter(
                member?.firstName || ''
              )}${getFirstLetter(member?.lastName || '')}`}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">
                {`${capitalizeFirstLetter(
                  member?.firstName || ''
                )} ${capitalizeFirstLetter(member?.lastName || '')}`}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {member.email && (
                  <span className="truncate">{member.email}</span>
                )}
                {member.branchId && (
                  <>
                    {member.email && <span>•</span>}
                    <span>{member?.branchId?.branchName}</span>
                  </>
                )}
              </div>
            </div>
            {value?._id === member._id && (
              <div className="size-2 flex-shrink-0 rounded-full bg-primary" />
            )}
          </button>
        );
      });
    };
    return (
      <div className={cn('relative', className)} ref={ref} {...props}>
        <button
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'ring-2 ring-ring ring-offset-2',
            className
          )}
          disabled={disabled}
          onClick={handleOpen}
          type="button"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <User className="size-4 flex-shrink-0 text-muted-foreground" />
            {value ? (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate">{getDisplayValue(value)}</span>
                {value.email && (
                  <span className="truncate text-muted-foreground text-xs">
                    {value.email}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <div className="flex flex-shrink-0 items-center gap-1">
            {value && (
              <button
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                type="button"
              >
                <X className="size-3" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>
        {isOpen && (
          <div
            className="fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1 w-full animate-in rounded-md border bg-popover shadow-lg"
            ref={dropdownRef}
          >
            {/* Search Input */}
            <div className="border-b p-3">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground" />
                <Input
                  className="border-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search members..."
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                />
              </div>
            </div>
            {/* Results */}
            <div className="max-h-80 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-muted-foreground text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  Searching members...
                </div>
              ) : error ? (
                <div className="px-4 py-3 text-destructive text-sm">
                  Error loading members. Please try again.
                </div>
              ) : showRecentSearches && recentSearches.length > 0 ? (
                <>
                  <div className="border-b bg-muted/30 px-3 py-2 font-medium text-muted-foreground text-xs">
                    Recent Searches
                  </div>
                  {renderRecentSearches()}
                  {recentSearches.length > 0 && (
                    <button
                      className={cn(
                        'flex w-full items-center gap-3 border-t px-4 py-2 text-left text-muted-foreground text-xs transition-colors hover:bg-accent',
                        focusedIndex === recentSearches.length && 'bg-accent'
                      )}
                      onClick={clearRecentSearches}
                      ref={(el) => {
                        itemRefs.current[recentSearches.length] = el;
                      }}
                      type="button"
                    >
                      <ArrowUp className="size-3" />
                      Clear recent searches
                    </button>
                  )}
                </>
              ) : members.length > 0 ? (
                <>
                  <div className="border-b bg-muted/30 px-3 py-2 font-medium text-muted-foreground text-xs">
                    {searchTerm ? `Results for "${searchTerm}"` : 'All Members'}
                  </div>
                  {renderMembers()}
                </>
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {searchTerm
                    ? `No members found for "${searchTerm}"`
                    : 'Start typing to search members'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

UserListInputComponent.displayName = 'UserListInput';

export { UserListInputComponent as UserListInput };
