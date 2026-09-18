export const colors = {
  light: {
    // Canvas & Surfaces
    background: '#F8FAFC',
    backgroundHigh: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceStrong: '#F1F5F9',
    border: '#E2E8F0',

    // Typography
    text: '#0F172A',
    textMuted: '#64748B',

    // Primary Action
    primary: '#2563EB',
    primarySoft: '#EFF6FF',
    primaryForeground: '#FFFFFF',

    // Accent
    accent: '#3B82F6',
    accentForeground: '#FFFFFF',

    // Secondary Action
    secondary: '#1E293B',
    secondarySoft: 'rgba(30, 41, 59, 0.06)',
    secondaryForeground: '#FFFFFF',

    // Muted & Utility
    muted: 'rgba(37, 99, 235, 0.06)',
    mutedForeground: '#64748B',

    // Feedback States
    info: '#0284C7',
    infoSoft: '#E0F2FE',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    success: '#059669',
    successSoft: '#D1FAE5',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',

    // Decorative Tints
    mint: '#ECFDF5',
    aqua: '#F0F9FF',
    peach: '#FFF7ED',
    lavender: '#EEF2FF',
    lemon: '#FEFCE8',
    ink: '#0F172A',
  },

  dark: {
    // Canvas & Surfaces
    background: '#080B12',
    backgroundHigh: '#0F172A',
    surface: '#111827',
    surfaceStrong: '#1E293B',
    border: 'rgba(255, 255, 255, 0.08)',

    // Typography
    text: '#F8FAFC',
    textMuted: '#94A3B8',

    // Primary Action
    primary: '#3B82F6',
    primarySoft: 'rgba(59, 130, 246, 0.16)',
    primaryForeground: '#FFFFFF',

    // Accent
    accent: '#60A5FA',
    accentForeground: '#FFFFFF',

    // Secondary Action
    secondary: '#334155',
    secondarySoft: 'rgba(255, 255, 255, 0.08)',
    secondaryForeground: '#F8FAFC',

    // Muted & Utility
    muted: 'rgba(255, 255, 255, 0.06)',
    mutedForeground: '#94A3B8',

    // Feedback States
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