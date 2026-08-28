import Image from "next/image";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function BrandLogo({ className, size = 40, priority = false }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
        className
      )}
    >
      {/* Dark Theme Logo */}
      <Image
        src={logoDark}
        alt="SmartGrow Logo"
        width={size}
        height={size}
        priority={priority}
        className="hidden dark:block object-contain"
      />
      {/* Light Theme Logo */}
      <Image
        src={logoLight}
        alt="SmartGrow Logo"
        width={size}
        height={size}
        priority={priority}
        className="block dark:hidden object-contain"
      />
    </div>
  );
}
