import React from 'react';
import { Check } from 'lucide-react';

const CustomStepper = ({ steps, activeStep }) => {
    return (
        <div className="w-full px-2 sm:px-4 md:px-8 py-3 sm:py-6 mb-2">
            <h3 className="text-center text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-4 sm:mb-10 tracking-tight px-1">Complete these steps for easy onboarding</h3>
            
            <div className="flex items-start justify-between w-full relative gap-0.5 sm:gap-2">
                {steps.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                        <div key={step.id} className="relative flex-1 flex flex-col items-center min-w-0">
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-2.5 sm:top-4 left-[50%] w-full h-[1.5px] sm:h-[2px] bg-gray-200 z-0">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                                        style={{ width: isCompleted ? '100%' : '0%' }}
                                    />
                                </div>
                            )}

                            {/* Node Circle */}
                            <div className={`
                                w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 outline outline-2 sm:outline-4 outline-white flex-shrink-0
                                ${isCompleted ? 'bg-primary text-white border-primary' : 
                                  isActive ? 'bg-white border-[1.5px] border-primary' : 
                                  'bg-white border-[1.5px] border-gray-300'}
                            `}>
                                {isCompleted ? (
                                    <Check size={10} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" strokeWidth={3.5} />
                                ) : isActive ? (
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                ) : (
                                    <div className="w-1 h-1 sm:w-[5px] sm:h-[5px] rounded-full bg-gray-300" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-1.5 sm:mt-3 text-center w-full px-0">
                                <p className={`text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base transition-colors duration-300 leading-[1.2] sm:leading-normal break-words ${
                                    isActive ? 'text-gray-800 font-bold' : 
                                    isCompleted ? 'text-primary font-bold' : 'text-gray-400 font-medium'
                                }`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomStepper;
