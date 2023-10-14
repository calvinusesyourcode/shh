import React, { useState, useRef, useEffect, RefObject } from 'react';

export function AnimateOnceVisible({ animationClass, children, once=true }: { animationClass: string, children: any, once?: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<any>();

    useEffect(() => {
        if (domRef.current) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                        if (once) {
                            observer.unobserve(domRef.current);
                        }
                    }
                });
            });
            observer.observe(domRef.current);
            return () => observer.unobserve(domRef.current);
        }

    }, [domRef.current]);

    const customClass = isVisible ? `${animationClass}` : `opacity-0`;

    return typeof children === 'function' 
        ? children({ className: customClass, ref: domRef, isVisible: isVisible })
        : React.cloneElement(children, { className: customClass, ref: domRef });
}

export function useIntersectionObserver(once = true): [boolean, RefObject<HTMLDivElement>] {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const domRef = useRef<HTMLDivElement | null | Element>(null);

    useEffect(() => {
        if (domRef.current) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && (!isVisible || !once)) {
                        setIsVisible(true);
                        if (once) {
                            observer.unobserve(domRef.current as Element);//here
                        }
                    }
                });
            });

            observer.observe(domRef.current);

            return () => observer.unobserve(domRef.current as Element);//here
        }
    }, [domRef.current, once, isVisible]);

    return [isVisible, domRef as RefObject<HTMLDivElement>]
}





