import React, { useState } from 'react';
import { Film, Trash2, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { VideoUploader } from './VideoUploader';

interface MergeEditorProps {
    files: File[];
    onMerge: (files: File[]) => void;
    onCancel: () => void;
    onAddFiles: (files: File[]) => void;
}

export const MergeEditor: React.FC<MergeEditorProps> = ({ files, onMerge, onCancel, onAddFiles }) => {
    const [videoFiles, setVideoFiles] = useState<File[]>(files);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFiles = [...videoFiles];
        const draggedItem = newFiles[draggedIndex];
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(index, 0, draggedItem);
        setVideoFiles(newFiles);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const removeFile = (index: number) => {
        const newFiles = videoFiles.filter((_, i) => i !== index);
        setVideoFiles(newFiles);
        if (newFiles.length === 0) {
            onCancel();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Merge Videos
                </h2>

                <div className="space-y-3 mb-6">
                    {videoFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={clsx(
                                "flex items-center gap-4 bg-slate-700/50 p-4 rounded-xl border border-slate-600 cursor-move transition-all",
                                draggedIndex === index && "opacity-50 scale-95"
                            )}
                        >
                            <GripVertical className="w-5 h-5 text-slate-500" />
                            <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                                {/* Placeholder for thumbnail - in real app we'd generate one */}
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs text-slate-500">
                                    Video
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <VideoUploader
                            onUpload={(newFiles) => {
                                setVideoFiles([...videoFiles, ...newFiles]);
                                onAddFiles(newFiles);
                            }}
                            multiple
                            className="!p-4 !border-slate-600/50"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onMerge(videoFiles)}
                    disabled={videoFiles.length < 2}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    Merge {videoFiles.length} Videos
                </button>
            </div>
        </div>
    );
};
