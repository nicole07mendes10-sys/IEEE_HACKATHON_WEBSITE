/**
 * OVERCLOCK 2027 — SPONSORS CONFIGURATION
 * FCRIT × IEEE Student Branch
 * All sponsor data and placeholder generation are configured here.
 */

const SPONSORS_CONFIG = {
  // Total placeholder sponsors to generate if custom list is empty
  // Edit this number to change the total count of placeholders automatically.
  TOTAL_PLACEHOLDER_SPONSORS: 6,

  // Contact details for partnership inquiries
  sponsorContactEmail: "mailto:sponsorship.overclock@fcrit.ac.in",
  
  // URL for sponsorship brochure (set to null or empty string to hide the brochure button)
  brochureUrl: null, // e.g. "docs/OVERCLOCK_2027_Sponsorship_Brochure.pdf"

  // Custom sponsors list
  customSponsors: [
    {
      id: "OC-27/SP-01",
      name: "STAGE ARTS LIVE",
      subtitle: "Customized Connect Experiences",
      tier: "OFFICIAL",
      logo: "images/sponsors/stage-arts-live.png",
      url: "https://stageartslive.com"
    },
    {
      id: "OC-27/SP-02",
      name: "THE BRITISH INSTITUTES",
      subtitle: "Education & Language Training Partner",
      tier: "OFFICIAL",
      logo: "images/sponsors/the-british-institutes.jpg",
      url: "https://www.thebritishinstitutes.com"
    }
  ],

  // Tier configuration with slot allocations & styling
  tiers: [
    {
      id: "OFFICIAL",
      title: "OFFICIAL EVENT PARTNERS",
      stampText: "OFFICIAL PARTNER",
      cardClass: "tier-gold-card",
      badgeClass: "badge-gold",
      gridClass: "tier-gold-grid",
      slots: 2
    },
    {
      id: "TITLE",
      title: "TITLE PARTNER",
      stampText: "TITLE PARTNER",
      cardClass: "tier-title-card",
      badgeClass: "badge-title",
      gridClass: "tier-title-container",
      slots: 1
    },
    {
      id: "GOLD",
      title: "GOLD PARTNERS",
      stampText: "GOLD CLEARANCE",
      cardClass: "tier-gold-card",
      badgeClass: "badge-gold",
      gridClass: "tier-gold-grid",
      slots: 2
    },
    {
      id: "SILVER",
      title: "SILVER PARTNERS",
      stampText: "SILVER CLEARANCE",
      cardClass: "tier-silver-card",
      badgeClass: "badge-silver",
      gridClass: "tier-silver-grid",
      slots: Infinity
    }
  ]
};

// Helper function to resolve sponsors list
function getSponsorsData() {
  if (SPONSORS_CONFIG.customSponsors && SPONSORS_CONFIG.customSponsors.length > 0) {
    return SPONSORS_CONFIG.customSponsors;
  }

  // Auto-generate placeholder sponsors
  const sponsors = [];
  const total = SPONSORS_CONFIG.TOTAL_PLACEHOLDER_SPONSORS;
  
  for (let i = 1; i <= total; i++) {
    const numStr = String(i).padStart(2, '0');
    let tier = "SILVER";
    if (i === 1) tier = "TITLE";
    else if (i === 2 || i === 3) tier = "GOLD";

    sponsors.push({
      id: `OC-27-${numStr}`,
      name: `SPONSOR ${numStr}`,
      tier: tier,
      logo: null,
      url: "#"
    });
  }

  return sponsors;
}

// Export for module or global use
if (typeof window !== 'undefined') {
  window.SPONSORS_CONFIG = SPONSORS_CONFIG;
  window.getSponsorsData = getSponsorsData;
}
