export const airlineColors: Record<string, string> = {
  "SkyWings Airlines": "#3b82f6",
  "CloudJet Airways": "#8b5cf6",
  "Horizon Express": "#ec4899",
  "AeroFly International": "#f59e0b",
  "GreenWings Airlines": "#10b981",
  "EcoJet Airways": "#059669",
  "CloudJet International": "#6366f1",
};

export const getAirlineColor = (airlineName: string): string => {
  return airlineColors[airlineName] || "#f97316";
};
