import * as React from "react";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      setIsChecked(checked || false);
    }, [checked]);

    const handleChange = () => {
      if (disabled) return;
      
      const newCheckedState = !isChecked;
      setIsChecked(newCheckedState);
      
      if (onCheckedChange) {
        onCheckedChange(newCheckedState);
      }
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        className={cn(
          "group inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        ref={ref}
        onClick={handleChange}
        disabled={disabled}
        {...props}
      >
        {isChecked ? (
          <CheckSquare className="h-6 w-6 text-pink-600" />
        ) : (
          <Square className="h-6 w-6 text-gray-400" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };