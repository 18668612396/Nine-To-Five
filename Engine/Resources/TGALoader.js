class TGALoader {
    constructor() {
    }

    parse(buffer) {
        const data = new DataView(buffer);
        const idLength = data.getUint8(0);
        const colorMapType = data.getUint8(1);
        const imageType = data.getUint8(2);
        
        // 3-7: Color Map Spec (ignored for now)
        
        // 8-17: Image Spec
        const xOrigin = data.getUint16(8, true);
        const yOrigin = data.getUint16(10, true);
        const width = data.getUint16(12, true);
        const height = data.getUint16(14, true);
        const pixelDepth = data.getUint8(16);
        const imageDesc = data.getUint8(17);
        
        let offset = 18 + idLength;
        if (colorMapType === 1) {
            // Skip color map
            const colorMapLength = data.getUint16(5, true);
            const colorMapDepth = data.getUint8(7);
            offset += colorMapLength * (colorMapDepth / 8);
        }

        const pixelCount = width * height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        const pixelData = imageData.data;

        // Check for RLE
        const isRLE = (imageType === 10);
        const isRGB = (imageType === 2 || imageType === 10);
        const isGrayscale = (imageType === 3 || imageType === 11); // Not implementing grayscale yet

        if (!isRGB && !isGrayscale) {
            console.error("TGALoader: Unsupported image type " + imageType);
            return canvas;
        }

        const bytesPerPixel = pixelDepth / 8;
        if (bytesPerPixel !== 3 && bytesPerPixel !== 4) {
             console.error("TGALoader: Unsupported pixel depth " + pixelDepth);
             return canvas;
        }

        let i = 0; // Pixel index
        const uint8Array = new Uint8Array(buffer);
        
        while (i < pixelCount && offset < buffer.byteLength) {
            let chunkHeader = isRLE ? uint8Array[offset++] : 127; // If not RLE, treat as raw packet of max length? No.
            // Wait, if not RLE (Type 2), it's just raw pixels.
            
            if (!isRLE) {
                // Raw pixels for the whole image
                // We can just loop
                chunkHeader = 127; // Treat as raw packet of 128 pixels (loop logic below handles it)
                // Actually, for Type 2, we don't read chunk headers.
                // We just read pixels.
            }

            if (isRLE) {
                const isRaw = (chunkHeader & 0x80) === 0;
                const count = (chunkHeader & 0x7f) + 1;
                
                if (isRaw) {
                    // Raw packet
                    for (let c = 0; c < count; c++) {
                        this.setPixel(pixelData, i, uint8Array, offset, bytesPerPixel);
                        offset += bytesPerPixel;
                        i++;
                    }
                } else {
                    // RLE packet
                    const r = uint8Array[offset + 2];
                    const g = uint8Array[offset + 1];
                    const b = uint8Array[offset + 0];
                    const a = bytesPerPixel === 4 ? uint8Array[offset + 3] : 255;
                    offset += bytesPerPixel;
                    
                    for (let c = 0; c < count; c++) {
                        const idx = i * 4;
                        pixelData[idx] = r;
                        pixelData[idx+1] = g;
                        pixelData[idx+2] = b;
                        pixelData[idx+3] = a;
                        i++;
                    }
                }
            } else {
                // Uncompressed
                // Just read one pixel
                this.setPixel(pixelData, i, uint8Array, offset, bytesPerPixel);
                offset += bytesPerPixel;
                i++;
            }
        }

        // Handle Flip
        // Bit 5 of Image Descriptor: 0 = Bottom-Left, 1 = Top-Left
        const isTopLeft = (imageDesc & 0x20) !== 0;
        
        if (!isTopLeft) {
            // Flip Y
            // We can do this by drawing to canvas with scale(1, -1) or flipping imageData
            // Let's flip imageData manually
            const stride = width * 4;
            const tempRow = new Uint8Array(stride);
            for (let y = 0; y < height / 2; y++) {
                const topRowIdx = y * stride;
                const botRowIdx = (height - 1 - y) * stride;
                
                // Copy top to temp
                tempRow.set(pixelData.subarray(topRowIdx, topRowIdx + stride));
                // Copy bot to top
                pixelData.set(pixelData.subarray(botRowIdx, botRowIdx + stride), topRowIdx);
                // Copy temp to bot
                pixelData.set(tempRow, botRowIdx);
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    setPixel(targetData, pixelIndex, sourceData, sourceOffset, bpp) {
        const idx = pixelIndex * 4;
        // TGA is BGR(A)
        targetData[idx] = sourceData[sourceOffset + 2];     // R
        targetData[idx+1] = sourceData[sourceOffset + 1];   // G
        targetData[idx+2] = sourceData[sourceOffset + 0];   // B
        targetData[idx+3] = bpp === 4 ? sourceData[sourceOffset + 3] : 255; // A
    }
}

window.TGALoader = new TGALoader();
