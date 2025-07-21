'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

interface FormData {
  query: string;
}

interface SearchInputProps {
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  register,
  handleSubmit,
  placeholder = '',
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handleSearch = useDebouncedCallback((term: FormData) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term.query) {
      params.set('query', term.query);
    } else {
      params.delete('query');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, 500);
  return (
    <div className="relative flex w-full flex-1 flex-shrink-0">
      <label className="sr-only" htmlFor="search">
        Search
      </label>
      <Input
        id="query"
        type="search"
        {...register('query', {
          onChange: handleSubmit(handleSearch),
        })}
        className="m-0 block w-full rounded-md border bg-white bg-clip-padding py-2 pr-3 pl-10 font-normal text-base text-gray-900 shadow-sm outline-2 transition ease-in-out placeholder:text-gray-400 placeholder:text-sm focus:bg-white focus:text-gray-700"
        placeholder={placeholder}
      />
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
};

export default SearchInput;
