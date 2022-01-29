import * as React from "react";

export function Icon({
  children,
  className,
  ...props
}: {
  children: string;
  className?: string;
} & JSX.IntrinsicElements["span"]) {
  return (
    <span
      style={{ fontFamily: "Material Icons" }}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
}
