import { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Scissors, Film, Wand2, Github } from 'lucide-react';
import { clsx } from 'clsx';
import { VideoUploader } from './components/VideoUploader';
import { TrimEditor } from './components/TrimEditor';
import { MergeEditor } from './components/MergeEditor';
import { ProcessingStatus } from './components/ProcessingStatus';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<'trim' | 'merge'>('trim');
  const [files, setFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement>(null);

  const load = async () => {
    const baseURL = '/ffmpeg';
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress * 100);
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(`Failed to load FFmpeg: ${(error as Error).message}`);
      setProcessingStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTrim = async (start: number, end: number) => {
    if (!loaded || files.length === 0) return;

    setProcessingStatus('processing');
    setProgress(0);
    const ffmpeg = ffmpegRef.current;
    const file = files[0];
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // -ss before -i for fast seek, -t for duration
      await ffmpeg.exec([
        '-ss', start.toString(),
        '-i', inputName,
        '-t', (end - start).toString(),
        '-c', 'copy', // Stream copy for speed
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));

      // Download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed-${file.name}`;
      a.click();

      setProcessingStatus('completed');
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to trim video.");
      setProcessingStatus('error');
    }
  };

  const handleMerge = async (filesToMerge: File[]) => {
    if (!loaded || filesToMerge.length < 2) return;

    setProcessingStatus('processing');
    setProgress(0);
    const ffmpeg = ffmpegRef.current;
    const outputName = 'merged.mp4';
    const listName = 'list.txt';

    try {
      let fileListContent = '';

      for (let i = 0; i < filesToMerge.length; i++) {
        const fileName = `input${i}.mp4`;
        await ffmpeg.writeFile(fileName, await fetchFile(filesToMerge[i]));
        fileListContent += `file '${fileName}'\n`;
      }

      await ffmpeg.writeFile(listName, fileListContent);

      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', listName,
        '-c', 'copy',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));

      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-video.mp4';
      a.click();

      setProcessingStatus('completed');
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to merge videos. Ensure they have same format/codecs.");
      setProcessingStatus('error');
    }
  };

  const reset = () => {
    setFiles([]);
    setProcessingStatus('idle');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      <ProcessingStatus
        status={processingStatus}
        progress={progress}
        message={errorMessage}
        onReset={() => setProcessingStatus('idle')}
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VideoStudio
            </span>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => { setMode('trim'); reset(); }}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                mode === 'trim' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Scissors className="w-4 h-4" />
              Trim
            </button>
            <button
              onClick={() => { setMode('merge'); reset(); }}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                mode === 'merge' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Film className="w-4 h-4" />
              Merge
            </button>
          </div>

          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!loaded ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-primary rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-semibold text-slate-200">Loading Video Engine...</h2>
            <p className="text-slate-400 mt-2">This runs entirely in your browser for privacy.</p>
          </div>
        ) : (
          <div className="fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {mode === 'trim' ? 'Trim Video' : 'Merge Videos'}
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {mode === 'trim'
                  ? 'Cut out unwanted parts of your video with frame-perfect precision.'
                  : 'Combine multiple clips into a single seamless video file.'}
              </p>
            </div>

            {files.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <VideoUploader
                  onUpload={setFiles}
                  multiple={mode === 'merge'}
                />
              </div>
            ) : (
              mode === 'trim' ? (
                <TrimEditor
                  file={files[0]}
                  ffmpeg={ffmpegRef.current}
                  onTrim={handleTrim}
                  onCancel={reset}
                />
              ) : (
                <MergeEditor
                  files={files}
                  onMerge={handleMerge}
                  onCancel={reset}
                  onAddFiles={(newFiles) => setFiles([...files, ...newFiles])}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
