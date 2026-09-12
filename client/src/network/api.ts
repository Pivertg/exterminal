// En développement (npm run dev), Vite utilise localhost:3000 par défaut.
// En production, définir VITE_API_URL dans les variables d'environnement du build
// (voir DEPLOYMENT.md, Phase 19) pour pointer vers le vrai serveur déployé.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface AuthUser {
  id: string;
  username: string;
  accountLevel: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Erreur inconnue du serveur");
  }
  return data as T;
}

export function register(username: string, email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  }).then((res) => handleResponse<AuthResponse>(res));
}

export function login(username: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then((res) => handleResponse<AuthResponse>(res));
}

export function fetchMe(token: string): Promise<AuthUser> {
  return fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<AuthUser>(res));
}

export interface BaseState {
  hqLevel: number;
  gold: number;
  nextUpgradeCost: number | null;
}

export function fetchBase(token: string): Promise<BaseState> {
  return fetch(`${API_BASE_URL}/api/base`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<BaseState>(res));
}

export function upgradeBase(token: string): Promise<BaseState> {
  return fetch(`${API_BASE_URL}/api/base/upgrade`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<BaseState>(res));
}

export interface ExpeditionResult {
  reward: number;
  gold: number;
  crystalsGained: number;
  crystals: number;
  xpGained: number;
  accountLevel: number;
  accountXp: number;
  xpForNextLevel: number | null;
  leveledUp: boolean;
  expeditionsCompleted: number;
  itemDropped: string | null;
}

export function completeExpedition(token: string): Promise<ExpeditionResult> {
  return fetch(`${API_BASE_URL}/api/expedition/complete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<ExpeditionResult>(res));
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface ProgressionState {
  accountLevel: number;
  accountXp: number;
  xpForNextLevel: number | null;
  hqLevel: number;
  gold: number;
  expeditionsCompleted: number;
  achievements: Achievement[];
}

export function fetchProgression(token: string): Promise<ProgressionState> {
  return fetch(`${API_BASE_URL}/api/progression`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<ProgressionState>(res));
}

export interface GachaState {
  crystals: number;
  pullsSincePity: number;
  pullCost: number;
  pityThreshold: number;
  rates: Record<number, number>;
  ownedCharacterIds: string[];
}

export function fetchGacha(token: string): Promise<GachaState> {
  return fetch(`${API_BASE_URL}/api/gacha`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<GachaState>(res));
}

export interface PullResult {
  characterId: string;
  rarity: number;
  isNew: boolean;
  consolationRefund: number;
  crystals: number;
  pullsSincePity: number;
}

export function pullGacha(token: string): Promise<PullResult> {
  return fetch(`${API_BASE_URL}/api/gacha/pull`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<PullResult>(res));
}

export interface EquipmentState {
  inventory: string[];
  equippedWeaponId: string | null;
  equippedArtifactId: string | null;
}

export function fetchEquipment(token: string): Promise<EquipmentState> {
  return fetch(`${API_BASE_URL}/api/equipment`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<EquipmentState>(res));
}

export function equipItem(token: string, itemId: string): Promise<EquipmentState> {
  return fetch(`${API_BASE_URL}/api/equipment/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId }),
  }).then((res) => handleResponse<EquipmentState>(res));
}

export interface CosmeticsState {
  gold: number;
  owned: string[];
  equippedSkinId: string;
  equippedTitleId: string;
}

export function fetchCosmetics(token: string): Promise<CosmeticsState> {
  return fetch(`${API_BASE_URL}/api/cosmetics`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<CosmeticsState>(res));
}

export function buyCosmetic(token: string, itemId: string): Promise<{ gold: number; owned: string[] }> {
  return fetch(`${API_BASE_URL}/api/cosmetics/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId }),
  }).then((res) => handleResponse<{ gold: number; owned: string[] }>(res));
}

export function equipCosmetic(
  token: string,
  itemId: string
): Promise<{ equippedSkinId: string; equippedTitleId: string }> {
  return fetch(`${API_BASE_URL}/api/cosmetics/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId }),
  }).then((res) => handleResponse<{ equippedSkinId: string; equippedTitleId: string }>(res));
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  accountLevel: number;
  expeditionsCompleted: number;
}

export function fetchLeaderboard(token: string): Promise<{ entries: LeaderboardEntry[] }> {
  return fetch(`${API_BASE_URL}/api/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<{ entries: LeaderboardEntry[] }>(res));
}
