import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';


interface ProcessingStatusProps {
    status: 'idle' | 'processing' | 'completed' | 'error';
    progress?: number;
    message?: string;
    onReset?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, progress = 0, message, onReset }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
                <div className="flex flex-col items-center text-center">
                    {status === 'processing' && (
                        <>
                            <div className="relative w-20 h-20 mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-slate-700"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={226.08}
                                        strokeDashoffset={226.08 - (226.08 * progress) / 100}
                                        className="text-primary transition-all duration-300 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Processing Video</h3>
                            <p className="text-slate-400">{message || "Please wait while we process your video..."}</p>
                        </>
                    )}

                    {status === 'completed' && (
                        <>
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Done!</h3>
                            <p className="text-slate-400 mb-6">Your video has been processed successfully.</p>
                            <button
                                onClick={onReset}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Process Another
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
                            <p className="text-slate-400 mb-6">{message || "Something went wrong."}</p>
                            <button
                                onClick={onReset}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
