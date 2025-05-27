type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message), data || '')
    }
  }

  warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message), data || '')
    }
  }

  error(message: string, error?: any) {
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message), error || '')
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), data || '')
    }
  }
}

export const logger = new Logger() 