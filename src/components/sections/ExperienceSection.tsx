"use client";

import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect, useCallback } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createClient } from "@/utils/supabase/client";
import { getVideoSources, getCloudinaryThumbnail } from "@/utils/videoSources";

export type VideoStatus = 
  | "IDLE" 
  | "LOADING" 
  | "READY" 
  | "PLAYING" 
  | "PAUSED" 
  | "RETRYING" 
  | "ERROR";

export type SourceType = "primary" | "fallback";

export interface VideoState {
  status: VideoStatus;
  retryCount: number;
  sourceType: SourceType;
  lastError: string | null;
}

export interface ExperienceItem {
  id: string;
  videoSrc: string;
  primaryUrl: string;
  fallbackUrl: string;
  thumbnailSrc?: string;
}

// Development-only debugging badge
function DevDebugBadge({
  idx,
  exp,
  state,
  videoEl,
}: {
  idx: number;
  exp: ExperienceItem;
  state?: VideoState;
  videoEl: HTMLVideoElement | null;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const statusColor =
    state?.status === "PLAYING"
      ? "text-emerald-400"
      : state?.status === "ERROR"
      ? "text-red-400"
      : "text-amber-400";

  return (
    <div className="absolute top-3 left-3 z-30 bg-black/85 backdrop-blur-md text-[10px] font-mono text-white/90 p-2.5 rounded-lg border border-white/15 pointer-events-none max-w-[210px] leading-tight space-y-1 shadow-lg">
      <div className="font-bold text-accent truncate">ID: {exp.id}</div>
      <div>INDEX: {idx} (ACTIVE)</div>
      <div>
        STATUS: <span className={`font-semibold ${statusColor}`}>{state?.status || "UNKNOWN"}</span>
      </div>
      <div>SOURCE: {(state?.sourceType || "primary").toUpperCase()}</div>
      <div>RETRIES: {state?.retryCount ?? 0}</div>
      <div>
        READY: {videoEl?.readyState ?? 0} | NET: {videoEl?.networkState ?? 0}
      </div>
      <div>
        TIME: {videoEl?.currentTime?.toFixed(1) ?? "0.0"}s / {videoEl?.duration?.toFixed(1) ?? "0.0"}s
      </div>
      {state?.lastError && (
        <div className="text-red-300 text-[9px] line-clamp-2">ERR: {state.lastError}</div>
      )}
    </div>
  );
}

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [videoStates, setVideoStates] = useState<Record<number, VideoState>>({});
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fresh-access state refs to prevent stale closure bugs in async workflows
  const videoStatesRef = useRef<Record<number, VideoState>>({});
  const experiencesRef = useRef<ExperienceItem[]>([]);
  const currentIndexRef = useRef(0);
  const isMutedRef = useRef(true);
  const isInViewRef = useRef(false);
  const isOfflineRef = useRef(false);
  const navVersionRef = useRef(0);
  const isWaitingForNextRef = useRef(false);

  // Active timers tracking for cleanup
  const retryTimersRef = useRef<Record<number, NodeJS.Timeout>>({});
  const stallTimersRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Synchronous state updater helper
  const updateVideoState = useCallback((idx: number, patch: Partial<VideoState>) => {
    setVideoStates((prev) => {
      const current = prev[idx] || {
        status: "IDLE",
        retryCount: 0,
        sourceType: "primary",
        lastError: null,
      };
      const updated: VideoState = { ...current, ...patch };
      videoStatesRef.current[idx] = updated;
      return { ...prev, [idx]: updated };
    });
  }, []);

  // Fetch channel videos from Supabase and derive primary/fallback sources
  useEffect(() => {
    async function fetchChannel() {
      const { data } = await supabase.from('channel').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        const items: ExperienceItem[] = data.map((item) => {
          const sources = getVideoSources(item.video_url);
          return {
            id: item.id,
            videoSrc: item.video_url,
            primaryUrl: sources.primaryUrl,
            fallbackUrl: sources.fallbackUrl,
            thumbnailSrc: sources.thumbnailUrl || getCloudinaryThumbnail(item.video_url, 5),
          };
        });

        const initialStates: Record<number, VideoState> = {};
        items.forEach((_, idx) => {
          initialStates[idx] = {
            status: idx === 0 ? "LOADING" : "IDLE",
            retryCount: 0,
            sourceType: "primary",
            lastError: null,
          };
        });

        videoStatesRef.current = initialStates;
        setVideoStates(initialStates);
        experiencesRef.current = items;
        setExperiences(items);
      }
      setIsLoading(false);
    }
    fetchChannel();
  }, [supabase]);

  // Keep ref mirror synced
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  // Swipe detection state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Toggle mute — updates DOM video and mirrors ref
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    isMutedRef.current = newMuted;
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = newMuted;
      if (!newMuted && currentVideo.paused) {
        currentVideo.play().catch(() => {});
      }
    }
  };

  // Viewport intersection observer (threshold 15%)
  useEffect(() => {
    const target = deckRef.current || sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    
    observer.observe(target);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Playback readiness checker
  const waitForPlayable = useCallback((video: HTMLVideoElement, timeoutMs = 7000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve(true);
        return;
      }

      let settled = false;
      let timer: NodeJS.Timeout;

      const cleanup = () => {
        settled = true;
        clearTimeout(timer);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("playing", onReady);
        video.removeEventListener("loadeddata", onData);
        video.removeEventListener("error", onError);
      };

      const onReady = () => {
        if (settled) return;
        cleanup();
        resolve(true);
      };

      const onData = () => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          if (settled) return;
          cleanup();
          resolve(true);
        }
      };

      const onError = () => {
        if (settled) return;
        cleanup();
        resolve(false);
      };

      video.addEventListener("canplay", onReady, { once: true });
      video.addEventListener("playing", onReady, { once: true });
      video.addEventListener("loadeddata", onData);
      video.addEventListener("error", onError, { once: true });

      timer = setTimeout(() => {
        if (settled) return;
        cleanup();
        resolve(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
      }, timeoutMs);
    });
  }, []);

  // Centralized failure recovery handler
  const handleVideoFailure = useCallback((idx: number, error: string) => {
    if (isOfflineRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[ExperienceSection] Video ${idx} failed while offline. Pausing retries.`);
      }
      return;
    }

    const currentState = videoStatesRef.current[idx] || {
      status: "IDLE",
      retryCount: 0,
      sourceType: "primary",
      lastError: null,
    };

    const video = videoRefs.current[idx];
    const item = experiencesRef.current[idx];
    if (!item) return;

    const { retryCount, sourceType } = currentState;
    const MAX_PRIMARY_RETRIES = 3;
    const MAX_FALLBACK_RETRIES = 2;

    if (process.env.NODE_ENV === "development") {
      console.warn(`[ExperienceSection] Failure on video ${idx} (${sourceType}, retry ${retryCount}):`, error);
    }

    if (retryTimersRef.current[idx]) {
      clearTimeout(retryTimersRef.current[idx]);
    }

    if (sourceType === "primary") {
      if (retryCount < MAX_PRIMARY_RETRIES) {
        // Retry primary with exponential backoff: ~500ms, ~1000ms, ~2000ms
        const delay = 500 * Math.pow(2, retryCount);
        updateVideoState(idx, {
          status: "RETRYING",
          retryCount: retryCount + 1,
          lastError: error,
        });

        retryTimersRef.current[idx] = setTimeout(() => {
          if (isOfflineRef.current) return;
          if (video) {
            video.load();
            if (idx === currentIndexRef.current && isInViewRef.current) {
              playVideo(video, idx, navVersionRef.current);
            }
          }
        }, delay);
        return;
      } else {
        // Primary exhausted! Automatically switch to fallbackUrl
        if (process.env.NODE_ENV === "development") {
          console.info(`[ExperienceSection] Video ${idx}: Primary exhausted. Switching to fallback URL: ${item.fallbackUrl}`);
        }
        updateVideoState(idx, {
          status: "RETRYING",
          sourceType: "fallback",
          retryCount: 0,
          lastError: `Primary failed after ${MAX_PRIMARY_RETRIES} attempts. Trying fallback.`,
        });

        if (video) {
          video.src = item.fallbackUrl;
          video.load();
          if (idx === currentIndexRef.current && isInViewRef.current) {
            playVideo(video, idx, navVersionRef.current);
          }
        }
        return;
      }
    } else {
      // Fallback source retry
      if (retryCount < MAX_FALLBACK_RETRIES) {
        const delay = 500 * Math.pow(2, retryCount);
        updateVideoState(idx, {
          status: "RETRYING",
          retryCount: retryCount + 1,
          lastError: error,
        });

        retryTimersRef.current[idx] = setTimeout(() => {
          if (isOfflineRef.current) return;
          if (video) {
            video.load();
            if (idx === currentIndexRef.current && isInViewRef.current) {
              playVideo(video, idx, navVersionRef.current);
            }
          }
        }, delay);
        return;
      } else {
        // Fallback exhausted: Controlled ERROR state.
        // Safety layer: Keep poster visible, DO NOT blindly skip!
        updateVideoState(idx, {
          status: "ERROR",
          lastError: `Fallback exhausted after ${MAX_FALLBACK_RETRIES} attempts: ${error}`,
        });
        if (process.env.NODE_ENV === "development") {
          console.error(`[ExperienceSection] Video ${idx} exhausted all recovery attempts. Retaining poster.`);
        }
      }
    }
  }, [updateVideoState]);

  // Robust play function with mobile Safari and autoplay policy handling
  const playVideo = useCallback(async (video: HTMLVideoElement, idx: number, navVersion: number) => {
    if (!video) return;

    // Discard stale in-flight plays
    if (navVersion !== navVersionRef.current || idx !== currentIndexRef.current) {
      return;
    }

    video.playsInline = true;
    video.muted = isMutedRef.current;

    // Reset loop boundary if at end
    if (video.currentTime >= video.duration - 0.1 && video.duration > 0) {
      video.currentTime = 0;
    }

    // Ensure source is loaded
    if (video.readyState === 0) {
      video.load();
    }

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        if (navVersion === navVersionRef.current && idx === currentIndexRef.current) {
          updateVideoState(idx, { status: "PLAYING" });
        }
      }
    } catch (err: any) {
      if (navVersion !== navVersionRef.current || idx !== currentIndexRef.current) {
        return;
      }

      const errName = err?.name || "";

      // 1. Autoplay policy rejection
      if (errName === "NotAllowedError") {
        if (!video.muted) {
          video.muted = true;
          setIsMuted(true);
          isMutedRef.current = true;
          try {
            await video.play();
            updateVideoState(idx, { status: "PLAYING" });
            return;
          } catch {}
        }

        // Muted autoplay blocked: resume on user gesture
        const resumeOnGesture = () => {
          window.removeEventListener("click", resumeOnGesture);
          window.removeEventListener("touchstart", resumeOnGesture);
          if (idx === currentIndexRef.current && isInViewRef.current) {
            video.play().then(() => {
              updateVideoState(idx, { status: "PLAYING" });
            }).catch(() => {});
          }
        };
        window.addEventListener("click", resumeOnGesture, { once: true });
        window.addEventListener("touchstart", resumeOnGesture, { once: true });
        return;
      }

      // 2. AbortError is normal when swiping or pausing quickly
      if (errName === "AbortError") {
        return;
      }

      // 3. Playback / decode failure
      handleVideoFailure(idx, `Play rejected: ${err?.message || err}`);
    }
  }, [handleVideoFailure, updateVideoState]);

  // Next-video background preloader
  const preloadVideo = useCallback(async (targetIdx: number) => {
    const experiences = experiencesRef.current;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;

    const targetVideo = videoRefs.current[targetIdx];
    const item = experiences[targetIdx];
    if (!targetVideo || !item) return;

    const currentState = videoStatesRef.current[targetIdx];
    if (currentState?.status === "READY" || currentState?.status === "PLAYING") {
      return;
    }

    updateVideoState(targetIdx, { status: "LOADING" });

    const activeSrc = currentState?.sourceType === "fallback" ? item.fallbackUrl : item.primaryUrl;
    if (targetVideo.src !== activeSrc) {
      targetVideo.src = activeSrc;
    }
    targetVideo.preload = "auto";
    targetVideo.load();

    const isPlayable = await waitForPlayable(targetVideo, 7000);
    if (isPlayable) {
      updateVideoState(targetIdx, { status: "READY" });
      // If active video finished while waiting for this next video, advance immediately
      if (isWaitingForNextRef.current && (currentIndexRef.current + 1) % experiences.length === targetIdx) {
        isWaitingForNextRef.current = false;
        navigateTo(targetIdx);
      }
    } else {
      handleVideoFailure(targetIdx, "Preload readiness timeout");
    }
  }, [handleVideoFailure, updateVideoState, waitForPlayable]);

  // Asynchronous-safe navigation helper
  const navigateTo = useCallback((idx: number) => {
    const len = experiencesRef.current.length;
    if (len === 0) return;
    const target = (idx + len) % len;
    navVersionRef.current++;
    isWaitingForNextRef.current = false;
    currentIndexRef.current = target;
    setCurrentIndex(target);
  }, []);

  const nextExperience = useCallback(() => {
    navigateTo(currentIndexRef.current + 1);
  }, [navigateTo]);

  const prevExperience = useCallback(() => {
    navigateTo(currentIndexRef.current - 1);
  }, [navigateTo]);

  const setExperience = useCallback((idx: number) => {
    navigateTo(idx);
  }, [navigateTo]);

  // Video event handlers
  const handleVideoLoadedMetadata = (idx: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (!experiencesRef.current[idx]?.thumbnailSrc && vid.duration >= 5 && vid.currentTime === 0) {
      vid.currentTime = 5;
    }
  };

  const handleVideoCanPlay = (idx: number) => {
    const currentState = videoStatesRef.current[idx];
    if (currentState?.status !== "PLAYING") {
      updateVideoState(idx, { status: "READY" });
    }

    if (stallTimersRef.current[idx]) {
      clearTimeout(stallTimersRef.current[idx]);
    }

    if (isWaitingForNextRef.current && (currentIndexRef.current + 1) % experiencesRef.current.length === idx) {
      isWaitingForNextRef.current = false;
      navigateTo(idx);
    }
  };

  const handleVideoPlaying = (idx: number) => {
    if (stallTimersRef.current[idx]) {
      clearTimeout(stallTimersRef.current[idx]);
    }
    updateVideoState(idx, { status: "PLAYING" });
  };

  const handleVideoWaiting = (idx: number) => {
    if (idx === currentIndexRef.current && isInViewRef.current) {
      if (stallTimersRef.current[idx]) clearTimeout(stallTimersRef.current[idx]);
      stallTimersRef.current[idx] = setTimeout(() => {
        handleVideoFailure(idx, "Playback buffer stalled (waiting event)");
      }, 3000);
    }
  };

  const handleVideoStalled = (idx: number) => {
    if (idx === currentIndexRef.current && isInViewRef.current) {
      if (stallTimersRef.current[idx]) clearTimeout(stallTimersRef.current[idx]);
      stallTimersRef.current[idx] = setTimeout(() => {
        handleVideoFailure(idx, "Media download stalled (stalled event)");
      }, 3000);
    }
  };

  const handleVideoError = (idx: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    const mediaErr = vid.error;
    const errMsg = mediaErr 
      ? `Code ${mediaErr.code}: ${mediaErr.message || 'Media decode or network error'}`
      : "Unknown video element error";
    handleVideoFailure(idx, errMsg);
  };

  // Video end handler: waits for next video readiness instead of blindly skipping
  const handleVideoEnded = (idx: number) => {
    if (idx !== currentIndexRef.current) return;
    const len = experiencesRef.current.length;
    if (len <= 1) return;

    const nextIdx = (idx + 1) % len;
    const nextState = videoStatesRef.current[nextIdx];

    if (nextState?.status === "READY" || nextState?.status === "PLAYING") {
      isWaitingForNextRef.current = false;
      nextExperience();
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(`[ExperienceSection] Active video ended. Next video (${nextIdx}) is ${nextState?.status || 'IDLE'}. Waiting for readiness.`);
      }
      isWaitingForNextRef.current = true;
      preloadVideo(nextIdx);
    }
  };

  // Playback watchdog: monitors active video currentTime progression
  useEffect(() => {
    if (!isInView) return;

    let lastTime = -1;
    let stuckCount = 0;

    const watchdogInterval = setInterval(() => {
      const activeVideo = videoRefs.current[currentIndex];
      const activeState = videoStatesRef.current[currentIndex];

      if (!activeVideo || !activeState || activeState.status !== "PLAYING") {
        stuckCount = 0;
        lastTime = -1;
        return;
      }

      if (activeVideo.paused || activeVideo.ended) {
        stuckCount = 0;
        return;
      }

      const cur = activeVideo.currentTime;
      if (lastTime >= 0 && Math.abs(cur - lastTime) < 0.05) {
        stuckCount++;
        if (stuckCount >= 4) { // Frozen for 4 seconds
          stuckCount = 0;
          if (process.env.NODE_ENV === "development") {
            console.warn(`[ExperienceSection] Watchdog detected frozen active video at index ${currentIndex}. Triggering recovery.`);
          }
          handleVideoFailure(currentIndex, "Watchdog detected frozen playback");
        }
      } else {
        stuckCount = 0;
        lastTime = cur;
      }
    }, 1000);

    return () => clearInterval(watchdogInterval);
  }, [currentIndex, isInView, handleVideoFailure]);

  // Online / offline network listeners
  useEffect(() => {
    const onOnline = () => {
      isOfflineRef.current = false;
      if (process.env.NODE_ENV === "development") {
        console.log("[ExperienceSection] Device back online. Resuming active video.");
      }
      const activeIdx = currentIndexRef.current;
      const activeVideo = videoRefs.current[activeIdx];
      if (activeVideo && isInViewRef.current) {
        playVideo(activeVideo, activeIdx, navVersionRef.current);
      }
      const nextIdx = (activeIdx + 1) % experiencesRef.current.length;
      preloadVideo(nextIdx);
    };

    const onOffline = () => {
      isOfflineRef.current = true;
      if (process.env.NODE_ENV === "development") {
        console.warn("[ExperienceSection] Device offline. Halting active retries.");
      }
      Object.values(retryTimersRef.current).forEach((t) => clearTimeout(t));
      Object.values(stallTimersRef.current).forEach((t) => clearTimeout(t));
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [playVideo, preloadVideo]);

  // Active video control: play active, pause others, preload next video
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    isInViewRef.current = isInView;
    const currentNav = navVersionRef.current;

    let playTimeout: NodeJS.Timeout;

    experiences.forEach((exp, idx) => {
      const video = videoRefs.current[idx];
      if (!video) return;

      if (idx === currentIndex) {
        if (isInView) {
          if (video.currentTime >= 4.9 && video.paused) {
            video.currentTime = 0;
          }
          playTimeout = setTimeout(() => {
            playVideo(video, idx, currentNav);
          }, 100);
        } else {
          video.pause();
          updateVideoState(idx, { status: "PAUSED" });
        }
      } else {
        video.pause();
        if (!exp.thumbnailSrc && video.duration >= 5) {
          video.currentTime = 5;
        }
      }
    });

    // Proactively prepare next video
    if (experiences.length > 1) {
      const nextIdx = (currentIndex + 1) % experiences.length;
      preloadVideo(nextIdx);
    }

    return () => {
      if (playTimeout) clearTimeout(playTimeout);
    };
  }, [currentIndex, isInView, experiences, playVideo, preloadVideo, updateVideoState]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      navVersionRef.current++;
      Object.values(retryTimersRef.current).forEach((t) => clearTimeout(t));
      Object.values(stallTimersRef.current).forEach((t) => clearTimeout(t));
      videoRefs.current.forEach((v) => {
        if (v) v.pause();
      });
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextExperience();
    } else if (isRightSwipe) {
      prevExperience();
    }
  };

  return (
    <section ref={sectionRef} id="channel" className="py-6 md:py-8 relative z-10 bg-background overflow-hidden">
      <Container>
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 md:gap-16">
          
          {/* Left: Video Stack Layout */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
            {/* Deck Container */}
            <div 
              ref={deckRef}
              className="relative h-[65vh] md:h-[75vh] aspect-[10/16] shrink-0 mx-auto touch-pan-y rounded-2xl bg-black"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 rounded-2xl pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/loader.svg" alt="Loading..." className="w-12 h-12 animate-pulse drop-shadow-xl" />
                </div>
              )}
              {experiences.map((exp, idx) => {
                const len = experiences.length;
                const diff = (idx - currentIndex + len) % len;
                const itemState = videoStates[idx];

                // Stacked logic for both mobile and desktop
                let stackClasses = "";
                if (diff === 0) {
                  // Active Card
                  stackClasses = "z-20 translate-x-0 translate-y-0 opacity-100 scale-100 shadow-2xl";
                } else if (diff === 1) {
                  // Next Card (peeking from the right)
                  stackClasses = "z-10 translate-x-8 md:translate-x-12 translate-y-0 opacity-70 scale-95 brightness-50 cursor-pointer";
                } else if (diff === len - 1) {
                  // Previous Card (peeking from the left)
                  stackClasses = "z-10 -translate-x-8 md:-translate-x-12 translate-y-0 opacity-70 scale-95 brightness-50 cursor-pointer";
                } else if (diff === 2) {
                  // 3rd Card (peeking further right)
                  stackClasses = "z-0 translate-x-16 md:translate-x-20 translate-y-0 opacity-30 scale-90 brightness-25 pointer-events-none hidden md:block";
                } else if (diff === len - 2) {
                  // Card before previous (peeking further left)
                  stackClasses = "z-0 -translate-x-16 md:-translate-x-20 translate-y-0 opacity-30 scale-90 brightness-25 pointer-events-none hidden md:block";
                } else {
                  // Hidden Cards
                  stackClasses = "z-0 opacity-0 translate-x-0 translate-y-0 scale-90 pointer-events-none";
                }

                // Determine resource URL based on tracked state machine
                const activeSrc = itemState?.sourceType === "fallback" ? exp.fallbackUrl : exp.primaryUrl;

                return (
                  <div
                    key={exp.id}
                    className={`absolute top-0 left-0 w-full h-full bg-[#0B0D0C] border border-border overflow-hidden rounded-2xl transition-all duration-700 ease-in-out ${stackClasses}`}
                    onClick={() => {
                      if (diff === 1) nextExperience();
                      if (diff === len - 1) prevExperience();
                    }}
                  >
                    {/* Visual Safety Poster: keeps thumbnail visible whenever video is loading, retrying, stalled, or in error */}
                    {exp.thumbnailSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exp.thumbnailSrc}
                        alt="Video cover"
                        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 z-[1] ${
                          itemState?.status === "PLAYING" ? "opacity-0" : "opacity-100"
                        }`}
                      />
                    )}

                    {/* Unobtrusive buffering indicator on active card during loading or retrying */}
                    {diff === 0 && (itemState?.status === "LOADING" || itemState?.status === "RETRYING") && (
                      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none bg-black/25 backdrop-blur-[1px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/loader.svg" alt="Buffering..." className="w-10 h-10 animate-pulse drop-shadow-md" />
                      </div>
                    )}

                    {/* Manual retry button if all recovery options fail, retaining the poster */}
                    {diff === 0 && itemState?.status === "ERROR" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-[2] bg-black/40">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVideoFailure(idx, "Manual user retry");
                          }}
                          className="px-4 py-2 rounded-full bg-surface/90 border border-border text-foreground hover:bg-accent hover:border-accent hover:text-black text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry Video
                        </button>
                      </div>
                    )}

                    {/* Development-only live telemetry badge */}
                    {diff === 0 && (
                      <DevDebugBadge
                        idx={idx}
                        exp={exp}
                        state={itemState}
                        videoEl={videoRefs.current[idx]}
                      />
                    )}

                    {/* Video element */}
                    <video
                      ref={(el) => { videoRefs.current[idx] = el; }}
                      src={activeSrc}
                      muted
                      playsInline
                      autoPlay={diff === 0}
                      preload={diff === 0 || diff === 1 ? "auto" : "none"}
                      poster={exp.thumbnailSrc}
                      onLoadedMetadata={(e) => handleVideoLoadedMetadata(idx, e)}
                      onCanPlay={() => handleVideoCanPlay(idx)}
                      onPlaying={() => handleVideoPlaying(idx)}
                      onWaiting={() => handleVideoWaiting(idx)}
                      onStalled={() => handleVideoStalled(idx)}
                      onError={(e) => handleVideoError(idx, e)}
                      onEnded={() => handleVideoEnded(idx)}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      style={{ WebkitPlaysinline: true } as React.CSSProperties}
                    />

                    {/* Mute Toggle (Only on Active Video) */}
                    {diff === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all duration-300"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation & Indicators */}
            <div className="flex items-center justify-center gap-6 w-full mt-8 md:mt-12">
              {/* Prev Button (Desktop Only) */}
              <button 
                onClick={prevExperience} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-foreground hover:bg-accent hover:border-accent hover:text-black transition-all duration-300 shadow-sm"
                aria-label="Previous video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center justify-center gap-3">
                {experiences.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExperience(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${idx === currentIndex ? "w-8 bg-accent shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"}`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button (Desktop Only) */}
              <button 
                onClick={nextExperience} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-foreground hover:bg-accent hover:border-accent hover:text-black transition-all duration-300 shadow-sm"
                aria-label="Next video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Section Header */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
            <SectionHeading 
              title={
                <>
                  YogaJam Channel<br/>
                  <span className="md:hidden">Move Better. Live More.</span>
                  <span className="hidden md:inline">Move Better.<br/>Live More.</span>
                </>
              }
              align="left"
              className="!mb-0"
            />
            <p className="hidden md:block mt-6 text-text-secondary text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
              Discover the benefits of yoga, wellness, and movement through our Jams. Get inspired, learn something new, and explore a lifestyle that brings people together.
            </p>
          </div>

        </div>
      </Container>
    </section>
  );
}
