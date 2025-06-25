import { ChartCaptureOptions } from '@/types/pdfReport';

/**
 * Captures the heart rate chart as a base64 image using the same method as the working exportChart function
 */
export const captureChartAsImage = async (
  chartSelector: string = '.recharts-wrapper svg',
  options: Partial<ChartCaptureOptions> = {}
): Promise<string | null> => {
  const defaultOptions: ChartCaptureOptions = {
    backgroundColor: 'white',
    scale: 2, // High DPI for print quality
    quality: 0.95,
    format: 'png'
  };

  const config = { ...defaultOptions, ...options };

  return new Promise((resolve) => {
    try {
      const svgElement = document.querySelector(chartSelector);
      if (!svgElement) {
        console.error('Chart not available for capture');
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = function () {
        // Set canvas size with high DPI scaling
        canvas.width = img.width * config.scale;
        canvas.height = img.height * config.scale;
        
        // Scale the context
        ctx.scale(config.scale, config.scale);
        
        // Fill with background color
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, img.width, img.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL(`image/${config.format}`, config.quality);
        
        // Clean up
        URL.revokeObjectURL(svgUrl);
        
        resolve(imageData);
      };

      img.onerror = function () {
        console.error('Failed to load SVG for capture');
        URL.revokeObjectURL(svgUrl);
        resolve(null);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error('Error capturing chart:', error);
      resolve(null);
    }
  });
};

/**
 * Waits for chart to fully render before capturing
 */
export const captureChartWhenReady = async (
  chartSelector: string = '.recharts-wrapper svg',
  options: Partial<ChartCaptureOptions> = {},
  maxWaitTime: number = 3000
): Promise<string | null> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkAndCapture = async () => {
      const svgElement = document.querySelector(chartSelector);
      
      // Check if chart is ready - SVG exists and has content
      const isReady = svgElement && 
                     (svgElement.querySelector('path') || svgElement.querySelector('line')) && // Chart lines
                     svgElement.querySelector('g'); // Chart groups/structure

      if (isReady) {
        const image = await captureChartAsImage(chartSelector, options);
        resolve(image);
      } else if (Date.now() - startTime < maxWaitTime) {
        // Chart not ready, wait a bit longer
        setTimeout(checkAndCapture, 100);
      } else {
        // Timeout - capture anyway
        console.warn('Chart capture timeout, capturing current state');
        const image = await captureChartAsImage(chartSelector, options);
        resolve(image);
      }
    };

    checkAndCapture();
  });
};