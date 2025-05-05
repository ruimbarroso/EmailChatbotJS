import { useEffect, useRef, useState } from "react";

interface ScrollablePProps {
    textContent: string
    color: string
    animationDuration: string
}

export const ScrollableP = ({
    textContent, 
    color,
    animationDuration
}: ScrollablePProps) => {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                setIsOverflowing(textRef.current.scrollWidth > (textRef.current.parentElement?.clientWidth ?? 0));
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [textContent]); 


    return (
        <div className={`group relative w-full h-full overflow-hidden`}>
            <div
                ref={textRef}
                style={{ color }}
                className={`whitespace-nowrap inline-block w-full ${isOverflowing ? `group-hover:animate-[marquee_${animationDuration}_linear_forwards]` : ''
                    }`}
            >
                {textContent}
            </div>
        </div>
    );

}