"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Project = {
  name: string;
  domain?: string;
  tagline?: string;
  body?: string;
  stack?: string;
};

const tabs: { id: string; label: string; blurb: string; items: Project[] }[] = [
  {
    id: "work",
    label: "Work",
    blurb: "Real products. Real users. Real constraints.",
    items: [
      {
        name: "E-Geree",
        domain: "e-geree.mn",
        tagline: "Making contracts simpler, faster, and digital.",
        body: "A digital contract platform that transforms the entire document lifecycle — from creating and sending contracts to authentication, signing, and secure archiving.",
        stack: "Frontend · Next.js · React",
      },
      {
        name: "Gobi Travel",
        domain: "gobi-travel.mn",
        tagline: "Explore Mongolia beyond the map.",
        body: "A modern travel experience built around discovering Mongolia — from the vast Gobi landscape to curated tours and destinations.",
        stack: "Frontend · Next.js · React",
      },
      {
        name: "Yesh",
        domain: "yesh.mn",
        tagline: "Making exam preparation more measurable.",
        body: "A digital learning platform where students can practice, measure their performance, understand their weak areas, and track their progress.",
        stack: "Frontend · Next.js · React",
      },
    ],
  },
  // {
  //   id: "personal",
  //   label: "Personal",
  //   blurb: "Ideas I build because I'm curious.",
  //   items: [
  //     { name: "Assessment Cortexa" },
  //     { name: "Quiz Platform" },
  //     { name: "Wedding Invitation" },
  //     { name: "AquaMotion" },
  //   ],
  // },
];

const SLIDE = 0.5;

export default function WhatIBuild() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const travel = height - window.innerHeight;
      const raw = travel <= 0 ? 0 : -top / travel;
      setProgress(Math.min(1, Math.max(0, raw / SLIDE)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // left/right walk the tabs, as the tablist pattern expects
  const onTabKey = (e: KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      Home: -active,
      End: tabs.length - 1 - active,
    };
    const step = steps[e.key] ?? 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    // roving tabindex: focus follows selection, or the arrow key strands it
    (listRef.current?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <section ref={wrapRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* the whole panel slides in from the right over the hero */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate3d(${(1 - progress) * 100}%, 0, 0)`,
          }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/woolen-computer.webp`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden
          />
          {/* shadow cast across the felt rather than a flat grey wash */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(20,28,12,.88) 0%, rgba(20,28,12,.74) 34%, rgba(20,28,12,.18) 60%, rgba(20,28,12,0) 74%)",
            }}
          />
          {/* phone has no empty column to sit in, so the whole frame darkens */}
          <div
            aria-hidden
            className="absolute inset-0 md:hidden"
            style={{ background: "rgba(20,28,12,.5)" }}
          />

          <div className="relative z-10 h-full overflow-y-auto flex flex-col justify-center-safe px-5 sm:px-8 md:px-10 py-10 sm:py-12 max-w-none md:max-w-[58%] lg:max-w-[52%]">
            {/* the tab's underline is the same seam that separates projects:
                dashed while idle, stitched shut when active */}
            <div
              ref={listRef}
              role="tablist"
              aria-label="Projects"
              className="flex gap-6 sm:gap-8"
            >
              {tabs.map(({ id, label }, i) => (
                <button
                  key={id}
                  role="tab"
                  id={`tab-${id}`}
                  type="button"
                  aria-selected={i === active}
                  aria-controls={`panel-${id}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onTabKey}
                  className={`pb-2 border-b-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm ${
                    i === active
                      ? "border-solid border-white"
                      : "border-dashed border-white/40"
                  }`}
                  style={{
                    fontSize: "clamp(22px, 2.4vw, 32px)",
                    lineHeight: 1.05,
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                    color: i === active ? "#fff" : "rgba(255,255,255,.52)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* both panels share one grid cell: the taller one sets the height,
                so switching tabs never shifts the tab row */}
            <div className="grid">
              {tabs.map(({ id, blurb, items }, i) => (
                <div
                  key={id}
                  role="tabpanel"
                  id={`panel-${id}`}
                  aria-labelledby={`tab-${id}`}
                  aria-hidden={i !== active}
                  className={`col-start-1 row-start-1 ${i === active ? "" : "invisible"}`}
                >
                  <p
                    className="mt-4"
                    style={{
                      fontSize: "clamp(13px, 1.2vw, 16px)",
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    {blurb}
                  </p>

                  <ul className="mt-4 sm:mt-5">
                    {items.map(({ name, domain, tagline, body, stack }) => (
                      <li
                        key={name}
                        className="border-t-2 border-dashed border-white/40 pt-3.5 pb-4 sm:pt-4 sm:pb-5 last:pb-0"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <h3
                            style={{
                              fontSize: "clamp(18px, 1.7vw, 24px)",
                              lineHeight: 1.15,
                              fontWeight: 700,
                            }}
                          >
                            {name}
                          </h3>
                          {domain && (
                            <a
                              href={`https://${domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-2 decoration-white/40 hover:decoration-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/80 rounded-sm outline-none"
                              style={{
                                fontSize: "12px",
                                color: "rgba(255,255,255,.64)",
                              }}
                            >
                              {domain}
                            </a>
                          )}
                        </div>

                        {tagline && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "clamp(13.5px, 1.1vw, 16px)",
                              lineHeight: 1.35,
                            }}
                          >
                            {tagline}
                          </p>
                        )}
                        {body && (
                          <p
                            className="mt-2"
                            style={{
                              fontSize: "clamp(12.5px, 0.95vw, 14px)",
                              lineHeight: 1.55,
                              maxWidth: "48ch",
                              color: "rgba(255,255,255,.82)",
                            }}
                          >
                            {body}
                          </p>
                        )}
                        {stack && (
                          <p
                            className="mt-2.5"
                            style={{
                              fontSize: "11.5px",
                              letterSpacing: "0.04em",
                              color: "rgba(255,255,255,.58)",
                            }}
                          >
                            {stack}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
