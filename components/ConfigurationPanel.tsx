import React from 'react';
import { ImageTracerConfig } from '../types'; // Adjusted import path
import { COLOR_OPTIONS } from '../constants'; // Adjusted import path

interface ConfigurationPanelProps {
  config: ImageTracerConfig;
  onConfigChange: (newConfig: Partial<ImageTracerConfig>) => void;
  disabled: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, onConfigChange, disabled }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number' || type === 'range') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        // Handle case where parseFloat results in NaN, maybe set to 0 or keep current value
         processedValue = event.target.defaultValue !== "" ? parseFloat(event.target.defaultValue) : 0;
      }
    }
    onConfigChange({ [name]: processedValue });
  };
  
  // Helper to create a number input field
  const NumberInput: React.FC<{name: keyof ImageTracerConfig, label: string, min?: number, max?: number, step?: number}> = ({ name, label, min, max, step }) => (
    <div className="mb-3">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}:</label>
      <input
        type="number"
        id={name}
        name={name}
        value={config[name] as number ?? ''}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-100"
      />
    </div>
  );

  // Helper to create a checkbox input field
  const CheckboxInput: React.FC<{name: keyof ImageTracerConfig, label: string}> = ({ name, label }) => (
    <div className="mb-3 flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={config[name] as boolean ?? false}
        onChange={handleInputChange}
        disabled={disabled}
        className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-300">{label}</label>
    </div>
  );
  
  return (
    <div className="space-y-4 p-1">
      <NumberInput name="ltres" label="Line Threshold (ltres)" min={0} step={0.1} />
      <NumberInput name="qtres" label="Quadratic Threshold (qtres)" min={0} step={0.1} />
      <NumberInput name="pathomit" label="Path Omit" min={0} step={1} />
      
      <div className="mb-3">
        <label htmlFor="numberofcolors" className="block text-sm font-medium text-gray-300 mb-1">Number of Colors:</label>
        <select
          id="numberofcolors"
          name="numberofcolors"
          value={config.numberofcolors ?? 16}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-100"
        >
          {COLOR_OPTIONS.map(num => <option key={num} value={num}>{num}</option>)}
          <option value="256">256 (custom)</option> {/* Allow more if needed */}
        </select>
      </div>

      <NumberInput name="strokewidth" label="Stroke Width" min={0} step={0.5} />
      <NumberInput name="blurradius" label="Blur Radius (0-5)" min={0} max={5} step={1} />
      <CheckboxInput name="linefilter" label="Enable Line Filter" />
      <CheckboxInput name="viewbox" label="Enable SVG ViewBox" />

      {/* Add more controls as needed for other ImageTracerConfig options */}
      {/* e.g., colorsampling, mincolorratio, colorquantcycles, scale, roundcoords etc. */}
      <p className="text-xs text-gray-500">More options can be added here.</p>
    </div>
  );
};

export default ConfigurationPanel;
