import React from 'react';
import { Check } from 'lucide-react';

const CustomStepper = ({ steps, activeStep }) => {
    return (
        <div className="w-full px-4 md:px-8 py-6 mb-2">
            <h3 className="text-center text-sm md:text-base font-semibold text-gray-800 mb-10 tracking-tight">Complete these steps for easy onboarding</h3>
            
            <div className="flex items-start justify-between w-full relative">
                {steps.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                        <div key={step.id} className="relative flex-1 flex flex-col items-center">
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-4 left-[50%] w-full h-[2px] bg-gray-200 z-0">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                                        style={{ width: isCompleted ? '100%' : '0%' }}
                                    />
                                </div>
                            )}

                            {/* Node Circle */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 outline outline-4 outline-white
                                ${isCompleted ? 'bg-primary text-white border-primary' : 
                                  isActive ? 'bg-white border-[1.5px] border-primary' : 
                                  'bg-white border-[1.5px] border-gray-300'}
                            `}>
                                {isCompleted ? (
                                    <Check size={16} strokeWidth={3.5} />
                                ) : isActive ? (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                ) : (
                                    <div className="w-[5px] h-[5px] rounded-full bg-gray-300" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-3 text-center w-full sm:w-auto px-1">
                                <p className={`text-[10px] sm:text-xs md:text-sm transition-colors duration-300 whitespace-nowrap ${
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
