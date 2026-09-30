"use client";

import { useEffect, useRef, useState } from "react";

import { useScrubVideo } from "../use-scrub-video";

/* The room is filmed once and then stays put: the film holds the viewport while
   every beat of the writing scrolls across it. Moving the cursor drags its
   playhead, the same gesture the hero answers to. */

const INK = "#2B241E"; // her felted sweater, lifted; 7.0:1 worst-case on the photographed wall
const THREAD = "#9C3025"; // her red socks, darkened until it clears the 3:1 non-text gate
const SEAM = "#7A2A20"; // the tie-off: underline + focus ring, survives every ground here

const HAND = "var(--font-hand), Georgia, 'Times New Roman', serif";
const SANS = "var(--font-geist-sans), system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const STITCH_Y = `repeating-linear-gradient(to bottom, ${THREAD} 0 9px, transparent 9px 17px)`;
const STITCH_X = `repeating-linear-gradient(to right, ${THREAD} 0 9px, transparent 9px 17px)`;

// the sewn end rides here on screen, so a knot ties as its beat crosses the reading line
const SEWN_AT = 0.72;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* globals.css declares unlayered `p, div, h1-h6` rules (font-mono, text-white).
   Unlayered CSS beats Tailwind's layered utilities, so every leaf text node sets
   family/size/leading/weight/colour inline or it renders white mono on cream. */
const heroName = {
  fontFamily: HAND,
  fontSize: "clamp(31px, min(4.4vw, 6.4vh), 52px)",
  lineHeight: 1.05,
  letterSpacing: "-0.02em",
  fontWeight: 500,
  fontVariationSettings: "'wght' 500, 'SOFT' 100, 'WONK' 1",
  color: INK,
} as const;

const heroLine = {
  fontFamily: SANS,
  fontSize: "clamp(16.5px, min(1.5vw, 2.6vh), 21px)",
  lineHeight: 1.4,
  fontWeight: 400,
  color: INK,
  maxWidth: "40ch",
} as const;

const heading = {
  fontFamily: HAND,
  fontSize: "clamp(17.5px, 1.65vw, 23px)",
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  fontWeight: 600,
  fontVariationSettings: "'wght' 600, 'SOFT' 100, 'WONK' 0",
  color: INK,
} as const;

const prose = {
  fontFamily: SANS,
  fontSize: "clamp(14.5px, 1.1vw, 16.5px)",
  lineHeight: 1.6,
  fontWeight: 400,
  color: INK,
} as const;

const name = { fontWeight: 600, color: INK } as const;

// what I do: one rule generates all four — what is nearest the thread is biggest
const craft = [
  {
    text: "Frontend development. React, Next, TypeScript.",
    size: "clamp(21px, 2.6vw, 29px)",
    indent: "0px",
    measure: "30ch",
  },
  {
    text: "Working out what a thing is for, before it exists.",
    size: "clamp(19px, 2.2vw, 25px)",
    indent: "clamp(12px, 2vw, 24px)",
    measure: "28ch",
  },
  {
    text: "How it moves, and how that feels under a thumb.",
    size: "clamp(17px, 1.9vw, 21.5px)",
    indent: "clamp(24px, 4.5vw, 56px)",
    measure: "26ch",
  },
  {
    text: "A folder of things that were never meant to ship.",
    size: "clamp(15.5px, 1.7vw, 18.5px)",
    indent: "clamp(36px, 7.5vw, 96px)",
    measure: "24ch",
  },
];

// curiosity: more thread paid out the further down the list it goes
const curious = [
  { text: "AI in product development", spur: "clamp(24px, 3vw, 44px)" },
  { text: "Creative web experiences", spur: "clamp(34px, 5.5vw, 70px)" },
  { text: "Frontend architecture", spur: "clamp(44px, 8vw, 96px)" },
  { text: "Interactive design", spur: "clamp(54px, 10.5vw, 122px)" },
  { text: "New web technologies", spur: "clamp(64px, 13vw, 148px)" },
];

// the tie-off: the three facts a reader scans for, with the live links
const facts = [
  { label: "Works in", value: "React, Next.js, TypeScript, Tailwind" },
  { label: "Shipped", sites: ["e-geree.mn", "gobi-travel.mn", "yesh.mn"] },
  {
    label: "Cares about",
    value: "Speed, keyboard access, and the small states nobody designs",
  },
];

const factLabel = {
  fontFamily: SANS,
  fontSize: "clamp(13px, 1vw, 14.5px)",
  lineHeight: 1.5,
  fontWeight: 500,
  color: INK,
} as const;

const factValue = {
  fontFamily: SANS,
  fontSize: "clamp(14.5px, 1.1vw, 16.5px)",
  lineHeight: 1.5,
  fontWeight: 400,
  color: INK,
  maxWidth: "42ch",
} as const;

const EMAIL = "bayrjargal0508@gmail.com";

function Knot({ on, still }: { on: boolean; still: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: -33,
        top: 7,
        width: 8,
        height: 8,
        borderRadius: 9999,
        background: THREAD,
        transform: `scale(${on ? 1 : 0})`,
        // the small bounce of wool being pressed; the only easing curve in the file
        transition: still
          ? "none"
          : "transform 160ms cubic-bezier(.34,1.56,.64,1)",
      }}
    />
  );
}

export default function AboutMe() {
  const sectionRef = useRef<HTMLElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [sewn, setSewn] = useState(0); // how far the column thread has run
  const [knots, setKnots] = useState(0); // bitmask, one bit per beat
  const [still, setStill] = useState(false); // prefers-reduced-motion
  const [near, setNear] = useState(false); // the film is worth decoding

  // a quarter-viewport of warning: the film buffers and takes the cursor just
  // before it is looked at, and gives both back once it is behind you
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "25%" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { videoRef, onLoadedMetadata, onSeeked } = useScrubVideo(near);

  useEffect(() => {
    // reduced motion lands on the finished composition: room kept, thread fully sewn
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setSewn(1);
      setKnots(-1);
      return;
    }

    const update = () => {
      const col = colRef.current;
      if (!col) return;
      const line = window.innerHeight * SEWN_AT;
      const rect = col.getBoundingClientRect();
      setSewn(clamp01((line - rect.top) / rect.height));
      // live rects, not offsets cached at mount: survives resize and the font swap
      setKnots(
        beatRefs.current.reduce(
          (mask, el, i) =>
            el && el.getBoundingClientRect().top <= line
              ? mask | (1 << i)
              : mask,
          0,
        ),
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const tied = (i: number) => (knots & (1 << i)) !== 0;
  const beat = (i: number) => (el: HTMLDivElement | null) => {
    beatRefs.current[i] = el;
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="relative"
    >
      {/* the room stays where it is and the writing travels over it: sticky for
          the height of the section, pulled back out of the flow by its own
          height so no beat has to make room for it. */}
      <div
        aria-hidden
        className="sticky top-0 z-0 h-[100lvh] -mb-[100lvh] overflow-hidden"
      >
        {/* object-position 12% is hand-tuned to this 1914x1080 footage: at phone
            widths it keeps the column on lit plaster rather than on her face.
            Recrop the film and this number silently becomes wrong. The still is
            the poster, so the frame is never black while the video loads.
            Both wait for `near`: a poster always downloads at once and even
            preload="metadata" opens a request, and at page start either one
            takes bandwidth from the hero two screens above. */}
        <video
          ref={videoRef}
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/media/woolen-girl.mp4`}
          poster={
            near
              ? `${process.env.NEXT_PUBLIC_BASE_PATH}/woolen-model-bg.webp`
              : undefined
          }
          muted
          playsInline
          preload={near ? "auto" : "none"}
          aria-hidden
          onLoadedMetadata={onLoadedMetadata}
          onSeeked={onSeeked}
          className="absolute inset-0 w-full h-full object-cover object-[12%_center] md:landscape:object-[50%_center] pointer-events-none select-none"
        />

        {/* light on the floorboards. The photograph's one weak band for ink is
            the shadowed floor at ~78% of the frame: 4.5:1 at the median, 3.0:1
            at its darkest. This lifts the band under the writing only — on wide
            screens a mask ends it before her, so the wool keeps its blacks. */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(to top, rgba(255,243,222,.72) 0%, rgba(255,243,222,.52) 14%, rgba(255,243,222,0) 36%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background: "linear-gradient(to top, rgba(255,243,222,.72) 0%, rgba(255,243,222,.52) 14%, rgba(255,243,222,0) 36%)",
            maskImage: "linear-gradient(to right, #000 0 46%, transparent 74%)",
            WebkitMaskImage: "linear-gradient(to right, #000 0 46%, transparent 74%)",
          }}
        />
      </div>

      {/* A — the opening, set low on the photograph */}
      <div className="relative z-10 px-5 sm:px-8 md:px-10">
        <div className="relative h-[100lvh] flex flex-col justify-end pb-[26vh] md:landscape:pb-[30vh]">
          {/* the thread starts at the top of the frame and never breaks */}
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{ backgroundImage: STITCH_Y }}
          />
          <div className="pl-[30px]">
            <h2 id="about-heading" style={heroName}>
              Hi, I&rsquo;m Bayaraa.
            </h2>
            <p className="mt-4" style={heroLine}>
              I&rsquo;m a frontend developer who enjoys turning ideas into
              digital experiences.
            </p>
          </div>
        </div>
      </div>

      {/* B — the column. Everything in normal flow, so no block can run out of room. */}
      <div className="relative z-10 px-5 sm:px-8 md:px-10">
        <div ref={colRef} className="relative">
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{
              backgroundImage: STITCH_Y,
              clipPath: `inset(0 0 ${(1 - sewn) * 100}% 0)`,
            }}
          />

          <div className="pl-[30px] pb-[clamp(72px,12vh,140px)]">
            {/* my story — the plainest block on the page, on purpose */}
            <div className="pt-[clamp(56px,9vh,120px)]">
              <div ref={beat(0)} className="relative">
                <Knot still={still} on={tied(0)} />
                <p style={{ ...prose, maxWidth: "46ch" }}>
                  I studied Information Systems, which is mostly the study of
                  how information moves through an organisation: who enters it,
                  who needs it, where it gets stuck. Frontend was the part of
                  that I could hold in my hands. Same question, except now it is
                  one person and one screen, and you can watch them get stuck in
                  real time.
                </p>
              </div>
            </div>

            {/* what I do — four moves, one knot, so it cannot be read as a list */}
            <div className="pt-[clamp(64px,10vh,132px)]">
              <div ref={beat(1)} className="relative">
                <Knot still={still} on={tied(1)} />
                {craft.map(({ text, size, indent, measure }) => (
                  <p
                    key={text}
                    className="mt-3 first:mt-0"
                    style={{
                      fontFamily: HAND,
                      fontSize: size,
                      lineHeight: 1.25,
                      letterSpacing: "-0.01em",
                      fontWeight: 500,
                      fontVariationSettings: "'wght' 500, 'SOFT' 100, 'WONK' 0",
                      color: INK,
                      marginLeft: indent,
                      maxWidth: measure,
                    }}
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* what I've built — who is on the other end, not the roster again */}
            <div className="pt-[clamp(64px,10vh,132px)]">
              <div ref={beat(2)} className="relative">
                <Knot still={still} on={tied(2)} />
                <h3 style={heading}>
                  Five of them, and who is on the other end
                </h3>
                <p className="mt-3" style={{ ...prose, maxWidth: "52ch" }}>
                  You already scrolled past what they are. What that list leaves
                  out: <b style={name}>Yesh</b> is a student at eleven at night
                  finding out which chapter they actually do not know.{" "}
                  <b style={name}>E-Geree</b> is two people signing a contract
                  without either of them looking for a printer.{" "}
                  <b style={name}>GobiTravel</b> is somebody a long way off
                  deciding where in Mongolia to go.{" "}
                  <b style={name}>Assessment Cortexa</b> is someone seeing what
                  an assessment measured about them. And{" "}
                  <b style={name}>AquaMotion</b> has nobody on the other end
                  yet: it is still a concept, about analysing how someone swims.
                </p>
                <p className="mt-4" style={{ ...prose, maxWidth: "52ch" }}>
                  All five started the same way. Someone describes a thing that
                  does not exist, and I decide what it looks like before there
                  is anything to look at.
                </p>
              </div>
            </div>

            {/* beyond code — the one block that steps away from the thread */}
            <div className="pt-[clamp(64px,10vh,132px)]">
              <div ref={beat(3)} className="relative">
                <Knot still={still} on={tied(3)} />
                <p
                  style={{
                    ...prose,
                    maxWidth: "34ch",
                    marginLeft: "clamp(24px, 5vw, 60px)",
                  }}
                >
                  Away from the editor it is books, and English that gets a
                  little less effortful every year. Most of what I learn arrives
                  sideways: from a design I liked, a model that surprised me, or
                  something I built on a weekend that only ever had one user.
                </p>
              </div>
            </div>

            {/* currently curious — five loose ends tied to the spine, not chips */}
            <div className="pt-[clamp(64px,10vh,132px)]">
              <div ref={beat(4)} className="relative">
                <Knot still={still} on={tied(4)} />
                <h3 style={heading}>Currently curious about</h3>
                <ul className="mt-5 ml-[-30px]">
                  {curious.map(({ text, spur }) => (
                    <li
                      key={text}
                      className="flex items-center mt-[22px] first:mt-0"
                    >
                      <span
                        aria-hidden
                        className="shrink-0"
                        style={{
                          width: spur,
                          height: 2,
                          backgroundImage: STITCH_X,
                        }}
                      />
                      <span
                        aria-hidden
                        className="shrink-0"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 9999,
                          background: THREAD,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: "clamp(14.5px, 1.2vw, 17px)",
                          lineHeight: 1.3,
                          fontWeight: 500,
                          color: INK,
                          marginLeft: 12,
                        }}
                      >
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6" style={{ ...prose, maxWidth: "40ch" }}>
                  None of it is finished, which is the point.
                </p>
              </div>
            </div>

            {/* the statement, alone: the only other block that gets WONK 1 */}
            <div className="pt-[clamp(104px,18vh,220px)]">
              <div ref={beat(5)} className="relative">
                <Knot still={still} on={tied(5)} />
                <p
                  style={{
                    fontFamily: HAND,
                    fontSize: "clamp(24px, 3.4vw, 42px)",
                    lineHeight: 1.18,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    fontVariationSettings: "'wght' 500, 'SOFT' 100, 'WONK' 1",
                    color: INK,
                    maxWidth: "26ch",
                  }}
                >
                  I like taking something that exists only as an idea and
                  turning it into something you can actually click, use, and
                  experience.
                </p>
              </div>
            </div>
            {/* the last beat on the thread: the same section, scannable */}
            <div className="pt-[clamp(64px,10vh,132px)]">
              <div ref={beat(6)} className="relative">
                <Knot still={still} on={tied(6)} />
                <dl>
                  {facts.map(({ label, value, sites }) => (
                    <div
                      key={label}
                      className="mt-5 first:mt-0 sm:grid sm:grid-cols-[9.5rem_1fr] sm:gap-x-6"
                    >
                      <dt style={factLabel}>{label}</dt>
                      <dd className="mt-1 sm:mt-0" style={factValue}>
                        {value}
                        {sites?.map((site, i) => (
                          <span key={site}>
                            {i > 0 && ", "}
                            <a
                              href={`https://${site}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-[2px] [text-decoration-thickness:1.5px] hover:[text-decoration-thickness:3px]! focus-visible:[text-decoration-thickness:3px]! focus-visible:[outline:2px_solid_#7A2A20] focus-visible:[outline-offset:3px]"
                              style={{
                                color: INK,
                                textDecoration: "underline",
                                textDecorationColor: SEAM,
                                textUnderlineOffset: 4,
                              }}
                            >
                              {site}
                            </a>
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            {/* contact, still on the wall and still on the thread */}
            <div className="pt-[clamp(72px,12vh,150px)]">
              <div ref={beat(7)} className="relative">
                <Knot still={still} on={tied(7)} />
                <h3
                  style={{
                    ...heading,
                    fontSize: "clamp(24px, 3vw, 38px)",
                    fontWeight: 500,
                    fontVariationSettings: "'wght' 500, 'SOFT' 100, 'WONK' 0",
                  }}
                >
                  Have an idea?
                </h3>
                <p
                  className="mt-3"
                  style={{ ...prose, color: INK, maxWidth: "44ch" }}
                >
                  I am always interested in interesting products, creative
                  experiments, and things worth building. Tell me what it is
                  supposed to feel like, not only what it is supposed to do.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-block mt-5 rounded-[2px] [text-decoration-thickness:1.5px] hover:[text-decoration-thickness:3px]! focus-visible:[text-decoration-thickness:3px]! focus-visible:[outline:2px_solid_#7A2A20] focus-visible:[outline-offset:3px]"
                  style={{
                    fontFamily: MONO,
                    fontSize: "clamp(13.5px, 1.15vw, 16px)",
                    lineHeight: 1.4,
                    fontWeight: 400,
                    letterSpacing: "0.01em",
                    color: INK,
                    textDecoration: "underline",
                    textDecorationColor: SEAM,
                    textDecorationThickness: 1.5,
                    textUnderlineOffset: 4,
                    outlineColor: SEAM,
                  }}
                >
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* the thread ends on a knot, clear of the floor in the photograph */}
          <span
            aria-hidden
            className="absolute left-[-3px] bottom-[6px] w-2 h-2 rounded-full"
            style={{
              background: THREAD,
              transform: `scale(${sewn > 0.995 ? 1 : 0})`,
              transition: still
                ? "none"
                : "transform 160ms cubic-bezier(.34,1.56,.64,1)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
