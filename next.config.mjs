import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Only used at build time for uploading source maps; safe to leave org/project
  // unset — Sentry will skip the upload step (and stay silent) without an auth token.
  silent: true,
  disableLogger: true,
});
