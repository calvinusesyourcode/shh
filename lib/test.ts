export function gradientSteps(startColor: string, endColor: string, n: number) {
    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);
    if (startRGB && endRGB) {
        const stepR = (endRGB.r - startRGB.r) / (n - 1);
        const stepG = (endRGB.g - startRGB.g) / (n - 1);
        const stepB = (endRGB.b - startRGB.b) / (n - 1);
        const colors = [];
    
        for (let i = 0; i < n; i++) {
        const newR = Math.round(startRGB.r + stepR * i);
        const newG = Math.round(startRGB.g + stepG * i);
        const newB = Math.round(startRGB.b + stepB * i);
        colors.push(rgbToHex(newR, newG, newB));
        }
        
        return colors;
    }
}
  
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
        } : null;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
