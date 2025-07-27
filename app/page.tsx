"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from 'react';

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
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  // Separate display values for text inputs to allow temporary invalid states
  const [widthInput, setWidthInput] = useState('400');
  const [heightInput, setHeightInput] = useState('100');
  const [fontSizeInput, setFontSizeInput] = useState('48');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colorOptions = [
    { id: 'visit', name: 'Visit', color: '#8d4170' },
    { id: 'whisper', name: 'Whisper', color: '#2d6b8a' },
    { id: 'emote', name: 'Emote', color: '#a66528' },
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

  const generateImage = useCallback(() => {
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
  }, [text, width, height, fontSize, backgroundColor]);

  // Auto-generate image when text, width, height, fontSize, or backgroundColor changes
  useEffect(() => {
    if (fontsLoaded) {
      generateImage();
    }
  }, [fontsLoaded, generateImage]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            TTR Text Generator
          </h1>
          
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md space-y-4 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div>
            <label htmlFor="text-input" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Enter your text (use Enter for line breaks):
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something... Use Enter for new lines"
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="width-input" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="height-input" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="font-size-input" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
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
            <label className={`block text-sm font-medium mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
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
                        : `border-gray-300 hover:border-gray-400 ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : ''}`
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  />
                  <span className={`ml-2 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{option.name}</span>
                </div>
              ))}
            </div>
            
            {selectedColorOption === 'custom' && (
              <div className="mt-3">
                <label htmlFor="custom-color" className={`block text-xs mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
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
                  className={`w-32 px-3 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
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
          <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Preview:</h2>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              💡 <strong>To save:</strong> Right-click the image below and select &quot;Save image as...&quot;
            </p>
            <div className={`border rounded-lg p-4 transition-colors duration-300 ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
            }`}>
              <Image
                src={imageDataUrl}
                alt="Generated text image"
                width={width}
                height={height}
                className="max-w-full h-auto rounded-lg border-2 border-gray-300 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                title="Right-click to save image"
                unoptimized
              />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Footer */}
        <footer className="text-center py-4">
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            made by Aton &gt;:)
          </p>
        </footer>
      </div>
    </div>
  );
}
