"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";

export function SpotlightNewDemo() {
  return (
    <div
      className="h-[32rem] md:h-[40rem] w-full rounded-md flex items-center justify-center bg-white antialiased dark:bg-black/[0.96] bg-grid-black/[0.02] dark:bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-0 md:pt-0">
        <h1
          className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
          Spotlight <br /> which is not overused.
        </h1>
        <p
          className="mt-4 font-normal text-base text-neutral-700 dark:text-neutral-300 max-w-lg text-center mx-auto">
          A subtle yet effective spotlight effect, because the previous version
          is used a bit too much these days.
        </p>
      </div>
    </div>
  );
}
