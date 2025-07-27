"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [text, setText] = useState('Sample Text');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(100);
  const [fontSize, setFontSize] = useState(48);
  const [backgroundColor, setBackgroundColor] = useState('#8d4170');
  const [selectedColorOption, setSelectedColorOption] = useState('visit');
  const [customColor, setCustomColor] = useState('#8d4170');
  // Separate display values for text inputs to allow temporary invalid states
  const [widthInput, setWidthInput] = useState('400');
  const [heightInput, setHeightInput] = useState('100');
  const [fontSizeInput, setFontSizeInput] = useState('48');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colorOptions = [
    { id: 'visit', name: 'Visit', color: '#8d4170' },
    { id: 'whisper', name: 'Whisper', color: '#2d6b8a' },
    { id: 'emote', name: 'Emote', color: '#ff7f50' }, // orangeish color
    { id: 'system', name: 'System', color: '#b7b664' },
    { id: 'custom', name: 'Custom', color: customColor }
  ];

  useEffect(() => {
    // Wait for fonts to load
    const loadFonts = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.ready;
          setFontsLoaded(true);
        } else {
          // Fallback for browsers without document.fonts
          setTimeout(() => setFontsLoaded(true), 1000);
        }
      } catch (error) {
        console.log('Font loading error:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };
    loadFonts();
  }, []);

  const generateImage = () => {
    if (!text.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure reasonable canvas size limits to prevent browser issues
    const actualWidth = Math.min(width, 4096); // Browser canvas limit
    const actualHeight = Math.min(height, 4096);

    // Set canvas size
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    // Define border radius
    const borderRadius = 15;

    // Fill entire canvas with border color first (for the corners)
    ctx.fillStyle = '#090407'; // Same as border color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the main rounded rectangle with background color
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.roundRect(1.5, 1.5, canvas.width - 3, canvas.height - 3, borderRadius);
    ctx.fill();

    // Add rounded rectangle border
    ctx.strokeStyle = '#090407'; // Dark border color
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(1.5, 1.5, canvas.width - 3, canvas.height - 3, borderRadius);
    ctx.stroke();

    // Set font and text properties
    ctx.font = `${fontSize}px "ImpressBT", Arial, sans-serif`;
    ctx.fillStyle = '#090407'; // Dark purple/black text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate text area with padding (4px left/right, 8px top/bottom)
    const paddingX = 4;
    const paddingY = 8;
    const textAreaWidth = canvas.width - (paddingX * 2);
    const textAreaHeight = canvas.height - (paddingY * 2);

    // Function to wrap text
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Split text by manual line breaks first, then wrap each line
    const manualLines = text.split('\n');
    const allLines: string[] = [];
    
    manualLines.forEach(line => {
      const wrappedLines = wrapText(line.trim(), textAreaWidth);
      allLines.push(...wrappedLines);
    });

    const lineHeight = fontSize * 1.2; // 1.2x line height for better spacing
    const totalTextHeight = allLines.length * lineHeight;
    
    const startY = paddingY + (textAreaHeight - totalTextHeight) / 2 + lineHeight / 2;

    // Draw each line
    allLines.forEach((line, index) => {
      const yPosition = startY + (index * lineHeight);
      ctx.fillText(line, canvas.width / 2, yPosition);
    });

    // Convert to data URL
    setImageDataUrl(canvas.toDataURL());
  };

  // Auto-generate image when text, width, height, fontSize, or backgroundColor changes
  useEffect(() => {
    if (fontsLoaded) {
      generateImage();
    }
  }, [text, width, height, fontSize, backgroundColor, fontsLoaded]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          TTR Text Generator
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your text (use Enter for line breaks):
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something... Use Enter for new lines"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="width-input" className="block text-sm font-medium text-gray-700 mb-2">
                Width (px):
              </label>
              <input
                id="width-input"
                type="text"
                value={widthInput}
                onChange={(e) => {
                  setWidthInput(e.target.value);
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 100 && value <= 4096) {
                    setWidth(value);
                  }
                }}
                onBlur={() => {
                  const value = parseInt(widthInput) || 400;
                  const clampedValue = Math.max(100, Math.min(4096, value));
                  setWidth(clampedValue);
                  setWidthInput(clampedValue.toString());
                }}
                placeholder="400"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="height-input" className="block text-sm font-medium text-gray-700 mb-2">
                Height (px):
              </label>
              <input
                id="height-input"
                type="text"
                value={heightInput}
                onChange={(e) => {
                  setHeightInput(e.target.value);
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 100 && value <= 4096) {
                    setHeight(value);
                  }
                }}
                onBlur={() => {
                  const value = parseInt(heightInput) || 100;
                  const clampedValue = Math.max(100, Math.min(4096, value));
                  setHeight(clampedValue);
                  setHeightInput(clampedValue.toString());
                }}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="font-size-input" className="block text-sm font-medium text-gray-700 mb-2">
                Font Size (px):
              </label>
              <input
                id="font-size-input"
                type="text"
                value={fontSizeInput}
                onChange={(e) => {
                  setFontSizeInput(e.target.value);
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 12 && value <= 200) {
                    setFontSize(value);
                  }
                }}
                onBlur={() => {
                  const value = parseInt(fontSizeInput) || 48;
                  const clampedValue = Math.max(12, Math.min(200, value));
                  setFontSize(clampedValue);
                  setFontSizeInput(clampedValue.toString());
                }}
                placeholder="48"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Sliders for width, height, and font size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <input
                type="range"
                min="100"
                max="4096"
                value={width}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setWidth(value);
                  setWidthInput(value.toString());
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <input
                type="range"
                min="100"
                max="4096"
                value={height}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setHeight(value);
                  setHeightInput(value.toString());
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <input
                type="range"
                min="12"
                max="200"
                value={fontSize}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFontSize(value);
                  setFontSizeInput(value.toString());
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Color palette selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background Color:
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {colorOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <button
                    onClick={() => {
                      setSelectedColorOption(option.id);
                      if (option.id !== 'custom') {
                        setBackgroundColor(option.color);
                      } else {
                        setBackgroundColor(customColor);
                      }
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColorOption === option.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  />
                  <span className="ml-2 text-sm text-gray-600">{option.name}</span>
                </div>
              ))}
            </div>
            
            {selectedColorOption === 'custom' && (
              <div className="mt-3">
                <label htmlFor="custom-color" className="block text-xs text-gray-500 mb-1">
                  Custom hex color:
                </label>
                <input
                  id="custom-color"
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBackgroundColor(e.target.value);
                  }}
                  placeholder="#8d4170"
                  className="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          <button
            onClick={generateImage}
            disabled={!text.trim() || !fontsLoaded}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {fontsLoaded ? 'Regenerate Image' : 'Loading fonts...'}
          </button>
        </div>

        {imageDataUrl && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview:</h2>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={imageDataUrl}
                alt="Generated text image"
                className="max-w-full h-auto rounded-lg border-2 border-gray-300 mx-auto"
              />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
