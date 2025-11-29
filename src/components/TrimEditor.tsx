import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Scissors, RotateCcw } from 'lucide-react';

import { FFmpeg } from '@ffmpeg/ffmpeg';


const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ThumbnailOverlay = ({ videoUrl, time, duration, visible }: { videoUrl: string, time: number, duration: number, visible: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && visible) {
            videoRef.current.currentTime = time;
        }
    }, [time, visible]);

    if (!visible) return null;

    return (
        <div
            className="absolute bottom-full mb-3 transform -translate-x-1/2 z-30 pointer-events-none"
            style={{ left: `${(time / duration) * 100}%` }}
        >
            <div className="w-32 bg-slate-900 rounded-lg border border-slate-600 shadow-xl overflow-hidden">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full aspect-video object-cover"
                    muted
                    preload="auto"
                />
                <div className="bg-black/80 text-center text-xs py-1 text-white font-mono">
                    {formatTime(time)}
                </div>
            </div>
            <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900 border-r border-b border-slate-600"></div>
        </div>
    );
};

const TimelineFrames = ({ videoUrl, duration }: { videoUrl: string, duration: number }) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!duration || !videoUrl) return;

        const generateThumbnails = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const count = 12;
            const interval = duration / count;
            const newThumbnails: string[] = [];

            // Wait for video to be ready
            if (video.readyState < 2) {
                await new Promise(r => {
                    video.onloadeddata = r;
                });
            }

            for (let i = 0; i < count; i++) {
                const time = i * interval;
                video.currentTime = time;
                await new Promise(r => {
                    const onSeeked = () => {
                        video.removeEventListener('seeked', onSeeked);
                        r(null);
                    };
                    video.addEventListener('seeked', onSeeked);
                });

                canvas.width = 100;
                canvas.height = 60;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                newThumbnails.push(canvas.toDataURL());
            }

            setThumbnails(newThumbnails);
        };

        generateThumbnails();
    }, [duration, videoUrl]);

    return (
        <div className="absolute inset-0 flex overflow-hidden rounded-lg opacity-40 pointer-events-none">
            <video ref={videoRef} src={videoUrl} className="hidden" muted preload="auto" />
            <canvas ref={canvasRef} className="hidden" />
            {thumbnails.map((src, i) => (
                <img key={i} src={src} className="h-full flex-1 object-cover border-r border-white/10 last:border-0" alt="" />
            ))}
        </div>
    );
};

interface TrimEditorProps {
    file: File;
    ffmpeg: FFmpeg;
    onTrim: (start: number, end: number) => void;
    onCancel: () => void;
}

export const TrimEditor: React.FC<TrimEditorProps> = ({ file, onTrim, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [isDraggingStart, setIsDraggingStart] = useState(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState(false);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setDuration(dur);
            setEndTime(dur);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);
            if (time >= endTime) {
                videoRef.current.pause();
                setIsPlaying(false);
                videoRef.current.currentTime = startTime;
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                if (videoRef.current.currentTime >= endTime) {
                    videoRef.current.currentTime = startTime;
                }
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };



    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
            <div className="relative aspect-video bg-black group">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
                        {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Timeline Controls */}
                <div className="relative h-12 bg-slate-700/50 rounded-lg select-none">
                    <TimelineFrames videoUrl={videoUrl} duration={duration} />

                    <ThumbnailOverlay
                        videoUrl={videoUrl}
                        time={startTime}
                        duration={duration}
                        visible={isDraggingStart}
                    />
                    <ThumbnailOverlay
                        videoUrl={videoUrl}
                        time={endTime}
                        duration={duration}
                        visible={isDraggingEnd}
                    />

                    {/* Progress Bar */}
                    <div
                        className="absolute top-0 bottom-0 bg-primary/20"
                        style={{
                            left: `${(startTime / duration) * 100}%`,
                            right: `${100 - (endTime / duration) * 100}%`
                        }}
                    />

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Start Handle */}
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={startTime}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setStartTime(Math.min(val, endTime - 1));
                            if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        onPointerDown={() => setIsDraggingStart(true)}
                        onPointerUp={() => setIsDraggingStart(false)}
                        onPointerLeave={() => setIsDraggingStart(false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 range-thumb-only"
                    />

                    {/* End Handle */}
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={endTime}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setEndTime(Math.max(val, startTime + 1));
                            if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        onPointerDown={() => setIsDraggingEnd(true)}
                        onPointerUp={() => setIsDraggingEnd(false)}
                        onPointerLeave={() => setIsDraggingEnd(false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 range-thumb-only"
                    />

                    {/* Visual Handles */}
                    <div
                        className="absolute top-0 bottom-0 w-4 bg-primary cursor-ew-resize flex items-center justify-center rounded-l-md -ml-2 hover:bg-primary/80 transition-colors"
                        style={{ left: `${(startTime / duration) * 100}%` }}
                    >
                        <div className="w-1 h-4 bg-white/50 rounded-full" />
                    </div>
                    <div
                        className="absolute top-0 bottom-0 w-4 bg-primary cursor-ew-resize flex items-center justify-center rounded-r-md -ml-2 hover:bg-primary/80 transition-colors"
                        style={{ left: `${(endTime / duration) * 100}%` }}
                    >
                        <div className="w-1 h-4 bg-white/50 rounded-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm font-mono text-slate-400">
                        <div>Start: <span className="text-white">{formatTime(startTime)}</span></div>
                        <div>End: <span className="text-white">{formatTime(endTime)}</span></div>
                        <div>Duration: <span className="text-primary">{formatTime(endTime - startTime)}</span></div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={() => onTrim(startTime, endTime)}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Scissors className="w-4 h-4" />
                            Trim Video
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
