import { useState, useRef, useEffect } from "react";

export function useVideoPlayer() {
  const videoContainer = useRef(null);
  const videoContainerWrapper = useRef(null);
  const [stream, setStream] = useState(null);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [muted, setMute] = useState(true);
  const [isShowControls, setIsShowControls] = useState(false);

  const switchAudio = () => {
    setMute(audio);
    setAudio(!audio);
  };
  const switchVideo = () => setVideo(!video);

  useEffect(() => {
    if (videoContainer.current) {
      videoContainer.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (videoContainer.current) {
      setMute(true);
      videoContainer.current.addEventListener("play", () => {
        setIsShowControls(true);
      });
      videoContainer.current.addEventListener("abort", () =>
        setIsShowControls(false)
      );
      videoContainer.current.addEventListener("ended", () =>
        setIsShowControls(false)
      );
    }
  }, [videoContainer]);

  return {
    videoContainer,
    videoContainerWrapper,

    stream,
    setStream,

    setMute,
    isShowControls,

    audioState: audio,
    switchAudio,

    videoState: video,
    switchVideo,
  };
}
