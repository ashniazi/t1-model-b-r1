// App.tsx
import React, { useState, useCallback, useMemo } from "react";

const generateColorName = (hex: string) => {
  const names = [
    "Sky",
    "Ocean",
    "Forest",
    "Sunset",
    "Stone",
    "Berry",
    "Cloud",
    "Dusk",
  ];
  return `${names[Math.floor(Math.random() * names.length)]}-${hex.slice(
    1,
    4
  )}`;
};

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const generateHarmoniousPalette = () => {
  const baseHue = Math.random() * 360;
  return Array(5)
    .fill(null)
    .map((_, i) => {
      const hue = (baseHue + i * 72) % 360;
      return `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
    });
};

const ColorSwatch: React.FC<{
  color: string;
  name: string;
  onNameChange: (name: string) => void;
}> = ({ color, name, onNameChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const shades = useMemo(() => {
    return Array(5)
      .fill(null)
      .map((_, i) => {
        const factor = 1 - i * 0.2;
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l * factor}%)`;
      });
  }, [color]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="relative flex-1 h-64 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full w-full" style={{ backgroundColor: color }} />
      {isHovered && (
        <div className="absolute inset-0 bg-black/70 p-4 flex flex-col justify-between text-white">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent border-b border-white w-full mb-2 text-lg"
          />
          <div className="space-y-1 text-sm">
            <p
              onClick={() => copyToClipboard(color)}
              className="cursor-pointer hover:text-gray-300"
            >
              HEX: {color}
            </p>
            <p
              onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
              className="cursor-pointer hover:text-gray-300"
            >
              RGB: {rgb.r}, {rgb.g}, {rgb.b}
            </p>
            <p
              onClick={() =>
                copyToClipboard(
                  `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(
                    hsl.l
                  )}%`
                )
              }
              className="cursor-pointer hover:text-gray-300"
            >
              HSL: {Math.round(hsl.h)}, {Math.round(hsl.s)}%,{" "}
              {Math.round(hsl.l)}%
            </p>
          </div>
          <div className="flex gap-1 mt-2">
            {shades.map((shade, i) => (
              <div
                key={i}
                className="w-8 h-8"
                style={{ backgroundColor: shade }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [palette, setPalette] = useState(() =>
    generateHarmoniousPalette().map((color) => ({
      color,
      name: generateColorName(color),
    }))
  );
  const [adjustments, setAdjustments] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
  });

  const handleGenerate = useCallback(() => {
    setPalette(
      generateHarmoniousPalette().map((color) => ({
        color,
        name: generateColorName(color),
      }))
    );
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(palette, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [palette]);

  const updateName = useCallback((index: number, name: string) => {
    setPalette((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name } : item))
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Generate New
          </button>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm">Hue</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={adjustments.hue}
                onChange={(e) =>
                  setAdjustments((prev) => ({
                    ...prev,
                    hue: Number(e.target.value),
                  }))
                }
                className="w-32"
              />
            </div>
            <div>
              <label className="block text-sm">Saturation</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) =>
                  setAdjustments((prev) => ({
                    ...prev,
                    saturation: Number(e.target.value),
                  }))
                }
                className="w-32"
              />
            </div>
            <div>
              <label className="block text-sm">Brightness</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) =>
                  setAdjustments((prev) => ({
                    ...prev,
                    brightness: Number(e.target.value),
                  }))
                }
                className="w-32"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Export JSON
        </button>
      </header>
      <main className="flex-1 flex">
        {palette.map((item, index) => (
          <ColorSwatch
            key={index}
            color={item.color}
            name={item.name}
            onNameChange={(name) => updateName(index, name)}
          />
        ))}
      </main>
    </div>
  );
};

export default App;
