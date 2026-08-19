import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo already defines its agent guidance in .claude/ and README.md.
  // Without this, `next dev` regenerates root AGENTS.md / CLAUDE.md on every run.
  agentRules: false,
};

export default nextConfig;
