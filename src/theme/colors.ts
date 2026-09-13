
// ==================================Gemini theme ============================
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


// ==================================Gemini theme ============================



// ================================== Default theme ==============================
// export const colors = {
//   light: {
//     background: '#FFFFFF',
//     backgroundHigh: '#FFFFFF',
//     surface: '#FFFFFF',
//     surfaceStrong: '#F3F7F0',
//     border: 'rgba(14, 15, 12, 0.12)',
//     text: '#0E0F0C',
//     textMuted: '#454745',
//     primary: '#163300',
//     primarySoft: 'rgba(22, 51, 0, 0.08)',
//     primaryForeground: '#FFFFFF',
//     accent: '#9FE870',
//     accentForeground: '#163300',
//     secondary: '#163300',
//     secondarySoft: 'rgba(22, 51, 0, 0.08)',
//     secondaryForeground: '#9FE870',
//     muted: 'rgba(22, 51, 0, 0.08)',
//     mutedForeground: '#454745',
//     info: '#163300',
//     infoSoft: '#A0E1E1',
//     warning: '#3A341C',
//     warningSoft: '#FFEB69',
//     success: '#2F5711',
//     successSoft: '#DFF2D2',
//     danger: '#A8200D',
//     dangerSoft: '#F6DDD8',
//     mint: '#F3F7F0',
//     aqua: '#E9F7F7',
//     peach: '#FFF0E6',
//     lavender: '#F4EAF7',
//     lemon: '#FFF9D9',
//     ink: '#163300',
//   },
//   dark: {
//     background: '#121511',
//     backgroundHigh: '#163300',
//     surface: '#1B2118',
//     surfaceStrong: '#23301C',
//     border: 'rgba(255, 255, 255, 0.14)',
//     text: '#FFFFFF',
//     textMuted: '#D7DDD1',
//     primary: '#9FE870',
//     primarySoft: 'rgba(159, 232, 112, 0.16)',
//     primaryForeground: '#163300',
//     accent: '#9FE870',
//     accentForeground: '#163300',
//     secondary: '#FFFFFF',
//     secondarySoft: 'rgba(255, 255, 255, 0.12)',
//     secondaryForeground: '#163300',
//     muted: 'rgba(255, 255, 255, 0.10)',
//     mutedForeground: '#D7DDD1',
//     info: '#A0E1E1',
//     infoSoft: '#173334',
//     warning: '#FFEB69',
//     warningSoft: '#3A341C',
//     success: '#9FE870',
//     successSoft: '#253B18',
//     danger: '#FFC091',
//     dangerSoft: '#320707',
//     mint: '#253B18',
//     aqua: '#173334',
//     peach: '#3A2418',
//     lavender: '#260A2F',
//     lemon: '#3A341C',
//     ink: '#163300',
//   },
// } as const;
// ================================== Default theme ==============================



// ==============================Mine theme =============================================
// export const colors = {
//   light: {
//     background: '#FFFFFF',
//     backgroundHigh: '#FFFFFF',
//     surface: '#FFFFFF',
//     surfaceStrong: '#F0F6FF',
//     border: 'rgba(15, 23, 42, 0.12)',
//     text: '#0F172A',
//     textMuted: '#475569',
//     primary: '#0D47A1',
//     primarySoft: 'rgba(13, 71, 161, 0.08)',
//     primaryForeground: '#FFFFFF',
//     accent: '#29B6F6',
//     accentForeground: '#002147',
//     secondary: '#002147',
//     secondarySoft: 'rgba(0, 33, 71, 0.08)',
//     secondaryForeground: '#29B6F6',
//     muted: 'rgba(13, 71, 161, 0.08)',
//     mutedForeground: '#475569',
//     info: '#0288D1',
//     infoSoft: '#E1F5FE',
//     warning: '#ED6C02',
//     warningSoft: '#FFF4E5',
//     success: '#2E7D32',
//     successSoft: '#EDF7ED',
//     danger: '#D32F2F',
//     dangerSoft: '#FDEDED',
//     mint: '#E0F2F1',
//     aqua: '#E0F7FA',
//     peach: '#FFF3E0',
//     lavender: '#EDE7F6',
//     lemon: '#FFFDE7',
//     ink: '#0B192C',
//   },
//   dark: {
//     background: '#0B1220',
//     backgroundHigh: '#002147',
//     surface: '#111D33',
//     surfaceStrong: '#192A4A',
//     border: 'rgba(255, 255, 255, 0.14)',
//     text: '#FFFFFF',
//     textMuted: '#94A3B8',
//     primary: '#29B6F6',
//     primarySoft: 'rgba(41, 182, 246, 0.16)',
//     primaryForeground: '#002147',
//     accent: '#29B6F6',
//     accentForeground: '#002147',
//     secondary: '#FFFFFF',
//     secondarySoft: 'rgba(255, 255, 255, 0.12)',
//     secondaryForeground: '#002147',
//     muted: 'rgba(255, 255, 255, 0.10)',
//     mutedForeground: '#94A3B8',
//     info: '#4FC3F7',
//     infoSoft: '#002B49',
//     warning: '#FFB74D',
//     warningSoft: '#3E2723',
//     success: '#81C784',
//     successSoft: '#1B382B',
//     danger: '#E57373',
//     dangerSoft: '#3E1010',
//     mint: '#0A3A40',
//     aqua: '#002B49',
//     peach: '#3A2010',
//     lavender: '#1D1235',
//     lemon: '#3A3310',
//     ink: '#0B192C',
//   },
// } as const;
// ==============================Mine theme =============================================
