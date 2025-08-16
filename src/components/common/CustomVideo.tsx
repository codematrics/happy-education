"use client";
import { motion } from "framer-motion";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import React, { HTMLProps, useRef, useState } from "react";

interface Props {
  src: string | File;
  className?: HTMLProps<HTMLElement>["className"];
  thumbnail?: string;
}

const CustomVideo: React.FC<Props> = ({ src, className, thumbnail }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const percentage =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percentage);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime =
      (parseFloat(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Prevent copy/download
  const preventActions = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Format time helper
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const isPausedInMiddle = !isPlaying;

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
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={false}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
      >
        <source
          src={typeof src === "string" ? src : URL.createObjectURL(src)}
        />
      </video>

      {isPausedInMiddle && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50"
        >
          <div className="bg-white/20 rounded-full p-3">
            <Play className="w-10 h-10 text-primary fill-primary" />
          </div>
        </motion.button>
      )}

      {!isPausedInMiddle && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 flex flex-col px-4 pb-3 pt-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full accent-red-500 cursor-pointer"
          />

          <div className="flex items-center justify-between mt-2 text-white text-sm">
            <div className="flex items-center gap-3">
              <button onClick={handlePlayPause} className="hover:text-red-500">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button onClick={handleMute} className="hover:text-red-500">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <span>
                {videoRef.current
                  ? formatTime(videoRef.current.currentTime)
                  : "0:00"}{" "}
                / {formatTime(duration)}
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
