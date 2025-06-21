interface NotificationBadgeProps {
  count: number;
  className?: string;
  variant?: "absolute" | "inline";
}

export function NotificationBadge({ count, className = "", variant = "absolute" }: NotificationBadgeProps) {
  if (count === 0) return null;

  const baseClasses = "bg-medical-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
  const variantClasses = variant === "absolute" 
    ? "absolute -top-2 -right-2" 
    : "relative";

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {count}
    </span>
  );
}
