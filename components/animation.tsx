import React, { useState, useRef, useEffect } from 'react';

export function AnimateOnceVisible({ animationClass, children }: { animationClass: string, children: any }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<any>();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => setIsVisible(entry.isIntersecting));
        });

        observer.observe(domRef.current);
        return () => observer.unobserve(domRef.current);
    }, []);

    // Append the animation class only when the component is visible
    const combinedClass = isVisible ? `${animationClass} ${children.props.className}` : `${children.props.className} opacity-0`;

    return React.cloneElement(children, { className: combinedClass, ref: domRef });
}
