// src/modules/registry/component/semver.ts
//
// Deliberately minimal — validates and compares X.Y.Z only. No
// prerelease tags (-beta.1), no build metadata (+build.5). If you need
// those, pull in the `semver` package instead of extending this; this
// exists to avoid an extra dependency for the 90% case, not to be a
// full spec implementation.

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

export function isValidSemver(version: string): boolean {
  return SEMVER_RE.test(version);
}

/** Returns true if `a` is strictly greater than `b`. Both must be valid. */
export function isGreaterSemver(a: string, b: string): boolean {
  const pa = parse(a);
  const pb = parse(b);
  if (pa[0] !== pb[0]) return pa[0] > pb[0];
  if (pa[1] !== pb[1]) return pa[1] > pb[1];
  return pa[2] > pb[2];
}

function parse(version: string): [number, number, number] {
  const match = version.match(SEMVER_RE);
  if (!match) throw new Error(`Invalid semver: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
