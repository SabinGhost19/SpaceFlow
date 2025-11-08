// Beer-themed SVG Icon

interface BeerMugIconProps {
    className?: string;
}

export const BeerMugIcon = ({ className = "w-5 h-5" }: BeerMugIconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 9h12M5 9v10a2 2 0 002 2h8a2 2 0 002-2V9M5 9V7a2 2 0 012-2h8a2 2 0 012 2v2m0 0h2a2 2 0 012 2v4a2 2 0 01-2 2h-2"
        />
    </svg>
);
