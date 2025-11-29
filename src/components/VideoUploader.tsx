import React, { useCallback } from 'react';
import { Upload, FileVideo } from 'lucide-react';
import { clsx } from 'clsx';

interface VideoUploaderProps {
    onUpload: (files: File[]) => void;
    multiple?: boolean;
    className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload, multiple = false, className }) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
        if (files.length > 0) {
            onUpload(multiple ? files : [files[0]]);
        }
    }, [onUpload, multiple]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            onUpload(multiple ? files : [files[0]]);
        }
    }, [onUpload, multiple]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={clsx(
                "border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-slate-800/50 transition-all duration-300 group",
                className
            )}
        >
            <input
                type="file"
                accept="video/*"
                multiple={multiple}
                onChange={handleChange}
                className="hidden"
                id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">
                        {multiple ? "Drop videos here" : "Drop video here"}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        or click to browse
                    </p>
                </div>
                <div className="flex gap-2 text-xs text-slate-500 mt-4">
                    <span className="flex items-center gap-1"><FileVideo className="w-3 h-3" /> MP4</span>
                    <span className="flex items-center gap-1"><FileVideo className="w-3 h-3" /> WebM</span>
                    <span className="flex items-center gap-1"><FileVideo className="w-3 h-3" /> MOV</span>
                </div>
            </label>
        </div>
    );
};
