/**
 * Logging service to centralize and control log output
 */

// Define log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Current log level - can be changed dynamically
let currentLogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.WARN;

/**
 * LogService to centralize logging and control verbosity
 */
export const logService = {
  /**
   * Set the global logging level
   * @param level LogLevel to set
   */
  setLogLevel(level: LogLevel): void {
    currentLogLevel = level;
  },

  /**
   * Get the current logging level
   * @returns Current LogLevel
   */
  getLogLevel(): LogLevel {
    return currentLogLevel;
  },

  /**
   * Log debug information - only shown in development
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  debug(message: any, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(message, ...optionalParams);
    }
  },

  /**
   * Log informational messages
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  info(message: any, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(message, ...optionalParams);
    }
  },

  /**
   * Log warning messages
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  warn(message: any, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(message, ...optionalParams);
    }
  },

  /**
   * Log error messages - always shown
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  error(message: any, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(message, ...optionalParams);
    }
  },
};
