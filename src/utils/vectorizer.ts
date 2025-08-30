// src/utils/vectorizer.ts

import ImageTracer from 'imagetracerjs';

// Options for ImageTracerJS, based on its documentation/common usage
export interface TraceOptions {
  // Tracing
  ltres?: number; // Error threshold for straight lines. Default 1.
  qtres?: number; // Error threshold for quadratic splines. Default 1.
  pathomit?: number; // Path omit, default 8.
  colorsampling?: number; // 0: disabled, 1: random sampling, 2: deterministic sampling. Default 1.
  numberofcolors?: number; // Number of colors to use on palette if pal object is not defined. Default 16.
  mincolorratio?: number; // Min color ratio to be significant. Default 0.02.
  colorquantcycles?: number; // Color quantization will be repeated this many times. Default 3.
  
  // Layering
  layering?: number; // 0: sequential layering, 1: parallel layering. Default 0.
  
  // SVG rendering
  strokewidth?: number; // Strokewidth of the output image, default 1.
  linefilter?: boolean; // Enable or disable line filter for noise reduction. Default false.
  scale?: number; // Every coordinate will be multiplied with this, to scale the SVG. Default 1.
  roundcoords?: number; // Every coordinate will be rounded to this many digits. Default 1.
  viewbox?: boolean; // Enable or disable SVG viewbox. Default false.
  desc?: boolean; // Enable or disable SVG descriptions. Default false.
  lcpr?: number; // Default 0.
  qcpr?: number; // Default 0.

  // Blur
  blurradius?: number; // Set this to 1..5 for selective Gaussian blur. Default 0.
  blurdelta?: number; // Every color component will be rounded to this value. Default 20.
  
  // Palette (optional)
  // pal?: Array<{r: number, g: number, b: number, a: number}>;
}

export async function traceImageToSvg(
  imageFile: File,
  options: TraceOptions = {} // These are now ImageTracerJS options
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
      URL.revokeObjectURL(imageUrl);

      try {
        // Use ImageTracerJS to get SVG string.
        // The options object is passed directly.
        // Ensure that the options passed from App.tsx are compatible with ImageTracerJS options.
        const svgString = ImageTracer.imageDataToSVGString(imageData, options as ImageTracer.TracerOptions);
        
        console.log("ImageTracerJS options received:", options);
        console.log("Image dimensions for ImageTracerJS:", imageData.width, "x", imageData.height);
        resolve(svgString);

      } catch (error) {
        console.error("Error during ImageTracerJS processing:", error);
        reject(new Error(`Failed to trace image with ImageTracerJS: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image file.'));
    };

    image.src = imageUrl;
  });
}

// Example of how this function might be called (for testing purposes):
/*
async function testTrace() {
  // This test needs a File object, which is harder to mock in Node.js.
  // It's better to test this by running the app in a browser.
  // Example:
  // const fileInput = document.createElement('input');
  // fileInput.type = 'file';
  // fileInput.onchange = async (e) => {
  //   const file = (e.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     try {
  //       console.log("Starting dummy trace with file:", file.name);
  //       const svgResult = await traceImageToSvg(file, { turdSize: 2 });
  //       console.log("Dummy SVG Result:", svgResult);
  //     } catch (err) {
  //       console.error("Dummy Trace Test Failed:", err);
  //     }
  //   }
  // };
  // fileInput.click(); 
}

// testTrace(); // Uncomment to run a test in a browser environment
*/
