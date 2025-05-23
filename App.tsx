
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
    setActiveTab('log'); // Switch to log tab during processing

    try {
      const base64Image = await convertFileToBase64(originalImageInfo.file);
      const prompt = `
        Act as an expert "Ultra Vector Engine", a proprietary, high-fidelity pixel-to-vector tracing engine for in-house art printers.
        You have been provided with a raster image (inline data) and specific vectorization parameters.
        Your task is to provide a detailed technical log of the vectorization process you would undertake to achieve a stunning, highly detailed vector graphic suitable for professional printing.

        Image Analysis:
        - Briefly analyze the key characteristics of the input image (e.g., photographic, illustrative, high/low contrast, complexity).

        Vectorization Parameters:
        - Colors: ${config.colors} (Describe how you'll quantize colors to meet this target, aiming for perceptual accuracy.)
        - Detail Level: ${config.detailLevel} (Explain how this setting influences edge detection sensitivity, feature preservation, and small detail handling. For 'Ultra', emphasize meticulous detail capture.)
        - Smoothing: ${config.smoothing} (Describe the path smoothing algorithms you'd apply, balancing smoothness with fidelity to original shapes.)
        - Corner Style: ${config.cornerStyle} (Explain how corners will be rendered – sharp, rounded with specific radius considerations, or beveled.)
        - Noise Reduction: ${config.noiseReduction ? 'Enabled' : 'Disabled'} (If enabled, describe pre-processing steps to identify and mitigate image noise before tracing.)
        - Path Optimization: ${config.pathOptimization ? 'Enabled - Aim for minimal nodes without quality loss' : 'Disabled - Prioritize raw trace accuracy'}

        Proprietary Tracing Process Steps:
        1.  Preprocessing: (If noise reduction is on, detail it here. Mention any other initial image adjustments based on analysis.)
        2.  Color Quantization: (Elaborate on the method, e.g., K-Means, Median Cut, Octree, and how it interacts with the '${config.colors}' parameter for print quality.)
        3.  Edge Detection: (Specify sophisticated algorithms used, e.g., Canny, Sobel, or more advanced contour finding, and how '${config.detailLevel}' tunes them.)
        4.  Path Tracing: (Describe how you trace contours into raw vector paths. Mention handling of complex shapes, intersections, and holes.)
        5.  Path Simplification & Smoothing: (Explain how '${config.smoothing}' and '${config.pathOptimization}' guide this. Discuss Bezier curve fitting, removal of redundant nodes, and ensuring smooth transitions, especially for high-quality print output.)
        6.  Corner Handling: (Detail how '${config.cornerStyle}' is applied to path segments.)
        7.  Final Output Assembly: (Describe how color fills and strokes are applied, and any final checks for print readiness, e.g., minimum line weights, color profile considerations if applicable.)

        Expected Output Characteristics:
        - Describe the anticipated visual qualities of the resulting vector image (e.g., sharpness, color fidelity, detail retention) based on the settings.
        - Mention any potential challenges or trade-offs for this specific image and configuration.

        IMPORTANT: Provide this log as a plain text response. Do not output SVG code. Your response should be a narrative from the perspective of the AI engine.
      `;

      const result = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ parts: [{ inlineData: { mimeType: originalImageInfo.file.type, data: base64Image.split(',')[1] } }, { text: prompt }] }],
      });
      
      const responseText = result.text;
      setProcessingLog(responseText);
      
      const svgOutput = generatePlaceholderSvg(config, responseText, {width: originalImageInfo.width, height: originalImageInfo.height});
      setVectorizedSvgContent(svgOutput);
      setActiveTab('log');

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
  
  // Effect to clear error when image or config changes, allowing re-submission.
  useEffect(() => {
    if (originalImageInfo || config) { // Condition is illustrative, original was just setError(null)
        setError(null);
    }
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
                   <p className="text-xs text-gray-500 mt-2">Note: The downloaded SVG is a placeholder containing the engine's analysis, not a true vectorization of the image.</p>
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
