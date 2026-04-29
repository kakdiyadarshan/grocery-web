import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaRedo } from "react-icons/fa";
import { SlPuzzle } from "react-icons/sl";

const PuzzleCaptchaModal = ({
    isOpen,
    onClose,
    onSuccess,
    onFailure = () => {},
    sliderBarTitle = "Slide to verify",
    cardTitle = "Complete the puzzle",
    initialColor = "#4F46E5",
    successColor = "#10B981",
    imageWidth = 380,
    imageHeight = 200,
    pieceWidth = 50, // Increased for better visibility
    pieceHeight = 50, // Increased for better visibility
    tolerance = 7,
    showResetBtn = true
}) => {
    const maxCanvasWidth = 380;
    const renderWidth = Math.min(imageWidth, maxCanvasWidth);
    const renderHeight = imageHeight;

    // Responsive dimensions for all screen sizes
    const [screenSize, setScreenSize] = useState('desktop');

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 480) {
                setScreenSize('small-mobile');
            } else if (width < 640) {
                setScreenSize('mobile');
            } else if (width < 768) {
                setScreenSize('tablet');
            } else if (width < 1024) {
                setScreenSize('small-desktop');
            } else {
                setScreenSize('desktop');
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Dynamic dimensions based on screen size
    const getResponsiveDimensions = () => {
        const width = window.innerWidth;
        switch (screenSize) {
            case 'small-mobile':
                return {
                    width: Math.min(300, width - 20),
                    height: Math.min(150, (width - 20) * 0.5),
                    maxWidth: '300px'
                };
            case 'mobile':
                return {
                    width: Math.min(340, width - 30),
                    height: Math.min(170, (width - 30) * 0.5),
                    maxWidth: '340px'
                };
            case 'tablet':
                return {
                    width: Math.min(320, width - 40),
                    height: Math.min(160, (width - 40) * 0.5),
                    maxWidth: '320px'
                };
            case 'small-desktop':
                return {
                    width: Math.min(350, width - 50),
                    height: Math.min(175, (width - 50) * 0.5),
                    maxWidth: '350px'
                };
            default: // desktop
                return {
                    width: renderWidth,
                    height: renderHeight,
                    maxWidth: '400px'
                };
        }
    };

    const { width: responsiveWidth, height: responsiveHeight, maxWidth } = getResponsiveDimensions();

    const canvasRef = useRef(null);      // Background image with puzzle hole
    const pieceCanvasRef = useRef(null); // Draggable puzzle piece
    const wrapperRef = useRef(null);     // Responsive wrapper
    const piecePadding = 5;              // Extra pixels around piece to avoid edge clipping
    const [scale, setScale] = useState(1);
    const [gapX, setGapX] = useState(0); // X-coordinate of the puzzle gap
    const [gapY, setGapY] = useState(0); // Y-coordinate of the puzzle gap
    const [sliderValue, setSliderValue] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentShape, setCurrentShape] = useState('fa-puzzle'); // Current puzzle shape


    // Available puzzle shapes
    const puzzleShapes = ['fa-puzzle', 'sl-puzzle', 'star', 'triangle', 'circle', 'diamond', 'hexagon'];

    const getRandomShape = () => {
        const randomIndex = Math.floor(Math.random() * puzzleShapes.length);
        return puzzleShapes[randomIndex];
    };

    const loadImage = () => {
        setIsLoading(true);
        const selectedShape = getRandomShape();
        setCurrentShape(selectedShape);

        const newImg = new Image();
        newImg.crossOrigin = "anonymous";
        newImg.src = `https://picsum.photos/${responsiveWidth}/${responsiveHeight}?random=${Math.random()}`;
        
        newImg.onload = () => {
            setIsLoading(false);

            // Position the puzzle gap in the right half of the image
            const minX = Math.floor(responsiveWidth / 2);
            const maxX = responsiveWidth - pieceWidth - 10;
            const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

            const minY = 10;
            const maxY = responsiveHeight - pieceHeight - 10;
            const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

            setGapX(x);
            setGapY(y);
            setSliderValue(0);
            setIsSolved(false);
            setCurrentImage(newImg);
            setIsLoading(false);
        };

        newImg.onerror = () => {
            // Fallback image if picsum fails
            newImg.src = `https://via.placeholder.com/${responsiveWidth}x${responsiveHeight}?text=Verify+You+Are+Human`;
        };
    };

    const drawBackground = (image, x, y) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = responsiveWidth * dpr;
        canvas.height = responsiveHeight * dpr;
        canvas.style.width = `${responsiveWidth}px`;
        canvas.style.height = `${responsiveHeight}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, responsiveWidth, responsiveHeight);
        ctx.drawImage(image, 0, 0, responsiveWidth, responsiveHeight);

        ctx.save();
        ctx.beginPath();
        createShapePath(ctx, x + pieceWidth / 2, y + pieceHeight / 2, currentShape, pieceWidth, pieceHeight);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    const drawPuzzlePiece = (image, cropX, cropY) => {
        const canvas = pieceCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const paddedWidth = pieceWidth + piecePadding * 2;
        const paddedHeight = pieceHeight + piecePadding * 2;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = paddedWidth * dpr;
        canvas.height = paddedHeight * dpr;
        canvas.style.width = `${paddedWidth}px`;
        canvas.style.height = `${paddedHeight}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, paddedWidth, paddedHeight);

        ctx.save();
        ctx.beginPath();
        createShapePath(ctx, pieceWidth / 2 + piecePadding, pieceHeight / 2 + piecePadding, currentShape, pieceWidth, pieceHeight);
        ctx.clip();

        ctx.drawImage(image, cropX, cropY, pieceWidth, pieceHeight, piecePadding, piecePadding, pieceWidth, pieceHeight);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    const createShapePath = (ctx, cx, cy, shapeType, width, height) => {
        const radius = Math.min(width, height) * 0.45;

        switch (shapeType) {
            case 'star':
                createStarPath(ctx, cx, cy, 5, radius, radius * 0.4);
                break;
            case 'fa-puzzle':
                createFaPuzzlePath(ctx, cx, cy, width, height);
                break;
            case 'sl-puzzle':
                createSlPuzzlePath(ctx, cx, cy, width, height);
                break;
            case 'triangle':
                ctx.moveTo(cx, cy - radius);
                ctx.lineTo(cx + radius, cy + radius);
                ctx.lineTo(cx - radius, cy + radius);
                ctx.closePath();
                break;
            case 'circle':
                ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                break;
            case 'diamond':
                ctx.moveTo(cx, cy - radius);
                ctx.lineTo(cx + radius, cy);
                ctx.lineTo(cx, cy + radius);
                ctx.lineTo(cx - radius, cy);
                ctx.closePath();
                break;
            case 'hexagon':
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = cx + Math.cos(angle) * radius;
                    const y = cy + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            default:
                createFaPuzzlePath(ctx, cx, cy, width, height);
        }
    };

    const createStarPath = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
        let rotation = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rotation) * outerRadius, cy + Math.sin(rotation) * outerRadius);
            rotation += step;
            ctx.lineTo(cx + Math.cos(rotation) * innerRadius, cy + Math.sin(rotation) * innerRadius);
            rotation += step;
        }
        ctx.closePath();
    };

    const createFaPuzzlePath = (ctx, cx, cy, width, height) => {
        const insetScale = 0.8;
        const w = width * insetScale;
        const h = height * insetScale;
        const x = cx - w / 2;
        const y = cy - h / 2;
        const cornerRadius = Math.min(w, h) * 0.1;
        const knobRadius = Math.min(w, h) * 0.2;

        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + w * 0.35, y);
        ctx.arc(cx, y, knobRadius, Math.PI, 0, false);
        ctx.lineTo(x + w - cornerRadius, y);
        ctx.arcTo(x + w, y, x + w, y + cornerRadius, cornerRadius);
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.arc(x + w, cy, knobRadius, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(x + w, y + h - cornerRadius);
        ctx.arcTo(x + w, y + h, x + w - cornerRadius, y + h, cornerRadius);
        ctx.lineTo(x + w * 0.65, y + h);
        ctx.arc(cx, y + h, knobRadius * 0.9, 0, Math.PI, true);
        ctx.lineTo(x + cornerRadius, y + h);
        ctx.arcTo(x, y + h, x, y + h - cornerRadius, cornerRadius);
        ctx.lineTo(x, y + h * 0.65);
        ctx.arc(x, cy, knobRadius * 0.9, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(x, y + cornerRadius);
        ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
        ctx.closePath();
    };

    const createSlPuzzlePath = (ctx, cx, cy, width, height) => {
        const insetScale = 0.8;
        const w = width * insetScale;
        const h = height * insetScale;
        const x = cx - w / 2;
        const y = cy - h / 2;
        const knobRadius = Math.min(w, h) * 0.2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.35, y);
        ctx.arc(cx, y, knobRadius, Math.PI, 0, false);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w * 0.65, y + h);
        ctx.arc(cx, y + h, knobRadius, 0, Math.PI, true);
        ctx.lineTo(x, y + h);
        ctx.closePath();
    };

    const handleSliderChange = (e) => {
        setSliderValue(parseInt(e.target.value, 10));
    };

    const handleSliderRelease = () => {
        if (Math.abs(sliderValue - gapX) < tolerance) {
            setIsSolved(true);
            setTimeout(() => {
                onSuccess();
            }, 500);
        } else {
            setIsFailed(true);
            onFailure();
            setTimeout(() => {
                handleReset();
            }, 1500);
        }
    };

    const handleReset = () => {
        setIsSolved(false);
        setIsFailed(false);
        setSliderValue(0);
        loadImage();
    };

    useEffect(() => {
        if (isOpen) {
            handleReset();
        }
    }, [isOpen, responsiveWidth, responsiveHeight]);

    useEffect(() => {
        if (!isLoading && currentImage && canvasRef.current && pieceCanvasRef.current) {
            drawBackground(currentImage, gapX, gapY);
            drawPuzzlePiece(currentImage, gapX, gapY);
        }
    }, [isLoading, currentImage, gapX, gapY, currentShape, responsiveWidth, responsiveHeight]);


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#1a1c1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <SlPuzzle className="text-blue-400" />
                                {cardTitle}
                            </h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-black/20" style={{ height: responsiveHeight }}>
                                <canvas ref={canvasRef} className={`block ${isLoading ? 'hidden' : 'block'}`} />
                                
                                {isLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-white/60 text-sm mt-3">Generating puzzle...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="absolute pointer-events-none"
                                            style={{
                                                top: gapY - piecePadding,
                                                left: sliderValue - piecePadding,
                                                zIndex: 2,
                                                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                                            }}
                                        >
                                            <canvas ref={pieceCanvasRef} />
                                        </div>
                                        
                                        {showResetBtn && (
                                            <button
                                                onClick={handleReset}
                                                className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all z-10"
                                            >
                                                <FaRedo size={12} className={isLoading ? "animate-spin" : ""} />
                                            </button>
                                        )}
                                    </>
                                )}

                            </div>

                            {/* Slider Container */}
                            <div className="relative pt-2 pb-6">
                                <div 
                                    className="h-12 rounded-full flex items-center px-2 transition-colors duration-300 border border-white/5 shadow-inner"
                                    style={{ backgroundColor: isSolved ? `${successColor}20` : 'rgba(255,255,255,0.03)' }}
                                >
                                    <p className={`w-full text-center text-sm font-medium tracking-wide ${isSolved ? 'text-green-400' : 'text-white/30'}`}>
                                        {isSolved ? 'Verification Successful!' : sliderBarTitle}
                                    </p>
                                </div>
                                
                                <style>
                                    {`
                                        .captcha-slider::-webkit-slider-thumb {
                                            appearance: none;
                                            width: 46px;
                                            height: 46px;
                                            background: ${isSolved ? successColor : '#3b82f6'} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E") no-repeat center;
                                            background-size: 24px;
                                            border: 3px solid rgba(255,255,255,0.2);
                                            border-radius: 50%;
                                            cursor: grab;
                                            box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3);
                                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                                        }
                                        .captcha-slider:active::-webkit-slider-thumb {
                                            cursor: grabbing;
                                            transform: scale(0.95);
                                            background-color: ${isSolved ? successColor : '#2563eb'};
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
                                        }
                                        .captcha-slider::-moz-range-thumb {
                                            width: 46px;
                                            height: 46px;
                                            background: ${isSolved ? successColor : '#3b82f6'} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E") no-repeat center;
                                            background-size: 24px;
                                            border: 3px solid rgba(255,255,255,0.2);
                                            border-radius: 50%;
                                            cursor: grab;
                                            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                                        }
                                    `}
                                </style>


                                <input
                                    type="range"
                                    min={0}
                                    max={responsiveWidth - pieceWidth}
                                    value={sliderValue}
                                    onChange={handleSliderChange}
                                    onMouseUp={handleSliderRelease}
                                    onTouchEnd={handleSliderRelease}
                                    disabled={isLoading || isSolved}
                                    className="captcha-slider absolute inset-x-0 top-1 h-12 w-full appearance-none bg-transparent cursor-pointer z-20"
                                />
                            </div>

                            {isFailed && (
                                <p className="text-red-400 text-sm text-center font-medium animate-pulse">
                                    Verification failed. Please try again.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PuzzleCaptchaModal;
