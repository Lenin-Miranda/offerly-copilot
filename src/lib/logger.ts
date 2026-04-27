type LogContext = Record<string, unknown> | undefined;

function formatMessage(level: string, message: string, context?: LogContext) {
  if (context === undefined) {
    return [`[${level}] ${message}`];
  }

  return [`[${level}] ${message}`, context];
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(...formatMessage("INFO", message, context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(...formatMessage("WARN", message, context));
  },
  error(message: string, context?: LogContext) {
    console.error(...formatMessage("ERROR", message, context));
  },
};
