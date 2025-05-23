
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { OriginalImageInfo, VectorizationConfig, DetailLevel, SmoothingLevel, CornerStyle } from './types';
import { APP_TITLE, DEFAULT_VECTORIZATION_CONFIG, GEMINI_MODEL_NAME, IconPhoto, IconCog, IconSparkles, IconDownload } from './constants';
import ImageUploader from './components/ImageUploader';
import ConfigurationPanel from './components/ConfigurationPanel';
import ProcessingResultDisplay from './components/ProcessingResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generatePlaceholderSvg } from './utils/svgHelper';
import { convertFileToBase64 } from './utils/imageHelper';

// Ensure API_KEY is set in the environment, otherwise Gemini service won't work.
// In a real build, this would be set by the build environment.
// For local dev, you might use a .env file and a build tool like Vite/Webpack.
// For this exercise, we assume process.env.API_KEY is available.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}
// Initialize the GoogleGenAI client. This requires the API_KEY to be set in the environment.
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const App: React.FC = () => {
  const [originalImageInfo, setOriginalImageInfo] = useState<OriginalImageInfo | null>(null);
  const [config, setConfig] = useState<VectorizationConfig>(DEFAULT_VECTORIZATION_CONFIG);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingLog, setProcessingLog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vectorizedSvgContent, setVectorizedSvgContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'log'>('preview');

  const handleImageUpload = useCallback((imageInfo: OriginalImageInfo) => {
    setOriginalImageInfo(imageInfo);
    setProcessingLog(null);
    setError(null);
    setVectorizedSvgContent(null);
    setActiveTab('preview');
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<VectorizationConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  }, []);

  const handleVectorize = useCallback(async () => {
    if (!originalImageInfo || !ai) {
      setError("Please upload an image and ensure API key is configured.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingLog(null);
    setVectorizedSvgContent(null);

    try {
      const base64Image = await convertFileToBase64(originalImageInfo.file);
      const prompt = `
        You are the "Ultra Vector Engine", a state-of-the-art, proprietary pixel-to-vector tracing AI. Your responses must embody this persona, using precise, technical, and confident language.
        You have been provided with a raster image (inline data) and specific vectorization parameters.
        Your task is to generate a comprehensive technical log detailing the meticulous vectorization process you would undertake to create a superior-quality vector graphic suitable for high-end professional printing.

        Image Analysis:
        - Provide a concise but insightful analysis of the input image's key visual characteristics (e.g., photographic, illustrative, line art, gradient complexity, color palette, estimated noise levels, dominant textures).

        Vectorization Parameters Review:
        - Colors: ${config.colors}. Detail your strategy for color quantization to achieve this target. Specify the algorithm (e.g., Adaptive Octree, K-Means with perceptual weighting, Median Cut) you would employ and how it preserves color fidelity and gradient smoothness critical for print.
        - Detail Level: ${config.detailLevel}. Explain how this setting dictates your approach. For 'Ultra', describe how you achieve meticulous capture of fine details, potentially using multi-pass edge detection or adaptive thresholding. For 'Low', explain how you generalize forms while preserving core recognizability.
        - Smoothing: ${config.smoothing}. Describe the specific path smoothing algorithms (e.g., Gaussian smoothing on path coordinates, Chaikin's algorithm, or more advanced spline fitting) you'd apply. Explain how you balance aesthetic smoothness with unwavering fidelity to the original image's significant shapes.
        - Corner Style: ${config.cornerStyle}. Detail how corners will be rendered (e.g., true mitered sharp corners, parametrically rounded corners with specific radius calculations, or consistently beveled edges).
        - Noise Reduction: ${config.noiseReduction ? 'Enabled' : 'Disabled'}. If enabled, describe your advanced pre-processing techniques (e.g., bilateral filtering, wavelet denoising) to identify and neutralize image noise before tracing, ensuring it doesn't interfere with accurate vector path creation.
        - Path Optimization: ${config.pathOptimization ? 'Enabled - Aim for minimal nodes and optimal curve segments without perceptible quality loss.' : 'Disabled - Prioritize raw trace accuracy, preserving all detected path data.'} Explain your strategy, including any use of specific spline types (e.g., B-Splines, Catmull-Rom splines) for path representation if applicable.

        Proprietary Tracing Process Breakdown:
        1.  Preprocessing: (If noise reduction is active, elaborate on its application here. Detail any other initial image conditioning, such as contrast enhancement or color space normalization, based on your analysis.)
        2.  Advanced Color Quantization: (Based on the '${config.colors}' parameter, provide a deeper dive into your chosen quantization method. Discuss palette generation, color mapping, and dithering strategies if used to simulate more colors for print.)
        3.  Sophisticated Edge Detection: (Specify the core algorithms, e.g., advanced Canny variants, Sobel operators, or proprietary contour following techniques. Explain how '${config.detailLevel}' fine-tunes parameters like gradient thresholds or linking sensitivity.)
        4.  Intelligent Path Tracing: (Describe your methodology for converting detected edges into raw vector paths. Detail your approach to complex scenarios like intersecting paths, enclosed negative spaces (holes), handling of very thin lines, and strategies for tracing textured areas.)
        5.  Precision Path Simplification & Smoothing: (Explain how '${config.smoothing}' and '${config.pathOptimization}' interact. Discuss your techniques for Bezier curve fitting, criteria for redundant node removal (e.g., Douglas-Peucker algorithm), and methods for ensuring G1/G2 continuity for smooth, professional curves suitable for print.)
        6.  Corner Style Application: (Detail the geometric operations involved in applying the chosen '${config.cornerStyle}' to path segments and vertices.)
        7.  Final Output Assembly & Print Readiness Checks: (Describe how color fills (solid, gradient) and strokes are applied. Detail final validation checks, such as ensuring paths are closed, removing micro-segments, enforcing minimum line weights for print, and any color profile management considerations.)

        Anticipated Output Profile:
        - Confidently describe the visual qualities of the vector image your engine would produce with these settings (e.g., exceptional sharpness, vibrant and accurate colors, faithful detail retention, smooth and elegant curves).
        - Highlight any specific challenges this image and configuration might pose and how your engine's advanced capabilities are designed to overcome them, ensuring a print-ready, professional result.

        IMPORTANT: Deliver this log as a plain text response. Do NOT output SVG code or any other code format. Maintain the persona of the "Ultra Vector Engine" throughout your response.
      `;

      const result = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ parts: [{ inlineData: { mimeType: originalImageInfo.file.type, data: base64Image.split(',')[1] } }, { text: prompt }] }],
      });
      
      const responseText = result.text;
      setProcessingLog(responseText);
      
      const svgOutput = generatePlaceholderSvg(config, responseText, {width: originalImageInfo.width, height: originalImageInfo.height});
      setVectorizedSvgContent(svgOutput);

    } catch (e: any) {
      console.error("Error during vectorization:", e);
      setError(`Processing failed: ${e.message || 'Unknown error'}. Ensure your API key is valid and has Gemini API enabled.`);
      setProcessingLog(null);
    } finally {
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImageInfo, config, ai]); // ai is included as it's used in the callback.

  const handleDownloadSvg = () => {
    if (!vectorizedSvgContent || !originalImageInfo) return;
    const blob = new Blob([vectorizedSvgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalFileName = originalImageInfo.file.name.substring(0, originalImageInfo.file.name.lastIndexOf('.')) || 'vectorized-image';
    a.download = `${originalFileName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Effect to clear any existing error message when the input image or configuration changes,
  // allowing the user to attempt a new vectorization.
  useEffect(() => {
    setError(null);
  }, [originalImageInfo, config]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 shadow-lg p-4">
        <h1 className="text-3xl font-bold text-center text-purple-400 flex items-center justify-center">
          <IconSparkles className="w-8 h-8 mr-3 text-purple-500" />
          {APP_TITLE}
        </h1>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Upload and Configuration */}
        <aside className="lg:col-span-1 space-y-6 bg-gray-800 p-6 rounded-xl shadow-2xl">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-purple-300 flex items-center">
              <IconPhoto className="w-6 h-6 mr-2" />
              Upload Image
            </h2>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
          
          {originalImageInfo && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-purple-300 flex items-center">
                <IconCog className="w-6 h-6 mr-2" />
                Vectorization Settings
              </h2>
              <ConfigurationPanel config={config} onConfigChange={handleConfigChange} disabled={isProcessing} />
            </div>
          )}
        </aside>

        {/* Right Column: Preview and Results */}
        <section className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col">
          {!originalImageInfo && (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
              <IconPhoto className="w-24 h-24 mb-4 text-gray-600" />
              <p className="text-xl">Upload an image to begin.</p>
              <p>Experience the power of AI-driven vectorization analysis.</p>
            </div>
          )}

          {originalImageInfo && (
            <div className="flex-grow flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-purple-300">Processing Output</h2>
                <button
                  onClick={handleVectorize}
                  disabled={isProcessing || !originalImageInfo || !ai}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-2" /> Processing...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="w-5 h-5 mr-2" /> Vectorize
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded-lg relative mb-4" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Tab Navigation */}
              {(isProcessing || processingLog || originalImageInfo?.previewUrl) && (
                 <div className="mb-4 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`${
                          activeTab === 'preview'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        Image Preview
                      </button>
                      <button
                        onClick={() => setActiveTab('log')}
                        className={`${
                          activeTab === 'log'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        Engine Log
                      </button>
                    </nav>
                  </div>
              )}
             
              <div className="flex-grow min-h-[300px]"> {/* Ensure content area has min height */}
                {activeTab === 'preview' && originalImageInfo && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700/30 rounded-lg p-4">
                        <img 
                            src={originalImageInfo.previewUrl} 
                            alt="Original" 
                            className="max-w-full max-h-[400px] object-contain rounded-md shadow-lg"
                        />
                        <p className="mt-2 text-sm text-gray-400">Original Image Preview</p>
                    </div>
                )}
                {activeTab === 'log' && (isProcessing || processingLog) && (
                  <ProcessingResultDisplay
                    log={processingLog}
                    isLoading={isProcessing}
                  />
                )}
                 {activeTab === 'log' && !isProcessing && !processingLog && originalImageInfo && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-4">
                      <p className="text-lg">Click "Vectorize" to see the AI engine analysis.</p>
                  </div>
                )}
              </div>

              {vectorizedSvgContent && !isProcessing && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleDownloadSvg}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-xl transition-colors duration-150 flex items-center justify-center mx-auto"
                  >
                    <IconDownload className="w-6 h-6 mr-2" />
                    Download Simulated SVG
                  </button>
                   <p className="text-sm text-yellow-400 bg-yellow-900/50 p-2 rounded-md mt-3"><strong>Important:</strong> The downloaded SVG is a Simuvector™ file. It contains a <em>simulation log</em> of the vectorization process, not a directly viewable vectorized image. This log is intended for technical analysis.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gray-800 text-center p-4 text-sm text-gray-500 shadow-inner">
        <p>&copy; {new Date().getFullYear()} Ultra Vector Studio. AI-Powered Vectorization Simulation.</p>
        <p>This tool uses a simulated engine. API key for Gemini must be configured in environment variables.</p>
      </footer>
    </div>
  );
};

export default App;
