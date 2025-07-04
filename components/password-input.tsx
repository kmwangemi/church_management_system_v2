import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='relative'>
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pe-10', className)}
        ref={ref}
        {...props}
      />
      <button
        type='button'
        onClick={() => setShowPassword(!showPassword)}
        title={showPassword ? 'Hide password' : 'Show password'}
        className='-translate-y-1/2 absolute top-1/2 right-3 transform text-muted-foreground'
      >
        {showPassword ? (
          <EyeOff className='size-5 cursor-pointer' />
        ) : (
          <Eye className='size-5 cursor-pointer' />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
