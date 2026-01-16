import { QRCode, QRCustomization } from '../types';
import QRCodeStyling, {
    DrawType,
    TypeNumber,
    Mode,
    ErrorCorrectionLevel,
    DotType,
    CornerSquareType,
    CornerDotType,
    Options
} from 'qr-code-styling';

export const generateQRCodeImage = async (
    content: string,
    customization?: QRCustomization
): Promise<string> => {
    try {
        const custom = customization || {
            size: 200,
            margin: 2,
            backgroundColor: '#FFFFFF',
            foregroundColor: '#000000',
            dotsOptions: { type: 'square', color: '#000000' },
            backgroundOptions: { color: '#FFFFFF' },
            cornersSquareOptions: { type: 'square', color: '#000000' },
            cornersDotOptions: { type: 'square', color: '#000000' },
            imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5 }
        };

        const options: Options = {
            width: custom.size || 200,
            height: custom.size || 200,
            type: 'canvas',
            data: content,
            margin: custom.margin || 0,
            dotsOptions: {
                color: custom.dotsOptions?.color || custom.foregroundColor || '#000000',
                type: (custom.dotsOptions?.type as DotType) || 'square',
                gradient: custom.dotsOptions?.gradient
            },
            backgroundOptions: {
                color: custom.backgroundOptions?.color || custom.backgroundColor || '#FFFFFF',
                gradient: custom.backgroundOptions?.gradient
            },
            cornersSquareOptions: {
                color: custom.cornersSquareOptions?.color || custom.foregroundColor || '#000000',
                type: (custom.cornersSquareOptions?.type as CornerSquareType) || 'square'
            },
            cornersDotOptions: {
                color: custom.cornersDotOptions?.color || custom.foregroundColor || '#000000',
                type: (custom.cornersDotOptions?.type as CornerDotType) || 'square'
            },
            image: custom.logoUrl,
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: custom.imageOptions?.margin || 0,
                imageSize: custom.imageOptions?.imageSize || 0.4,
                hideBackgroundDots: custom.imageOptions?.hideBackgroundDots ?? true
            }
        };

        const qrCode = new QRCodeStyling(options);
        const blob = await qrCode.getRawData('png');

        if (!blob) return '';

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error('Failed to generate QR code:', error);
        return '';
    }
};

export const downloadQRCode = async (qr: QRCode, customization?: QRCustomization) => {
    try {
        const qrUrl = `${window.location.origin}/qr/${qr.shortCode}`;
        const dataUrl = await generateQRCodeImage(qrUrl, customization || qr.customization);
        const link = document.createElement('a');
        link.download = `qr-${qr.shortCode}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Failed to download QR code:', error);
    }
};
