import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://cb16be9349303b53dc0a0a465d1e9611@o4511863320870912.ingest.us.sentry.io/4511863328407552',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});
