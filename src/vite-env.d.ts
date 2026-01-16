/// <reference types="vite/client" />

declare module 'qr-code-styling' {
    export type Options = any;
    export type DrawType = 'canvas' | 'svg';
    export type TypeNumber = number;
    export type Mode = 'Canvas' | 'SVG' | 'Byte' | 'Numeric' | 'Alphanumeric' | 'Kanji';
    export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
    export type DotType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
    export type CornerDotType = 'dot' | 'square';

    export default class QRCodeStyling {
        constructor(options?: any);
        append(container?: HTMLElement): void;
        update(options?: any): void;
        download(downloadOptions?: { name?: string; extension?: string }): Promise<void>;
        getRawData(extension: string): Promise<Blob | null>;
    }
}

declare module 'react-colorful';
