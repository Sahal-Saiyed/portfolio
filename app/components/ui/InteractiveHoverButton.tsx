import { ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type InteractiveHoverButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "dark" | "light";
};

/**
 * Adapted to this visual system from Magic UI's Interactive Hover Button.
 * Source: https://21st.dev/community/components/dillionverma/interactive-hover-button/default
 */
export function InteractiveHoverButton({
  children,
  className = "",
  variant = "dark",
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <a
      className={`interactive-button interactive-button--${variant} ${className}`}
      {...props}
    >
      <span className="interactive-button__dot" aria-hidden="true" />
      <span className="interactive-button__label">{children}</span>
      <ArrowRight className="interactive-button__arrow" size={17} aria-hidden="true" />
    </a>
  );
}

