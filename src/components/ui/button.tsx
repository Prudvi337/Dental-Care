import * as React from "react"

import {  type ButtonVariants } from "@/lib/button-variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean
}

export const Button = React.forwardRef<
  React.ElementRef<'button'>,
  React.ComponentPropsWithoutRef<'button'> & { variant?: 'outline' | 'secondary' | 'default'; size?: 'sm' | 'md' | 'lg' }
>(({
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  let base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md';
  let sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  let variants = {
    default: 'bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-400',
    outline: 'bg-transparent border-2 border-blue-400 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-600 hover:text-blue-900 focus:ring-2 focus:ring-blue-400',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-gray-400',
  };
  return (
    <button
      ref={ref}
      className={[
        base,
        sizes[size],
        variants[variant],
        className
      ].join(' ')}
      {...props}
    />
  );
});

Button.displayName = "Button"

export default Button; 