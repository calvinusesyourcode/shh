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

export function TypingText({ textArray, interval }: { textArray: string[], interval: number }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState(textArray[0]); // Start with the first word already typed
    const [isDeleting, setIsDeleting] = useState(false);
  
    useEffect(() => {
      let typeDeleteTimer: NodeJS.Timeout;
  
      // If we finished typing out the word, wait for the interval duration
      if (!isDeleting && displayedText.length === textArray[currentIndex].length) {
        typeDeleteTimer = setTimeout(() => {
          setIsDeleting(true);
        }, interval * 1000);
      } else if (isDeleting && displayedText.length === 0) {
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % textArray.length);
        typeDeleteTimer = setTimeout(() => {}, 100); // Wait for 100ms before typing next word
      } else {
        typeDeleteTimer = setTimeout(() => {
            if (isDeleting) {
                setDisplayedText(displayedText.slice(0, -1));
            } else {
                setDisplayedText(textArray[currentIndex].substr(0, displayedText.length + 1));
            }
        }, 100); // Type/Delete at one letter per 100ms
      }
  
      return () => clearTimeout(typeDeleteTimer);
    }, [displayedText, isDeleting, currentIndex]);
  
    return (
      <>
        <span>{`${displayedText}`}</span>
      </>
    );
  };
  


