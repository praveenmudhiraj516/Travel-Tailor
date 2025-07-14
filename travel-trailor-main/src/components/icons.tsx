import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 12V2" />
        <path d="M15 15.31V9a3 3 0 0 0-3-3H9" />
        <path d="M15 15.31c-2.3.93-4.62.93-7 0" />
        <path d="M9 9a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v0" />
        <path d="M9 15.31c-2.3.93-4.62.93-7 0" />
        <path d="M21.31 9.69c-2.3-.93-4.62-.93-7 0" />
    </svg>
  );
}
