
export enum DetailLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Ultra = "Ultra"
}

export enum SmoothingLevel {
  None = "None",
  Light = "Light",
  Medium = "Medium",
  Strong = "Strong"
}

export enum CornerStyle {
  Sharp = "Sharp",
  Rounded = "Rounded",
  Beveled = "Beveled"
}

export interface VectorizationConfig {
  colors: number;
  detailLevel: DetailLevel;
  smoothing: SmoothingLevel;
  cornerStyle: CornerStyle;
  noiseReduction: boolean;
  pathOptimization: boolean;
}

export interface OriginalImageInfo {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}
    