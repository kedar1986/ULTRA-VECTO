
export interface ImageTracerConfig {
  // Tracing
  ltres?: number;
  qtres?: number;
  pathomit?: number;
  colorsampling?: number;
  numberofcolors?: number;
  mincolorratio?: number;
  colorquantcycles?: number;
  // Layering
  layering?: number;
  // SVG rendering
  strokewidth?: number;
  linefilter?: boolean;
  scale?: number;
  roundcoords?: number;
  viewbox?: boolean;
  desc?: boolean;
  lcpr?: number;
  qcpr?: number;
  // Blur
  blurradius?: number;
  blurdelta?: number;
}

export interface OriginalImageInfo {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}
    