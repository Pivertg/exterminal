import type { Room } from "colyseus.js";
import { fetchGacha } from "../network/api";
import { CHARACTER_DEFINITIONS } from "../entities/characterTypes";
import { COMPANION_DEFINITIONS } from "../entities/companionTypes";

interface ChatMessage {
  username: string;
  text: string;
}

/**
 * Salon de groupe multijoueur : chat textuel + choix du personnage et du compagnon par
 * chaque joueur avant de lancer l'expédition ensemble (inspiré d'une pub où chacun choisit
 * son rôle et son compagnon avant le départ — voir journal-22).
 */
export class PartyLobbyScreen {
  private container: HTMLDivElement;
  private ownedCharacterIds: string[] = [];
  private chatMessages: ChatMessage[] = [];

  constructor(
    private token: string,
    private room: Room,
    private onStart: (characterId: string, companionId: string) => void
  ) {
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
    this.init();
  }

  private async init() {
    try {
      const gacha = await fetchGacha(this.token);
      this.ownedCharacterIds = gacha.ownedCharacterIds;
    } catch {
      this.ownedCharacterIds = ["recrue"];
    }

    this.room.onMessage("chat", (msg: ChatMessage) => {
      this.chatMessages.push(msg);
      this.render();
    });

    this.room.onMessage("expedition-start", () => {
      const me = this.room.state.players.get(this.room.sessionId);
      this.onStart(me?.characterId ?? "recrue", me?.companionId ?? "aucun");
    });

    this.room.onStateChange(() => this.render());

    this.render();
  }

  private render() {
    const players: Array<{ sessionId: string; username: string; characterId: string; companionId: string; ready: boolean }> = [];
    this.room.state.players.forEach((p: any, sessionId: string) => {
      players.push({ sessionId, username: p.username, characterId: p.characterId, companionId: p.companionId, ready: p.ready });
    });

    const me = players.find((p) => p.sessionId === this.room.sessionId);

    const playersHtml = players
      .map(
        (p) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #333; font-size:13px;">
          <span>${p.username}${p.sessionId === this.room.sessionId ? " (vous)" : ""}</span>
          <span style="color:#aaa;">${CHARACTER_DEFINITIONS[p.characterId]?.name ?? p.characterId} — ${COMPANION_DEFINITIONS[p.companionId]?.name ?? "aucun"}</span>
          <span style="color:${p.ready ? "#66bb6a" : "#888"};">${p.ready ? "✓ Prêt" : "En attente"}</span>
        </div>`
      )
      .join("");

    const characterOptions = Object.values(CHARACTER_DEFINITIONS)
      .filter((c) => this.ownedCharacterIds.includes(c.id))
      .map((c) => `<option value="${c.id}" ${me?.characterId === c.id ? "selected" : ""}>${c.name}</option>`)
      .join("");

    const companionOptions = Object.values(COMPANION_DEFINITIONS)
      .map((c) => `<option value="${c.id}" ${me?.companionId === c.id ? "selected" : ""}>${c.name}</option>`)
      .join("");

    const chatHtml = this.chatMessages
      .map((m) => `<p style="margin:2px 0;"><strong>${m.username}:</strong> ${this.escapeHtml(m.text)}</p>`)
      .join("");

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:14px; width:420px; background:#1c1c1c; padding:24px; border-radius:8px;">
        <h2 style="margin:0; text-align:center;">Salon de groupe</h2>

        <div>${playersHtml}</div>

        <div style="display:flex; gap:10px;">
          <select id="character-select" style="flex:1; padding:6px; border-radius:4px; background:#2a2a2a; color:#eee; border:1px solid #444;">
            ${characterOptions}
          </select>
          <select id="companion-select" style="flex:1; padding:6px; border-radius:4px; background:#2a2a2a; color:#eee; border:1px solid #444;">
            ${companionOptions}
          </select>
        </div>

        <button id="ready-btn"
          style="padding:10px; border-radius:6px; border:none; cursor:pointer; font-weight:bold;
                 background:${me?.ready ? "#888" : "#66bb6a"}; color:#111;">
          ${me?.ready ? "Annuler" : "Prêt"}
        </button>

        <div style="background:#141414; border-radius:6px; padding:8px; height:120px; overflow-y:auto; font-size:12px;" id="chat-log">
          ${chatHtml}
        </div>
        <form id="chat-form" style="display:flex; gap:8px;">
          <input id="chat-input" placeholder="Écrire un message..." maxlength="200"
            style="flex:1; padding:8px; border-radius:4px; border:1px solid #444; background:#2a2a2a; color:#eee;" />
          <button type="submit" style="padding:8px 14px; border-radius:4px; border:none; background:#4dd0e1; color:#111; font-weight:bold;">
            Envoyer
          </button>
        </form>
      </div>
    `;

    const chatLog = this.container.querySelector("#chat-log") as HTMLDivElement;
    chatLog.scrollTop = chatLog.scrollHeight;

    (this.container.querySelector("#character-select") as HTMLSelectElement).addEventListener("change", (e) => {
      this.room.send("select-character", { characterId: (e.target as HTMLSelectElement).value });
    });

    (this.container.querySelector("#companion-select") as HTMLSelectElement).addEventListener("change", (e) => {
      this.room.send("select-companion", { companionId: (e.target as HTMLSelectElement).value });
    });

    (this.container.querySelector("#ready-btn") as HTMLButtonElement).addEventListener("click", () => {
      this.room.send("toggle-ready");
    });

    const chatForm = this.container.querySelector("#chat-form") as HTMLFormElement;
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = this.container.querySelector("#chat-input") as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;
      this.room.send("chat", { text });
      input.value = "";
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  public destroy() {
    this.container.remove();
  }
}
