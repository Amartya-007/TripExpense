export const colors = {
  light: {
    // Canvas & Surfaces (Soft slate-white base)
    background: '#F8FAFC',
    backgroundHigh: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceStrong: '#F1F5F9',
    border: 'rgba(15, 23, 42, 0.08)',

    // Typography (Zinc-tinted high legibility)
    text: '#0F172A',
    textMuted: '#64748B',

    // Primary Action (Modern Indigo)
    primary: '#6366F1',
    primarySoft: 'rgba(99, 102, 241, 0.10)',
    primaryForeground: '#FFFFFF',

    // Accent (Cyan / Sky)
    accent: '#0EA5E9',
    accentForeground: '#FFFFFF',

    // Secondary Action (Deep Slate)
    secondary: '#1E293B',
    secondarySoft: 'rgba(30, 41, 59, 0.06)',
    secondaryForeground: '#FFFFFF',

    // Muted & Utility Tokens
    muted: 'rgba(99, 102, 241, 0.06)',
    mutedForeground: '#64748B',

    // Feedback States
    info: '#0284C7',
    infoSoft: '#E0F2FE',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    success: '#10B981',
    successSoft: '#D1FAE5',
    danger: '#EF4444',
    dangerSoft: '#FEE2E2',

    // Decorative Tints
    mint: '#ECFDF5',
    aqua: '#E0F2FE',
    peach: '#FFEDD5',
    lavender: '#F5F3FF',
    lemon: '#FEF9C3',
    ink: '#0F172A',
  },
  dark: {
    // Canvas & Surfaces (Deep Zinc / Slate near-black)
    background: '#090D16',
    backgroundHigh: '#0F172A',
    surface: '#131C2E',
    surfaceStrong: '#1E293B',
    border: 'rgba(255, 255, 255, 0.08)',

    // Typography (Off-white & slate muted)
    text: '#F8FAFC',
    textMuted: '#94A3B8',

    // Primary Action (Bright Indigo for dark ground)
    primary: '#818CF8',
    primarySoft: 'rgba(129, 140, 248, 0.16)',
    primaryForeground: '#090D16',

    // Accent (Electric Cyan)
    accent: '#38BDF8',
    accentForeground: '#090D16',

    // Secondary Action (Soft Slate Surface)
    secondary: '#334155',
    secondarySoft: 'rgba(255, 255, 255, 0.08)',
    secondaryForeground: '#F8FAFC',

    // Muted & Utility Tokens
    muted: 'rgba(255, 255, 255, 0.06)',
    mutedForeground: '#94A3B8',

    // Feedback States (Desaturated for dark mode to prevent visual strain)
    info: '#38BDF8',
    infoSoft: '#0C4A6E',
    warning: '#FBBF24',
    warningSoft: '#451A03',
    success: '#34D399',
    successSoft: '#064E3B',
    danger: '#F87171',
    dangerSoft: '#451212',

    // Decorative Tints
    mint: '#064E3B',
    aqua: '#0C4A6E',
    peach: '#451A03',
    lavender: '#2E1065',
    lemon: '#422006',
    ink: '#F8FAFC',
  },
} as const;
