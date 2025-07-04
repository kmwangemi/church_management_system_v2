'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';

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
    <div className='relative flex flex-1 flex-shrink-0 w-full'>
      <label htmlFor='search' className='sr-only'>
        Search
      </label>
      <Input
        type='search'
        id='query'
        {...register('query', {
          onChange: handleSubmit(handleSearch),
        })}
        placeholder={placeholder}
        className='block w-full py-2 pl-10 pr-3 m-0 text-base font-normal text-gray-900 transition ease-in-out bg-white border rounded-md shadow-sm outline-2 placeholder:text-gray-400 placeholder:text-sm bg-clip-padding focus:text-gray-700 focus:bg-white'
      />
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
    </div>
  );
};

export default SearchInput;
