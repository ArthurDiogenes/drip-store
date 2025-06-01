import * as React from "react";
import { cn } from "@/lib/utils";

const ActionButton = React.forwardRef(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "flex items-center justify-center w-full rounded-md font-medium transition-colors",
          "bg-pink-600 text-white hover:bg-pink-800 py-3 px-4",
          "disabled:bg-gray-300 disabled:text-white disabled:cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <span className="mr-1">+</span>
        {children}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export { ActionButton };