import { DropdownProps } from "@/types/types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const CustomDropdown = ({ label, options, data }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.label}
              onClick={() => (data ? option.action(data) : option.action())}
              className={option.itemClassName || ""}
            >
              {Icon && (
                <Icon
                  className={`h-4 w-4 mr-2 ${option.iconClassName || ""}`}
                />
              )}
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomDropdown;
