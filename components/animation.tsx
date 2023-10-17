import React, { useState, useRef, useEffect, RefObject } from 'react';
import { gradientSteps } from '@/lib/test';

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
                          observer.unobserve(domRef.current as Element)
                        }
                    }
                });
            });

            observer.observe(domRef.current);

            return () => {
              if (domRef.current && domRef.current instanceof Element) {
                observer.unobserve(domRef.current)
              }
            }
        }
    }, [domRef.current, once, isVisible]);

    return [isVisible, domRef as RefObject<HTMLDivElement>]
}

export function TypingText({ textArray, interval }: { textArray: string[], interval: number }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState(textArray[0]);
    const [isDeleting, setIsDeleting] = useState(false);
  
    // Function to get the common prefix of two strings
    const getCommonPrefix = (str1: string, str2: string) => {
      let i = 0;
      while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
        i++;
      }
      return str1.substring(0, i);
    };
  
    useEffect(() => {
      let typeDeleteTimer: NodeJS.Timeout;
  
      // If we finished typing out the word, wait for the interval duration
      if (!isDeleting && displayedText === textArray[currentIndex]) {
        typeDeleteTimer = setTimeout(() => {
          setIsDeleting(true);
        }, interval * 1000);
      } else if (isDeleting && displayedText === getCommonPrefix(textArray[currentIndex], textArray[(currentIndex + 1) % textArray.length])) {
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % textArray.length);
        typeDeleteTimer = setTimeout(() => {}, 100);
      } else {
        typeDeleteTimer = setTimeout(() => {
          if (isDeleting) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setDisplayedText(textArray[currentIndex].substr(0, displayedText.length + 1));
          }
        }, 100);
      }
  
      return () => clearTimeout(typeDeleteTimer);
    }, [displayedText, isDeleting, currentIndex]);
  
    return (
      <>
        <span>{`${displayedText}`}</span>
      </>
    );
}

const DynamicGradientText = ({ startColor, endColor, children }: { startColor: string, endColor: string, children: React.ReactNode }) => {
  const colorSteps = gradientSteps(startColor, endColor, 20)
  const [stepIndex, setStepIndex] = useState(0)

  if (colorSteps) {
    useEffect(() => {
      const intervalId = setInterval(() => {
        setStepIndex((prevIndex) => {
          return (prevIndex + 1) % colorSteps.length;
        });
      }, 1000);
      
      return () => clearInterval(intervalId);
    }, [colorSteps.length]);
  }

  return (
    <>
    {colorSteps && (
      <>
        <p className={`drop-shadow-custom1 bg-clip-text text-transparent max-w-[20rem] font-medium text-5xl pb-4 pt-2`}
        style={{ backgroundImage: `linear-gradient(to bottom right, ${colorSteps[stepIndex]}, ${colorSteps[(stepIndex + colorSteps.length - 1) % colorSteps.length]})`}}
        >
        {children}
        </p>
        <p>{stepIndex}</p>
        <p>{(stepIndex + colorSteps.length - 1) % colorSteps.length}</p>
        </>
    )}
    </>
  )
}

export default DynamicGradientText;
