import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, Save } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

interface VolumeEditorProps {
    file: File;
    ffmpeg: FFmpeg;
    onSave: (volume: number) => void;
    onCancel: () => void;
}

export const VolumeEditor: React.FC<VolumeEditorProps> = ({ file, onSave, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [videoUrl, setVideoUrl] = useState<string>("");

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Initialize Web Audio API
    useEffect(() => {
        if (!videoRef.current || audioContextRef.current || !videoUrl) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            const source = audioCtx.createMediaElementSource(videoRef.current);
            const gainNode = audioCtx.createGain();

            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            audioContextRef.current = audioCtx;
            sourceNodeRef.current = source;
            gainNodeRef.current = gainNode;
        } catch (error) {
            console.error("Failed to initialize Web Audio API:", error);
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [videoUrl]);

    // Update gain value
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
    }, [volume]);

    const togglePlay = async () => {
        if (videoRef.current) {
            try {
                if (audioContextRef.current?.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
            } catch (e) {
                console.error("Error resuming audio context:", e);
            }

            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="max-w-3xl w-full mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                <div className="relative aspect-video group">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                        onClick={togglePlay}
                        onEnded={() => setIsPlaying(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
                            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-3xl mx-auto bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-6">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-primary" />
                        Adjust Volume
                    </h3>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-6">
                            <Volume2 className="w-6 h-6 text-slate-400" />
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="flex-1 accent-primary h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-lg font-mono text-primary w-16 text-right">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-4 text-center">
                            Note: Preview volume is capped at 100%, but the saved video will apply the full boost up to 200%.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(volume)}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Save className="w-4 h-4" />
                        Save Video
                    </button>
                </div>
            </div>
        </div>
    );
};
