import React from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAppStore } from '../../stores/useAppStore';

export const BackgroundLayer: React.FC = () => {
  const mode = useAppStore((state) => state.mode);
  const getActiveTheme = useThemeStore((state) => state.getActiveTheme);
  const customBackground = useThemeStore((state) => state.customBackground);

  const theme = getActiveTheme(mode);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Clean, Calm Minimal Dark Canvas */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #151324 0%, #09090b 100%)',
        }}
      />

      {/* 2. Custom Background (image or video from user upload/assets) */}
      {customBackground?.url && (
        <div
          className="absolute inset-0 w-full h-full transition-all duration-700 bg-cover bg-center"
          style={{
            backgroundImage: customBackground.type === 'image' ? `url(${customBackground.url})` : undefined,
            filter: `brightness(${customBackground.brightness || 1}) contrast(${customBackground.contrast || 1}) blur(${customBackground.blur || 0}px)`,
          }}
        >
          {customBackground.type === 'video' && (
            <video
              src={customBackground.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* 3. Preset Theme Gradient (if selected and no custom image/video active) */}
      {!customBackground?.url && theme?.type === 'gradient' && theme?.gradient && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-700 opacity-60"
          style={{ background: theme.gradient }}
        />
      )}

      {/* 4. Subtle Vignette Scrim for Text Readability */}
      <div
        className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/70 via-black/25 to-black/50 pointer-events-none"
        style={{
          opacity: customBackground ? customBackground.overlayOpacity : 0.35,
        }}
      />
    </div>
  );
};
