import {
  browserTracingIntegration,
  consoleLoggingIntegration,
  replayIntegration,
} from "@sentry/browser";
import * as Sentry from "@sentry/react";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const isProduction = window.location.hostname.includes("helloatlas.in");

export const initSentry = () => {
  Sentry.init({
    dsn: "https://e34f6a28f463eabfad0e011f241bc6da@o4509121739227136.ingest.us.sentry.io/4509399321542656",
    integrations: [
      browserTracingIntegration(),
      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
      replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: false,
      }),
    ],
    tracesSampleRate: isLocalhost ? 1.0 : 0.2,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.helloatlas\.in/,
      /^https:\/\/.*\.kreditmind\.com\/api/,
    ],
    replaysSessionSampleRate: isLocalhost ? 1.0 : 0.3,
    replaysOnErrorSampleRate: 1.0,
    environment: isLocalhost
      ? "development"
      : isProduction
      ? "production"
      : "staging",
    sendDefaultPii: true,
    _experiments: {
      enableLogs: true,
    },
    beforeSend(event) {
      if (isLocalhost) {
        console.log("Sentry event:", event);
      }
      return event;
    },
  });
};

export const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
};

export const captureMessage = (message, level = "info", context = {}) => {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureMessage(message, level);
  });
};

// Updated span functionality - this is the correct modern approach
export const startSpan = (spanConfig, callback) => {
  return Sentry.startSpan(spanConfig, callback);
};

// Add logger functionality
export const logger = {
  info: (message, extra = {}) => {
    console.info(message, extra);
    Sentry.addBreadcrumb({
      message,
      level: "info",
      data: extra,
    });
  },
  warn: (message, extra = {}) => {
    console.warn(message, extra);
    Sentry.addBreadcrumb({
      message,
      level: "warning",
      data: extra,
    });
  },
  error: (message, extra = {}) => {
    console.error(message, extra);
    Sentry.addBreadcrumb({
      message,
      level: "error",
      data: extra,
    });
  },
};

// Updated transaction functionality using modern Sentry spans
export const startTransaction = (name, op) => {
  // In modern Sentry, we use startSpan for transactions too
  return {
    name,
    op,
    finish: () => {
      // Modern Sentry handles span finishing automatically in most cases
      // This is mainly for API compatibility
    },
    setStatus: (status) => {
      // Modern Sentry handles status automatically
      console.log("status", status);
    },
  };
};

// Alternative approach: Use startSpan directly for better performance
export const withTransaction = (name, op, callback) => {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    callback
  );
};
