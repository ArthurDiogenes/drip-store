import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-pink-600 text-white hover:bg-pink-700 disabled:bg-gray-300 disabled:text-white",
        
        secondary: "border border-pink-300 text-pink-500 bg-white hover:bg-blue-200 hover:text-pink-500 disabled:bg-gray-300 disabled:text-white disabled:border-gray-300",
        
        action: "bg-pink-600 text-white hover:bg-pink-700 disabled:bg-gray-300 disabled:text-white",
        
        amber: "bg-amber-400 text-white hover:bg-amber-600 disabled:bg-gray-300 disabled:text-white",
      },
      size: {
        default: "h-12 px-4 py-2 w-full",
        sm: "h-10 px-3 text-sm",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);