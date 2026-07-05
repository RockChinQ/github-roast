"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/track";

/**
 * Fires one `profile_landing` event when a /u profile mounts — the missing top of
 * the growth funnel. The `source` bucket is classified server-side from the Referer
 * header (which the client can't see reliably once GitHub camo / cross-origin
 * policies strip `document.referrer`), so attribution stays trustworthy. Pairs with
 * the mid-funnel PK/badge click events to make the landing → action → spread loop
 * measurable end-to-end. Renders nothing.
 */
export function ProfileLandingBeacon({
  source,
  tier,
  owner,
}: {
  /** Coarse referer bucket: github | badge | search | social | internal | direct | referral. */
  source: string;
  /** Profile's tier — lets the funnel be sliced by who people land on. */
  tier: string;
  /** True when the viewer is the profile owner — excluded from acquisition reads. */
  owner: boolean;
}) {
  useEffect(() => {
    trackEvent("profile_landing", { source, tier, owner });
    // Fire once per mount; a client-side nav to another profile remounts and
    // re-fires with that page's own source.
  }, [source, tier, owner]);
  return null;
}
