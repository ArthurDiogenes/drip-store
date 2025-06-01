import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

const Button = React.forwardRef(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {variant === "action" && (
          <span className="mr-2">+</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };