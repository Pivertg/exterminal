import { fetchEquipment, equipItem, type EquipmentState } from "../network/api";
import { EQUIPMENT_DEFINITIONS } from "../entities/equipmentTypes";

const RARITY_STARS: Record<number, string> = { 2: "★★", 3: "★★★", 4: "★★★★", 5: "★★★★★" };

/**
 * Écran d'équipement (Phase 14, section 13 du GDD). Un emplacement arme + un emplacement
 * artéfact. Les objets s'obtiennent en loot d'expédition (voir equipmentService.ts serveur).
 */
export class EquipmentScreen {
  private container: HTMLDivElement;
  private state: EquipmentState | null = null;

  constructor(private token: string, private onBack: () => void) {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111",
      fontFamily: "sans-serif",
      color: "#eee",
    });
    document.body.appendChild(this.container);
    this.load();
  }

  private async load() {
    try {
      this.state = await fetchEquipment(this.token);
      this.render();
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur : ${err instanceof Error ? err.message : "inconnue"}</p>`;
    }
  }

  private renderItemCard(itemId: string, equipped: boolean): string {
    const item = EQUIPMENT_DEFINITIONS[itemId];
    if (!item) return "";
    const bonuses = [
      item.bonusDamage ? `+${item.bonusDamage} dégâts` : null,
      item.bonusMaxHp ? `+${item.bonusMaxHp} PV max` : null,
      item.bonusSpeed ? `+${item.bonusSpeed} vitesse` : null,
      item.bonusFireRateMs ? `${item.bonusFireRateMs}ms cadence` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    return `
      <div style="display:flex; flex-direction:column; gap:6px; width:150px; background:#1c1c1c;
                  border:2px solid #${item.color.toString(16).padStart(6, "0")}; border-radius:8px; padding:12px; text-align:center;">
        <p style="margin:0; font-size:11px; color:#ffd166;">${RARITY_STARS[item.rarity]}</p>
        <p style="margin:0; font-weight:bold; font-size:13px;">${item.name}</p>
        <p style="margin:0; font-size:10px; color:#aaa;">${bonuses}</p>
        <button data-item-id="${item.id}" ${equipped ? "disabled" : ""}
          style="padding:6px; border-radius:4px; border:none; font-size:12px; cursor:${equipped ? "default" : "pointer"};
                 background:${equipped ? "#4dd0e1" : "#555"}; color:${equipped ? "#111" : "#eee"}; font-weight:bold;">
          ${equipped ? "Équipé" : "Équiper"}
        </button>
      </div>
    `;
  }

  private render() {
    if (!this.state) return;
    const { inventory, equippedWeaponId, equippedArtifactId } = this.state;

    const weapons = inventory.filter((id) => EQUIPMENT_DEFINITIONS[id]?.slot === "weapon");
    const artifacts = inventory.filter((id) => EQUIPMENT_DEFINITIONS[id]?.slot === "artifact");

    const weaponsHtml = weapons.length
      ? weapons.map((id) => this.renderItemCard(id, id === equippedWeaponId)).join("")
      : `<p style="font-size:12px; color:#888;">Aucune arme trouvée pour l'instant — terminez des expéditions.</p>`;

    const artifactsHtml = artifacts.length
      ? artifacts.map((id) => this.renderItemCard(id, id === equippedArtifactId)).join("")
      : `<p style="font-size:12px; color:#888;">Aucun artéfact trouvé pour l'instant.</p>`;

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px; width:640px; background:#1c1c1c; padding:24px; border-radius:8px; text-align:center;">
        <h2 style="margin:0;">Équipement</h2>

        <div style="text-align:left;">
          <p style="margin:0 0 8px; font-size:13px;">Armes</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">${weaponsHtml}</div>
        </div>

        <div style="text-align:left;">
          <p style="margin:0 0 8px; font-size:13px;">Artéfacts</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">${artifactsHtml}</div>
        </div>

        <button id="back-btn" style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#555; color:#eee; font-weight:bold;">
          Retour à la base
        </button>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>("button[data-item-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const itemId = btn.dataset.itemId!;
        btn.disabled = true;
        try {
          this.state = await equipItem(this.token, itemId);
          this.render();
        } catch {
          btn.disabled = false;
        }
      });
    });

    (this.container.querySelector("#back-btn") as HTMLButtonElement).addEventListener("click", () => {
      this.destroy();
      this.onBack();
    });
  }

  private destroy() {
    this.container.remove();
  }
}
