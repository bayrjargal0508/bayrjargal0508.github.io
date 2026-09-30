"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

import { useScrubVideo } from "./use-scrub-video";

// Custom hook for typewriter effect
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: number;
    let currentIndex = 0;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayed(text.slice(0, currentIndex));
          if (currentIndex >= text.length) {
            setDone(true);
            clearInterval(intervalId);
          }
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  // the hero is fixed, so nothing unmounts it: past the first screen it is
  // covered by the sections above it and has no reason to keep seeking
  const [heroOnScreen, setHeroOnScreen] = useState(true);

  useEffect(() => {
    const update = () => setHeroOnScreen(window.scrollY < window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const { videoRef, onLoadedMetadata, onSeeked } = useScrubVideo(heroOnScreen);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- read by the commented-out pill block below
  const [showPills, setShowPills] = useState(false);

  // Typewriter hook for hero message
  const heroText =
    "I’m a Frontend Developer specializing in React and Next.js, turning ideas and designs into fast, modern, and user-friendly web applications.";
  const { displayed, done } = useTypewriter(heroText, 38, 600);

  // Show pill buttons after 400ms delay independently
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowPills(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- read by the commented-out pill block below
  const actionPills = [
    "See what I build",
    "Start a project",
    "Explore my work",
    "Get to know me",
  ];

  return (
    <div className="fixed inset-0 w-full h-screen bg-black text-white selection:bg-white selection:text-black">
      <video
        ref={videoRef}
        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/3d-model-video.mp4`}
        poster={`${process.env.NEXT_PUBLIC_BASE_PATH}/hero-poster.webp`}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={onLoadedMetadata}
        onSeeked={onSeeked}
        className="fixed inset-0 z-0 w-full h-full object-cover object-[27%_center] md:object-[70%_center] pointer-events-none select-none"
      />

      {/* NAVBAR (fixed, z-index: 10) */}
      <nav className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-white select-none"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Bayarjargal
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none leading-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        {/* <div className="hidden md:flex items-center text-[23px] text-white">
          {navItems.map((item, idx) => (
            <React.Fragment key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="hover:opacity-60 transition-opacity cursor-pointer"
              >
                {item}
              </a>
              {idx < navItems.length - 1 && <span>,&nbsp;</span>}
            </React.Fragment>
          ))}
        </div> */}
      </nav>

      {/* HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] min-h-[100dvh] w-full flex flex-col items-stretch md:items-end justify-end md:justify-center pt-24 pb-12 md:py-24 px-5 sm:px-8 md:px-10">
        <div className="w-full max-w-xl relative z-10">
          {/* 2. Typewriter text */}
          <p
            className="grid text-white mb-5 sm:mb-6 font-normal"
            style={{
              fontSize: "clamp(18px, 4vw, 26px)",
              lineHeight: 1.35,
              fontWeight: 400,
            }}
          >
            {/* invisible full text reserves the final height so pills never jump */}
            <span aria-hidden className="col-start-1 row-start-1 invisible">
              {heroText}
            </span>
            <span className="col-start-1 row-start-1">
              {displayed}
              {!done && (
                <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />
              )}
            </span>
          </p>

          {/* 3. Action pill buttons */}
          {/* <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: showPills ? 1 : 0,
              transform: showPills ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {actionPills.map((label) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div> */}
          <button
            type="button"
            className="mt-8 flex flex-col w-full items-center justify-center"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/mouse.svg`}
              alt=""
              width={48}
              height={48}
              className="opacity-90 size-6 md:size-12"
              aria-hidden
            />
            SCROLL
          </button>
        </div>
      </main>
    </div>
  );
}
