import { Input } from '@/components/ui/input';
import { useFetchBranches } from '@/lib/hooks/branch/use-branch-queries';
import { errorToastStyle } from '@/lib/toast-styles';
import type { Branch } from '@/lib/types/branch';
import { capitalizeFirstLetter, cn, getFirstLetter } from '@/lib/utils';
import {
  ArrowUp,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Search,
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
  branch: Branch;
  searchedAt: Date;
}

interface BranchListInputProps {
  value?: Branch | null;
  onChange?: (branch: Branch | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  displayProperty?: keyof Branch;
  maxRecentSearches?: number;
}

const BranchListInputComponent = React.forwardRef<
  HTMLDivElement,
  BranchListInputProps
>(
  (
    {
      className,
      placeholder = 'Search branches...',
      value,
      onChange,
      disabled,
      displayProperty = 'branchName',
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
      const saved = localStorage.getItem('branch-search-recent');
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
      localStorage.setItem('branch-search-recent', JSON.stringify(searches));
    }, []);
    // Add to recent searches
    const addToRecentSearches = useCallback(
      (branch: Branch) => {
        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (item) => item.branch._id !== branch._id
          );
          const newSearches = [
            { id: crypto.randomUUID(), branch, searchedAt: new Date() },
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
      localStorage.removeItem('branch-search-recent');
    }, []);
    // Debounce search term
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setShowRecentSearches(searchTerm.length === 0);
      }, 300);
      return () => clearTimeout(timer);
    }, [searchTerm]);
    // Fetch branches using the provided hook
    const { data, isLoading, error } = useFetchBranches(1, debouncedSearchTerm);
    // Extract branches array from the API response
    const branches: Branch[] = useMemo(() => {
      if (!data?.branches) return [];
      return data.branches;
    }, [data]);
    // Combine recent searches and current results for keyboard navigation
    const allItems = useMemo(() => {
      const items: Array<{
        type: 'recent' | 'branch' | 'action';
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
      } else if (!isLoading && branches.length > 0) {
        branches.forEach((branch) => {
          items.push({ type: 'branch', data: branch, index: currentIndex++ });
        });
      }
      return items;
    }, [showRecentSearches, recentSearches, branches, isLoading]);
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
              handleSelect(item.data.branch);
            } else if (item.type === 'branch') {
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
    const handleSelect = (branch: Branch) => {
      onChange?.(branch);
      addToRecentSearches(branch);
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
    const getDisplayValue = (branch: Branch): string => {
      const propertyValue = branch[displayProperty];
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
          onClick={() => handleSelect(recent.branch)}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Clock className="size-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{getDisplayValue(recent.branch)}</span>
              {recent.branch.address && (
                <span className="truncate text-muted-foreground text-xs">
                  {recent?.branch?.address?.street}
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
    const renderBranches = () => {
      return branches.map((branch, index) => {
        const actualIndex = showRecentSearches
          ? recentSearches.length + 1 + index
          : index;
        return (
          <button
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent',
              value?._id === branch._id && 'bg-accent/50',
              focusedIndex === actualIndex && 'bg-accent'
            )}
            key={branch._id}
            onClick={() => handleSelect(branch)}
            ref={(el) => {
              itemRefs.current[actualIndex] = el;
            }}
            type="button"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                alt={branch?.branchName || 'Branch'}
                src="" // No logoUrl in Branch interface
              />
              <AvatarFallback>
                {getFirstLetter(branch?.branchName || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">
                {capitalizeFirstLetter(branch?.branchName || '')}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {branch.address && (
                  <span className="truncate">
                    {capitalizeFirstLetter(branch?.address?.street)}
                  </span>
                )}
                {branch?.address?.country && (
                  <>
                    {branch.address && <span>•</span>}
                    <span>
                      {capitalizeFirstLetter(branch?.address?.country)}
                    </span>
                  </>
                )}
              </div>
            </div>
            {value?._id === branch._id && (
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
            <MapPin className="size-4 flex-shrink-0 text-muted-foreground" />
            {value ? (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate">{getDisplayValue(value)}</span>
                {value.address && (
                  <span className="truncate text-muted-foreground text-xs">
                    {capitalizeFirstLetter(value?.address?.street)}
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
                  placeholder="Search branches..."
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
                  Searching branches...
                </div>
              ) : error ? (
                <div className="px-4 py-3 text-destructive text-sm">
                  Error loading branches. Please try again.
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
              ) : branches.length > 0 ? (
                <>
                  <div className="border-b bg-muted/30 px-3 py-2 font-medium text-muted-foreground text-xs">
                    {searchTerm
                      ? `Results for "${searchTerm}"`
                      : 'All Branches'}
                  </div>
                  {renderBranches()}
                </>
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {searchTerm
                    ? `No branches found for "${searchTerm}"`
                    : 'Start typing to search branches'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

BranchListInputComponent.displayName = 'BranchListInput';

export { BranchListInputComponent as BranchListInput };
