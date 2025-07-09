"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Slide {
    id: number;
    content: React.ReactNode;
    backgroundImage?: string;
    info?: string;
    shopUrl?: string;
}

interface SwipeProps {
    slides: Slide[];
    darkMode?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
    infinite?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
    swipeThreshold?: number;
    transitionDuration?: number;
    containerStyle?: React.CSSProperties;
}

const Swipe: React.FC<SwipeProps> = ({ 
    slides, 
    darkMode = false,
    autoplay = false,
    autoplayDelay = 3000,
    infinite = true,
    showArrows = true,
    showDots = true,
    swipeThreshold = 50,
    transitionDuration = 300,
    containerStyle = {} // Default to empty object
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fading, setFading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    // Navigation functions
    const goToNext = useCallback(() => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setFading(true);
        
        setTimeout(() => {
            setCurrentSlide(prev => {
                if (infinite) {
                    return (prev + 1) % slides.length;
                } else {
                    return prev < slides.length - 1 ? prev + 1 : prev;
                }
            });
            setFading(false);
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, transitionDuration);
        }, transitionDuration / 2);
    }, [isTransitioning, infinite, slides.length, transitionDuration]);

    const goToPrev = useCallback(() => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setFading(true);
        
        setTimeout(() => {
            setCurrentSlide(prev => {
                if (infinite) {
                    return prev === 0 ? slides.length - 1 : prev - 1;
                } else {
                    return prev > 0 ? prev - 1 : prev;
                }
            });
            setFading(false);
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, transitionDuration);
        }, transitionDuration / 2);
    }, [isTransitioning, infinite, slides.length, transitionDuration]);

    // Auto-play functionality
    const startAutoplay = useCallback(() => {
        if (autoplay && slides.length > 1) {
            autoplayRef.current = setInterval(() => {
                goToNext();
            }, autoplayDelay);
        }
    }, [autoplay, autoplayDelay, slides.length, goToNext]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();
        return () => stopAutoplay();
    }, [startAutoplay, stopAutoplay]);

    // Pause autoplay on hover
    const handleMouseEnter = () => stopAutoplay();
    const handleMouseLeave = () => startAutoplay();

    const defaultContainerStyle: React.CSSProperties = {
        backgroundColor: darkMode ? '#1a1a1a' : '#f0f0f0',
        color: darkMode ? '#f0f0f0' : '#1a1a1a',
        padding: '0',
        borderRadius: '8px',
        textAlign: 'center',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        touchAction: 'pan-y',
    };

    const mergedContainerStyle: React.CSSProperties = {
        ...defaultContainerStyle,
        ...containerStyle,
    };

    const baseSlideStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        border: darkMode ? '1px solid #333' : 'none',
        backgroundColor: darkMode ? '#2a2a2a' : '#fff',
        boxShadow: darkMode ? '0 4px 8px rgba(0,0,0,0.6)' : '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        opacity: fading ? 0 : 1,
        transition: isTransitioning ? `opacity ${transitionDuration}ms ease-in-out, transform ${transitionDuration}ms ease-out` : 'none',
        position: 'relative',
        transform: `translateX(${dragOffset}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        overflow: 'hidden',
    };

    const currentSlideData = slides[currentSlide];

    const slideStyle: React.CSSProperties = {
        ...baseSlideStyle,
        ...(currentSlideData.backgroundImage && {
            backgroundImage: `url(${currentSlideData.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }),
    };

    const arrowStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        color: darkMode ? '#f0f0f0' : '#1a1a1a',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.3s ease',
        zIndex: 2,
        fontSize: '20px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    };

    const paginationStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '15px',
        gap: '8px',
    };

    const dotStyle = (active: boolean): React.CSSProperties => ({
        height: '12px',
        width: active ? '24px' : '12px',
        backgroundColor: active ? (darkMode ? '#f0f0f0' : '#1a1a1a') : (darkMode ? '#555' : '#ccc'),
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s ease',
        transform: active ? 'scale(1.1)' : 'scale(1)',
    });

    const changeSlide = useCallback((newIndex: number) => {
        if (isTransitioning || newIndex === currentSlide) return;
        
        setIsTransitioning(true);
        setFading(true);
        
        setTimeout(() => {
            setCurrentSlide(newIndex);
            setFading(false);
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, transitionDuration / 2);
        }, transitionDuration / 2);
    }, [isTransitioning, currentSlide, transitionDuration]);

    // Touch/Mouse handlers for swipe gestures
    const handleTouchStart = (e: React.TouchEvent) => {
        stopAutoplay();
        setTouchStart(e.targetTouches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentTouch = e.targetTouches[0].clientX;
        setTouchEnd(currentTouch);
        const offset = currentTouch - touchStart;
        setDragOffset(Math.max(-100, Math.min(100, offset)));
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        
        setIsDragging(false);
        setDragOffset(0);
        
        if (!touchStart || !touchEnd) {
            startAutoplay();
            return;
        }
        
        const swipeDistance = touchStart - touchEnd;
        const isSwipe = Math.abs(swipeDistance) > swipeThreshold;
        
        if (isSwipe) {
            if (swipeDistance > 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
        
        startAutoplay();
    };

    // Mouse handlers for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        stopAutoplay();
        setTouchStart(e.clientX);
        setIsDragging(true);
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTouchEnd(e.clientX);
        const offset = e.clientX - touchStart;
        setDragOffset(Math.max(-100, Math.min(100, offset)));
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        
        setIsDragging(false);
        setDragOffset(0);
        
        if (!touchStart || !touchEnd) {
            startAutoplay();
            return;
        }
        
        const swipeDistance = touchStart - touchEnd;
        const isSwipe = Math.abs(swipeDistance) > swipeThreshold;
        
        if (isSwipe) {
            if (swipeDistance > 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
        
        startAutoplay();
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [goToPrev, goToNext]);

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 16px',
        borderRadius: '8px',
        color: '#fff',
        backdropFilter: 'blur(4px)',
        maxWidth: '300px',
    };

    const shopButtonStyle: React.CSSProperties = {
        marginTop: '10px',
        padding: '10px 16px',
        backgroundColor: '#ff6600',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'all 0.3s ease',
        fontWeight: '500',
    };

    const progressBarStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '0',
        left: '0',
        height: '3px',
        backgroundColor: darkMode ? '#f0f0f0' : '#1a1a1a',
        width: `${((currentSlide + 1) / slides.length) * 100}%`,
        transition: 'width 0.3s ease',
        borderRadius: '0 3px 0 0',
    };

    return (
        <div 
            style={mergedContainerStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
        >
            <div style={{ position: 'relative' }}>
                {showArrows && (
                    <>
                        <button 
                            onClick={goToPrev} 
                            style={{ 
                                ...arrowStyle, 
                                left: '15px',
                                opacity: (!infinite && currentSlide === 0) ? 0.3 : 1,
                                cursor: (!infinite && currentSlide === 0) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!infinite && currentSlide === 0}
                            aria-label="Previous slide"
                        >
                            &#8249;
                        </button>
                        <button 
                            onClick={goToNext} 
                            style={{ 
                                ...arrowStyle, 
                                right: '15px',
                                opacity: (!infinite && currentSlide === slides.length - 1) ? 0.3 : 1,
                                cursor: (!infinite && currentSlide === slides.length - 1) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!infinite && currentSlide === slides.length - 1}
                            aria-label="Next slide"
                        >
                            &#8250;
                        </button>
                    </>
                )}
                
                <div 
                    style={slideStyle}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {currentSlideData.content}
                    {currentSlideData.info && (
                        <div style={overlayStyle}>
                            <div>{currentSlideData.info}</div>
                            {currentSlideData.shopUrl && (
                                <a 
                                    href={currentSlideData.shopUrl} 
                                    style={shopButtonStyle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e55a00';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#ff6600';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Shop Now
                                </a>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Progress bar */}
                <div style={progressBarStyle} />
            </div>
            
            {showDots && slides.length > 1 && (
                <div style={paginationStyle}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => changeSlide(index)}
                            style={dotStyle(currentSlide === index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Swipe;
