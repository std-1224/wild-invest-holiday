import { useRef, useEffect, useState } from "react";

export const CabinVideo = ({ cabin }: any) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0; // optional: reset to start
    }
  }, [isHovered]);

  return (
    <video
      ref={videoRef}
      src={cabin.video}
      loop
      muted
      playsInline
      className="cabin-video"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};
