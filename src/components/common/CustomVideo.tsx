"use client";

import { motion } from "framer-motion";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import React, { useRef, useState } from "react";

interface Props {
  src: string | File;
  className?: string;
  thumbnail?: string;
  duration?: number; // optional duration to show before play
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const CustomVideo: React.FC<Props> = ({
  src,
  className,
  thumbnail,
  duration,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Play / pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  // Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(videoRef.current.muted);
  };

  // Update progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);

    // Call the onTimeUpdate callback if provided
    if (onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // Load metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setLoadedDuration(videoRef.current.duration);
    }
  };

  // Seek video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  // Fullscreen
  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  // Prevent right-click/download
  const preventActions = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // When video plays first time
  const handlePlay = () => {
    setIsPlaying(true);
    setHasPlayed(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl shadow-lg ${
        className || ""
      }`}
      onContextMenu={preventActions}
      onDragStart={preventActions}
    >
      <video
        ref={videoRef}
        className="w-full h-full rounded-2xl select-none object-cover"
        poster={thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        controls={false}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
      >
        <source
          src={typeof src === "string" ? src : URL.createObjectURL(src)}
        />
      </video>

      {/* Middle Play / Pause */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={togglePlay}
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isPlaying ? "bg-black/30" : "bg-black/50"
        }`}
      >
        <div className="bg-white/20 rounded-full p-3">
          {isPlaying ? (
            <Pause className="w-10 h-10 text-primary fill-primary" />
          ) : (
            <Play className="w-10 h-10 text-primary fill-primary" />
          )}
        </div>
      </motion.button>

      {/* Duration badge before play */}
      {!hasPlayed && duration && (
        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatTime(duration)}
        </span>
      )}

      {/* Controls */}
      {hasPlayed && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 flex flex-col px-4 pb-3 pt-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        >
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="w-full accent-red-500 cursor-pointer"
          />

          <div className="flex items-center justify-between mt-2 text-white text-sm">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="hover:text-red-500">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button onClick={toggleMute} className="hover:text-red-500">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <span>
                {videoRef.current
                  ? formatTime(videoRef.current.currentTime)
                  : "0:00"}{" "}
                / {formatTime(loadedDuration)}
              </span>
            </div>

            <button onClick={handleFullscreen} className="hover:text-red-500">
              <Maximize size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomVideo;
