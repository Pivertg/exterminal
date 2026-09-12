/**
 * Calcul de la récompense en or pour une expédition terminée.
 * Fourchette reprise de l'analyse d'équilibrage (docs/analysis/economy-balance-phase7.md) : 40-70 or.
 * C'est TOUJOURS le serveur qui tire ce nombre — jamais le client (section 5 du GDD).
 */
export function rollExpeditionGoldReward(): number {
  const MIN = 40;
  const MAX = 70;
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}
