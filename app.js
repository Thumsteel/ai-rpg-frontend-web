// app.js
// !!! DŮLEŽITÉ: Tuto URL ZMĚNÍŠ, až nasadíš Backend na Render a získáš jeho skutečnou adresu!
const backend_url = 'https://ai-rpg-mozek-backend.onrender.com/api/tah'; 

// Získání odkazů na HTML elementy
const storyDiv = document.getElementById('story');
const actionForm = document.getElementById('action-form');
const actionInput = document.getElementById('action-input');
const hpSpan = document.getElementById('hp');
const inventorySpan = document.getElementById('inventory');

// Základní stav hry (musí být synchronizovaný s tím, co očekává AI)
let gameState = {
    jmeno: "Neznámý Hrdina",
    zdravi: 100,
    inventar: []
};

// --- FUNKCE PRO ODESLÁNÍ AKCE HRÁČE ---
async function sendAction(action) {
    try {
        // 1. Zamykáme vstup a ukazujeme, že AI pracuje
        storyDiv.textContent = '... AI Dungeon Master přemýšlí, sepisuje osud ...';
        actionInput.disabled = true;
        actionForm.querySelector('button').disabled = true;

        // 2. Odeslání dat na Backend server
        const response = await fetch(backend_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                akce_hrace: action,
                stav_hrace: gameState // Posíláme i aktuální stav hry pro kontext
            })
        });

        const data = await response.json();
        
        // 3. Kontrola chyb
        if (data.error) {
            storyDiv.textContent = data.error;
            return;
        }

        // 4. Zpracování a aktualizace herního stavu z JSON odpovědi AI
        storyDiv.textContent = data.popis + "\n\n---"; // Nový popis od AI
        
        if (data.herni_data) {
            // Příklad aktualizace zdraví (předpokládáme klíč "změna_zdravi" v JSONu)
            if (typeof data.herni_data.změna_zdravi === 'number') {
                gameState.zdravi += data.herni_data.změna_zdravi;
            }
            // Příklad přidání předmětu (předpokládáme klíč "nova_položka")
            if (data.herni_data.nova_položka && !gameState.inventar.includes(data.herni_data.nova_položka)) {
                gameState.inventar.push(data.herni_data.nova_položka);
            }
            // Můžeš zde přidat logiku pro magii, zkušenosti atd.
        }
        
        // 5. Zobrazení aktualizovaného stavu na UI
        hpSpan.textContent = gameState.zdravi;
        inventorySpan.textContent = gameState.inventar.join(', ') || 'Nic';

    } catch (error) {
        console.error('Chyba při komunikaci s Backendem:', error);
        storyDiv.textContent = 'Nastala kritická chyba! Server není dostupný, nebo je problém s připojením.';
    } finally {
        // 6. Odemykáme vstup
        actionInput.disabled = false;
        actionForm.querySelector('button').disabled = false;
        actionInput.value = ''; // Vyčistíme pole
    }
}

// --- NASLUCHOVAČE UDÁLOSTÍ ---

// Zpracování odeslání formuláře (když hráč klikne nebo stiskne Enter)
actionForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Zabráníme standardnímu odeslání formuláře
    const action = actionInput.value.trim();
    if (action) {
        sendAction(action);
    }
});

// Automatický start hry: První akce, která spustí AI
document.addEventListener('DOMContentLoaded', () => {
    sendAction("Vstupuji do temného a tichého lesa. Co vidím kolem sebe?");
});
