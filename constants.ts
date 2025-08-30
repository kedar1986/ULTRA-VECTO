
// Fix: SVG icon components converted to React.createElement calls.
// This is to avoid JSX parsing errors when these components are in a .ts file
// and the TypeScript environment may not be configured to process JSX in .ts files directly.
// This change ensures compatibility without needing to rename the file to .tsx or alter tsconfig.json.
import React from 'react';
import { ImageTracerConfig } from './types'; // Updated import

export const APP_TITLE = "Ultra Vector Studio";
// GEMINI_MODEL_NAME is no longer used, can be removed if not needed elsewhere.
// export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17"; 

export const DEFAULT_IMAGETRACER_CONFIG: ImageTracerConfig = {
  // Tracing
  ltres: 1,
  qtres: 1,
  pathomit: 8,
  colorsampling: 1, // 0: disabled, 1: random sampling, 2: deterministic sampling
  numberofcolors: 16,
  mincolorratio: 0.02,
  colorquantcycles: 3,
  // Layering
  layering: 0, // 0: sequential layering, 1: parallel layering
  // SVG rendering
  strokewidth: 1,
  linefilter: false,
  scale: 1,
  roundcoords: 1,
  viewbox: false,
  desc: false,
  lcpr: 0,
  qcpr: 0,
  // Blur
  blurradius: 0,
  blurdelta: 20,
};

export const COLOR_OPTIONS = [2, 4, 8, 16, 32, 64, 128, 256];

// Fix: Converted to React.createElement to resolve JSX parsing issues.
export const IconPhoto = (props: React.SVGProps<SVGSVGElement>) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    })
  )
);

// Fix: Converted to React.createElement to resolve JSX parsing issues.
export const IconCog = (props: React.SVGProps<SVGSVGElement>) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5-.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 0h.008v.008h-.008V12Zm-2.25-3a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 6.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 0h.008v.008h-.008v-.008Zm2.25 3a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0-12.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 0h.008v.008h-.008V4.5Zm-5.625 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 12.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 0h.008v.008h-.008v-.008Zm5.625 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0-12.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    })
  )
);

// Fix: Converted to React.createElement to resolve JSX parsing issues.
export const IconSparkles = (props: React.SVGProps<SVGSVGElement>) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L21 5.25l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L14.25 12l2.846.813a4.5 4.5 0 0 0 3.09 3.09L21 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09Z"
    })
  )
);

// Fix: Converted to React.createElement to resolve JSX parsing issues.
export const IconDownload = (props: React.SVGProps<SVGSVGElement>) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
    })
  )
);
