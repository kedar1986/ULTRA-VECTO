
import React, { useState, useCallback, useEffect } from 'react';
import { OriginalImageInfo, ImageTracerConfig } from './types'; // Updated
import { APP_TITLE, DEFAULT_IMAGETRACER_CONFIG, IconPhoto, IconCog, IconSparkles, IconDownload } from './constants'; // Updated
import ImageUploader from './components/ImageUploader';
import ConfigurationPanel from './components/ConfigurationPanel'; // Path should be correct
import LoadingSpinner from './components/LoadingSpinner';
import { traceImageToSvg, TraceOptions } from './utils/vectorizer';

const App: React.FC = () => {
  const [originalImageInfo, setOriginalImageInfo] = useState<OriginalImageInfo | null>(null);
  const [config, setConfig] = useState<ImageTracerConfig>(DEFAULT_IMAGETRACER_CONFIG); // Updated
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actualSvgOutput, setActualSvgOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'vectorized'>('preview');

  const handleImageUpload = useCallback((imageInfo: OriginalImageInfo) => {
    setOriginalImageInfo(imageInfo);
    setError(null);
    setActualSvgOutput(null);
    setActiveTab('preview');
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<ImageTracerConfig>) => { // Updated
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  }, []);

  const handleVectorize = useCallback(async () => {
    if (!originalImageInfo) {
      setError("Please upload an image.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setActualSvgOutput(null);

    try {
      if (!originalImageInfo?.file) { // Ensure file exists
        setError("No image file found.");
        setIsProcessing(false);
        return;
      }
      // Pass the config state to the vectorizer
      const currentTraceOptions: TraceOptions = { ...config }; 
      const svgString = await traceImageToSvg(originalImageInfo.file, currentTraceOptions);
      setActualSvgOutput(svgString);
    } catch (e: any) {
      console.error("Error during client-side vectorization:", e);
      setError(`Vectorization failed: ${e.message || 'Unknown error'}`);
      setActualSvgOutput(null); // Clear any partial output
    } finally {
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImageInfo, config]);

  const handleDownloadSvg = () => {
    if (!actualSvgOutput || !originalImageInfo) return;
    const blob = new Blob([actualSvgOutput], { type: 'image/svg+xml' });
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
                  disabled={isProcessing || !originalImageInfo}
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
              {(isProcessing || actualSvgOutput || originalImageInfo?.previewUrl) && (
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
                        onClick={() => setActiveTab('vectorized')}
                        className={`${
                          activeTab === 'vectorized'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        Vectorized Output
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
                {/* SVG Output Display */}
                {activeTab === 'vectorized' && isProcessing && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <LoadingSpinner className="w-12 h-12 mb-4" />
                    <p>Processing image...</p>
                  </div>
                )}
                {activeTab === 'vectorized' && !isProcessing && actualSvgOutput && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700/30 rounded-lg p-4">
                    <div dangerouslySetInnerHTML={{ __html: actualSvgOutput }} className="max-w-full max-h-[400px] overflow-auto bg-white rounded shadow-lg" />
                    <p className="mt-2 text-sm text-gray-400">Vectorized Output Preview</p>
                  </div>
                )}
                 {activeTab === 'vectorized' && !isProcessing && !actualSvgOutput && originalImageInfo && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-4">
                      <p className="text-lg">Click "Vectorize" to generate the SVG output.</p>
                  </div>
                )}
              </div>

              {actualSvgOutput && !isProcessing && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleDownloadSvg}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-xl transition-colors duration-150 flex items-center justify-center mx-auto"
                  >
                    <IconDownload className="w-6 h-6 mr-2" />
                    Download SVG
                  </button>
                   <p className="text-sm text-gray-400 mt-2">Note: This is a preview of the vectorized SVG. Ensure processing is complete for the final version.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gray-800 text-center p-4 text-sm text-gray-500 shadow-inner">
        <p>&copy; {new Date().getFullYear()} Ultra Vector Studio. AI-Powered Vectorization Simulation.</p>
        <p>Client-side image processing using Potrace (integration in progress).</p>
      </footer>
    </div>
  );
};

export default App;
