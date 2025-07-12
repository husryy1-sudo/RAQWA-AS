import QRCodeLib from 'qrcode';
import { AdvancedQRCustomization } from '../types/qr-templates';

export class QRCodeGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateQRCode(url: string, customization: AdvancedQRCustomization): Promise<string> {
    try {
      // First generate a standard QR code to get the data matrix
      const tempCanvas = document.createElement('canvas');
      await QRCodeLib.toCanvas(tempCanvas, url, {
        width: customization.size,
        margin: customization.margin,
        errorCorrectionLevel: customization.errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Set up our custom canvas
      this.canvas.width = customization.size;
      this.canvas.height = customization.size;
      
      // Fill background
      this.ctx.fillStyle = customization.colors.background;
      this.ctx.fillRect(0, 0, customization.size, customization.size);

      // Get QR data from the temporary canvas
      const tempCtx = tempCanvas.getContext('2d')!;
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Calculate module size
      const moduleCount = this.getModuleCount(imageData);
      const moduleSize = (customization.size - (customization.margin * 20)) / moduleCount;
      const startX = customization.margin * 10;
      const startY = customization.margin * 10;

      // Draw QR modules with custom pattern
      this.drawQRModules(imageData, moduleSize, startX, startY, customization, moduleCount);

      // Draw custom eye shapes
      this.drawCustomEyes(moduleSize, startX, startY, customization);

      // Add logo if present
      if (customization.logoUrl && customization.logoSize) {
        await this.addLogo(customization);
      }

      // Draw frame if selected
      this.drawFrame(customization);

      return this.canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      // Fallback to standard QR code
      return await this.generateFallbackQR(url, customization);
    }
  }

  private getModuleCount(imageData: ImageData): number {
    // Analyze the image to determine QR code size
    // Standard QR code sizes: 21x21, 25x25, 29x29, etc.
    const width = imageData.width;
    const height = imageData.height;
    
    // Find the actual QR code area (excluding margin)
    let topBorder = 0, leftBorder = 0, rightBorder = width, bottomBorder = height;
    
    // Find top border
    for (let y = 0; y < height; y++) {
      let hasBlack = false;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (imageData.data[idx] < 128) { // Black pixel
          hasBlack = true;
          break;
        }
      }
      if (hasBlack) {
        topBorder = y;
        break;
      }
    }

    // Find left border
    for (let x = 0; x < width; x++) {
      let hasBlack = false;
      for (let y = topBorder; y < height; y++) {
        const idx = (y * width + x) * 4;
        if (imageData.data[idx] < 128) { // Black pixel
          hasBlack = true;
          break;
        }
      }
      if (hasBlack) {
        leftBorder = x;
        break;
      }
    }

    // Calculate module count based on the QR code area
    const qrWidth = rightBorder - leftBorder;
    const moduleSize = qrWidth / 21; // Start with assumption of 21x21
    
    // Common QR code sizes
    const possibleSizes = [21, 25, 29, 33, 37, 41, 45, 49];
    let bestSize = 21;
    let bestDiff = Math.abs(qrWidth / 21 - Math.round(qrWidth / 21));
    
    for (const size of possibleSizes) {
      const modSize = qrWidth / size;
      const diff = Math.abs(modSize - Math.round(modSize));
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSize = size;
      }
    }
    
    return bestSize;
  }

  private drawQRModules(
    imageData: ImageData, 
    moduleSize: number, 
    startX: number, 
    startY: number, 
    customization: AdvancedQRCustomization,
    moduleCount: number
  ) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Find the actual QR data area
    const margin = Math.floor((width - (moduleCount * (width / moduleCount))) / 2);
    const actualModuleSize = (width - 2 * margin) / moduleCount;
    
    this.ctx.fillStyle = customization.colors.foreground;
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip eye areas (7x7 squares at corners)
        if (this.isEyeArea(row, col, moduleCount)) {
          continue;
        }
        
        // Sample the original QR code to see if this module should be filled
        const sampleX = Math.floor(margin + col * actualModuleSize + actualModuleSize / 2);
        const sampleY = Math.floor(margin + row * actualModuleSize + actualModuleSize / 2);
        
        if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
          const idx = (sampleY * width + sampleX) * 4;
          const isBlack = imageData.data[idx] < 128;
          
          if (isBlack) {
            const x = startX + col * moduleSize;
            const y = startY + row * moduleSize;
            this.drawModule(x, y, moduleSize, customization.pattern.type);
          }
        }
      }
    }
  }

  private isEyeArea(row: number, col: number, moduleCount: number): boolean {
    // Top-left eye
    if (row < 9 && col < 9) return true;
    // Top-right eye
    if (row < 9 && col >= moduleCount - 9) return true;
    // Bottom-left eye
    if (row >= moduleCount - 9 && col < 9) return true;
    return false;
  }

  private drawModule(x: number, y: number, size: number, patternType: string) {
    this.ctx.save();
    
    switch (patternType) {
      case 'dots':
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        break;
      case 'rounded':
        this.drawRoundedRect(x, y, size, size, size/4);
        break;
      case 'custom':
        // For custom patterns, we'll use squares but could be extended
        this.ctx.fillRect(x, y, size, size);
        break;
      default:
        this.ctx.fillRect(x, y, size, size);
    }
    
    this.ctx.restore();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawCustomEyes(
    moduleSize: number, 
    startX: number, 
    startY: number, 
    customization: AdvancedQRCustomization
  ) {
    const eyeSize = moduleSize * 7;
    const eyePositions = [
      { x: startX, y: startY }, // Top-left
      { x: startX + 18 * moduleSize, y: startY }, // Top-right
      { x: startX, y: startY + 18 * moduleSize } // Bottom-left
    ];

    eyePositions.forEach(pos => {
      this.drawEye(pos.x, pos.y, eyeSize, customization);
    });
  }

  private drawEye(x: number, y: number, size: number, customization: AdvancedQRCustomization) {
    const { eyeShape, colors } = customization;
    
    this.ctx.fillStyle = colors.eyeColor;
    
    // Draw outer eye
    this.drawEyeShape(x, y, size, eyeShape.outerShape);
    
    // Draw inner white area
    this.ctx.fillStyle = colors.background;
    const innerSize = size * 0.6;
    const innerOffset = (size - innerSize) / 2;
    this.drawEyeShape(x + innerOffset, y + innerOffset, innerSize, eyeShape.outerShape);
    
    // Draw inner eye
    this.ctx.fillStyle = colors.eyeColor;
    const centerSize = size * 0.3;
    const centerOffset = (size - centerSize) / 2;
    this.drawEyeShape(x + centerOffset, y + centerOffset, centerSize, eyeShape.innerShape);
  }

  private drawEyeShape(x: number, y: number, size: number, shape: string) {
    switch (shape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
        this.ctx.fill();
        break;
      case 'rounded-square':
        this.drawRoundedRect(x, y, size, size, size/6);
        break;
      case 'diamond':
        this.ctx.beginPath();
        this.ctx.moveTo(x + size/2, y);
        this.ctx.lineTo(x + size, y + size/2);
        this.ctx.lineTo(x + size/2, y + size);
        this.ctx.lineTo(x, y + size/2);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      default: // square
        this.ctx.fillRect(x, y, size, size);
    }
  }

  private async addLogo(customization: AdvancedQRCustomization): Promise<void> {
    if (!customization.logoUrl || !customization.logoSize) return;
    
    return new Promise((resolve, reject) => {
      const logo = new Image();
      logo.onload = () => {
        const logoSize = customization.logoSize!;
        const x = (customization.size - logoSize) / 2;
        const y = (customization.size - logoSize) / 2;
        
        // Draw logo background
        this.ctx.fillStyle = customization.colors.background;
        this.ctx.beginPath();
        this.ctx.arc(x + logoSize/2, y + logoSize/2, (logoSize/2) + 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw logo border
        this.ctx.strokeStyle = customization.colors.eyeColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw logo
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, 2 * Math.PI);
        this.ctx.clip();
        this.ctx.drawImage(logo, x, y, logoSize, logoSize);
        this.ctx.restore();
        
        resolve();
      };
      logo.onerror = reject;
      logo.src = customization.logoUrl;
    });
  }

  private drawFrame(customization: AdvancedQRCustomization) {
    if (customization.frame.type === 'none') return;
    
    this.ctx.strokeStyle = customization.colors.frameColor;
    this.ctx.lineWidth = 4;
    
    switch (customization.frame.type) {
      case 'simple':
        this.ctx.strokeRect(2, 2, customization.size - 4, customization.size - 4);
        break;
      case 'rounded':
        this.ctx.beginPath();
        this.drawRoundedRectPath(2, 2, customization.size - 4, customization.size - 4, 20);
        this.ctx.stroke();
        break;
      case 'decorative':
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(2, 2, customization.size - 4, customization.size - 4);
        this.ctx.setLineDash([]);
        break;
    }
  }

  private drawRoundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private async generateFallbackQR(url: string, customization: AdvancedQRCustomization): Promise<string> {
    // Generate a standard QR code as fallback
    return await QRCodeLib.toDataURL(url, {
      width: customization.size,
      margin: customization.margin,
      errorCorrectionLevel: customization.errorCorrectionLevel,
      color: {
        dark: customization.colors.foreground,
        light: customization.colors.background
      }
    });
  }
}