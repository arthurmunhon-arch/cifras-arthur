const seedData = [
    { 
        id: 1, 
        title: "Bondade de Deus", 
        artist: "Isaías Saad", 
        tone: "G", 
        repertoire: "Culto Domingo", 
        favorite: true, 
        chords: "G                          C\nTe amo, Deus, Tua graça nunca falha\n           D                     G\nTodos os dias, em Tuas mãos eu estou\n                    Em          C\nDesde o amanhecer até o sol se pôr\n         D            Em   C          D        G\nEu cantarei da bondade de Deus. Em tudo És fiel!" 
    },
    { 
        id: 2, 
        title: "Lugar Secreto", 
        artist: "Gabriela Rocha", 
        tone: "E", 
        repertoire: "Nenhum", 
        favorite: false, 
        chords: "E                     C#m\nTu és tudo o que eu mais quero\n                  A\nNão há outro lugar melhor\n                 F#m\nDo que nos Teus braços" 
    }
];

let songs = JSON.parse(localStorage.getItem('biblioteca_cifras')) || seedData;
if(!localStorage.getItem('biblioteca_cifras')) {
    localStorage.setItem('biblioteca_cifras', JSON.stringify(songs));
}

let currentSongId = null;
let currentFontSize = 18;
let selectedRepertoire = "";
let scrollInterval = null;
let isScrolling = false;
let currentIntervalSpeed = 40; // Velocidade padrão inicial (Média)

window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderSongsList(songs);
});

function showSection(sectionId) {
    stopAutoScroll();
    document.getElementById('sec-dashboard').classList.add('hidden');
    document.getElementById('sec-view').classList.add('hidden');
    document.getElementById('sec-admin').classList.add('hidden');
    
    document.getElementById(`sec-${sectionId}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNewSongForm() {
    document.getElementById('songForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('adminTitle').innerText = "Adicionar Nova Música";
    showSection('admin');
}

function renderSongsList(songsArray) {
    const grid = document.getElementById('songsGrid');
    grid.innerHTML = '';

    if(songsArray.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-sm">Nenhuma cifra encontrada.</div>`;
        return;
    }

    songsArray.forEach(song => {
        const card = document.createElement('div');
        card.className = "bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-lg";
        card.onclick = () => viewSong(song.id);
        
        const badgeEscala = song.repertoire && song.repertoire !== 'Nenhum' 
            ? `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">${song.repertoire}</span>`
            : `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-500">Sem Escala</span>`;

        card.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between items-start">
                    ${badgeEscala}
                    <span class="text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">${song.tone}</span>
                </div>
                <div>
                    <h3 class="font-bold text-white text-base group-hover:text-blue-400 transition-colors">${song.title}</h3>
                    <p class="text-xs text-slate-400">${song.artist}</p>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/60 flex justify-end items-center text-[11px]">
                ${song.favorite ? '<i data-lucide="star" class="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"></i>' : ''}
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function filterSongs() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const tone = document.getElementById('filterTone').value;

    const filtered = songs.filter(song => {
        const matchesQuery = song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query);
        const matchesTone = tone === "" || song.tone === tone;
        const matchesRep = selectedRepertoire === "" || song.repertoire === selectedRepertoire;
        return matchesQuery && matchesTone && matchesRep;
    });
    renderSongsList(filtered);
}

function filterByRepertoire(repName) {
    selectedRepertoire = repName;
    document.getElementById('sectionListTitle').innerHTML = `<i data-lucide="calendar" class="w-5 h-5 text-blue-400"></i> Músicas do ${repName}`;
    filterSongs();
}

function resetRepertoireFilter() {
    selectedRepertoire = "";
    document.getElementById('sectionListTitle').innerHTML = `<i data-lucide="layers" class="w-5 h-5 text-blue-400"></i> Todas as Músicas`;
    filterSongs();
}

function updateSongRepertoire(repName) {
    const song = songs.find(s => s.id === currentSongId);
    if(song) {
        song.repertoire = repName;
        localStorage.setItem('biblioteca_cifras', JSON.stringify(songs));
        updateRepertoireButtons(repName);
        renderSongsList(songs);
    }
}

function updateRepertoireButtons(currentRep) {
    const btnDom = document.getElementById('btnSetDomingo');
    const btnQua = document.getElementById('btnSetQuarta');
    const btnNen = document.getElementById('btnSetNenhum');

    if(!btnDom || !btnQua || !btnNen) return;

    [btnDom, btnQua, btnNen].forEach(b => {
        b.className = "px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all";
    });

    if(currentRep === 'Culto Domingo') {
        btnDom.className = "px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-lg transition-all";
    } else if(currentRep === 'Culto Quarta') {
        btnQua.className = "px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-lg transition-all";
    } else {
        btnNen.className = "px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 text-slate-200 transition-all";
    }
}

function highlightChords(chordsText) {
    return chordsText.split('\n').map(line => {
        if(line.trim() === "") return "";
        const isChordLine = line.split(/\s+/).filter(Boolean).every(w => 
            /^[A-G][m|#|b|2|4|5|6|7|9|maj|dim|aug|sus]*(\/[A-G][m|#|b]*)?$/.test(w) || w === "-" || w === "|"
        );
        return isChordLine ? `<span class="chord">${line}</span>` : `<span class="lyrics">${line}</span>`;
    }).join('\n');
}

function viewSong(id) {
    const song = songs.find(s => s.id === id);
    if(!song) return;
    currentSongId = id;

    document.getElementById('viewTitle').innerText = song.title;
    document.getElementById('viewArtist').innerText = song.artist;
    document.getElementById('viewTone').innerText = song.tone;
    
    updateRepertoireButtons(song.repertoire || 'Nenhum');

    currentFontSize = 18; 
    const sheet = document.getElementById('chordSheet');
    sheet.innerHTML = highlightChords(song.chords);
    sheet.style.fontSize = `${currentFontSize}px`;

    const favBtn = document.getElementById('btnFav');
    favBtn.innerHTML = song.favorite ? `<i data-lucide="star" class="w-5 h-5 text-yellow-500 fill-yellow-500"></i>` : `<i data-lucide="star" class="w-5 h-5"></i>`;

    document.getElementById('stageTitle').innerText = song.title;
    document.getElementById('stageArtist').innerText = song.artist;
    document.getElementById('stageTone').innerText = song.tone;
    
    const stageSheet = document.getElementById('stageSheet');
    stageSheet.innerHTML = highlightChords(song.chords);
    stageSheet.style.fontSize = "26px"; 

    showSection('view');
    lucide.createIcons();
}

function adjustFont(amount) {
    currentFontSize = Math.max(12, Math.min(36, currentFontSize + amount));
    const sheet = document.getElementById('chordSheet');
    if (sheet) {
        sheet.style.fontSize = `${currentFontSize}px`;
    }
}

/* SISTEMA ATUALIZADO COM SELETOR DE VELOCIDADE DINÂMICO */
function toggleAutoScroll(isStage = false) {
    const btn = isStage ? document.getElementById('btnStageScroll') : document.getElementById('btnAutoScroll');
    const container = isStage ? document.getElementById('stageMode') : window;
    const speedSelect = isStage ? document.getElementById('stageScrollSpeed') : document.getElementById('scrollSpeed');

    if (isScrolling) {
        stopAutoScroll();
    } else {
        isScrolling = true;
        currentIntervalSpeed = parseInt(speedSelect.value); // Obtém o valor do milissegundo selecionado

        if(btn) {
            btn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5"></i> Parar`;
            btn.className = btn.className.replace('text-amber-400', 'text-emerald-400');
        }
        
        scrollInterval = setInterval(() => {
            if (isStage) {
                container.scrollBy(0, 1);
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
                    stopAutoScroll();
                }
            } else {
                container.scrollBy(0, 1);
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
                    stopAutoScroll();
                }
            }
        }, currentIntervalSpeed);
    }
    lucide.createIcons();
}

// Altera a velocidade em tempo real se a rolagem já estiver ativa
function changeSpeed(isStage = false) {
    if (isScrolling) {
        clearInterval(scrollInterval); // Para a velocidade antiga
        isScrolling = false; 
        toggleAutoScroll(isStage);    // Reinicia na velocidade nova instantaneamente
    }
}

function stopAutoScroll() {
    isScrolling = false;
    clearInterval(scrollInterval);
    
    const btnView = document.getElementById('btnAutoScroll');
    const btnStage = document.getElementById('btnStageScroll');
    
    if(btnView) {
        btnView.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5"></i> Rolar`;
        btnView.className = btnView.className.replace('text-emerald-400', 'text-amber-400');
    }
    if(btnStage) {
        btnStage.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5"></i> Rolar`;
        btnStage.className = btnStage.className.replace('text-emerald-400', 'text-amber-400');
    }
    lucide.createIcons();
}

function toggleFavoriteCurrent() {
    const song = songs.find(s => s.id === currentSongId);
    if(song) {
        song.favorite = !song.favorite;
        localStorage.setItem('biblioteca_cifras', JSON.stringify(songs));
        viewSong(currentSongId);
    }
}

function toggleStageMode() {
    stopAutoScroll();
    const stage = document.getElementById('stageMode');
    if(stage.classList.contains('hidden')) {
        stage.classList.remove('hidden');
        stage.scrollTo({ top: 0 });
    } else {
        stage.classList.add('hidden');
    }
}

function editCurrentSong() {
    const song = songs.find(s => s.id === currentSongId);
    if(!song) return;

    document.getElementById('editId').value = song.id;
    document.getElementById('formTitle').value = song.title;
    document.getElementById('formArtist').value = song.artist;
    document.getElementById('formTone').value = song.tone;
    document.getElementById('formChords').value = song.chords;

    document.getElementById('adminTitle').innerText = "Editar Cifra";
    showSection('admin');
}

function saveSong(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const title = document.getElementById('formTitle').value;
    const artist = document.getElementById('formArtist').value;
    const tone = document.getElementById('formTone').value;
    const chords = document.getElementById('formChords').value;

    if(id) {
        const index = songs.findIndex(s => s.id == id);
        songs[index] = { ...songs[index], title, artist, tone, chords };
    } else {
        songs.push({ id: Date.now(), title, artist, tone, chords, favorite: false, repertoire: "Nenhum" });
    }

    localStorage.setItem('biblioteca_cifras', JSON.stringify(songs));
    document.getElementById('songForm').reset();
    document.getElementById('editId').value = '';
    renderSongsList(songs);
    showSection('dashboard');
}