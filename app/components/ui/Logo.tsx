import { memo } from 'react';
import { BRAND } from '~/utils/brand';
import { classNames } from '~/utils/classNames';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * Abstract, brand-neutral logo mark (website frame + spark). Intentionally
 * simple so it can be swapped for a client's real logo later without
 * touching any layout code.
 */
export const LogoMark = memo(({ size = 28, className }: LogoMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="1" y="1" width="26" height="26" rx="7" className="fill-accent-500" />
    <path d="M9.5 8.5h9a1 1 0 0 1 1 1v1.25h-11V9.5a1 1 0 0 1 1-1Z" fill="white" fillOpacity="0.9" />
    <path d="M13.4 12.9h5.1l-5.9 6.6 1.1-4.35H8.5l5.9-6.6-1 4.35Z" fill="white" />
  </svg>
));

interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
  textClassName?: string;
}

export const Logo = memo(({ size = 26, withText = true, className, textClassName }: LogoProps) => (
  <div className={classNames('flex items-center gap-2', className)}>
    <LogoMark size={size} />
    {withText && (
      <span className={classNames('font-semibold text-bolt-elements-textPrimary tracking-tight', textClassName)}>
        {BRAND.name}
      </span>
    )}
  </div>
));
