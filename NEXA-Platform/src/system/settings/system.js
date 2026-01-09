export const systemSettings = {
  performance: {
    autoUpdate: true,
    updateInterval: 3600000,
    cacheEnabled: true,
    cacheSize: 100,
  },
  security: {
    requireAuth: true,
    sessionTimeout: 1800,
    enableEncryption: true,
    passwordPolicy: 'medium',
  },
  network: {
    timeout: 30000,
    retryCount: 3,
    enableProxy: false,
    proxyUrl: '',
  },
  storage: {
    autoSave: true,
    saveInterval: 30000,
    maxHistorySize: 50,
    enableBackup: true,
  },
  logging: {
    enableLogging: true,
    logLevel: 'info',
    maxLogSize: 100,
    logRetention: 7,
  },
  notifications: {
    enableNotifications: true,
    soundEnabled: true,
    desktopNotifications: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
  developer: {
    enableDevTools: false,
    showDebugInfo: false,
    enableHotReload: false,
  },
  language: {
    locale: 'ko',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
  },
  browserStorage: {
    localStorage: {
      enabled: true,
      maxSize: 10, // MB
      autoCleanup: true,
      cleanupInterval: 7, // days
      showUsage: true,
    },
    browserCache: {
      enabled: true,
      maxSize: 100, // MB
      autoCleanup: true,
      cleanupInterval: 30, // days
      showUsage: true,
    },
  },
}
