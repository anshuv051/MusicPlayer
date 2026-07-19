document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const seekSlider = document.getElementById('seekSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const muteBtn = document.getElementById('muteBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const fileInput = document.getElementById('fileInput');
    const playlistEl = document.getElementById('playlist');
    const playlistCount = document.getElementById('playlistCount');
    const clearPlaylistBtn = document.getElementById('clearPlaylist');
    const nowPlaying = document.getElementById('nowPlaying');
    const vinyl = document.getElementById('vinyl');
    const vinylSongName = document.getElementById('vinylSongName');
    const discoToggle = document.getElementById('discoToggle');
    const discoOverlay = document.getElementById('discoOverlay');

    const playlist = [];
    let currentTrackIndex = -1;
    let isUserScrubbing = false;
    let discoEnabled = false;

    // ===== PLAYLIST =====
    function addToPlaylist(name, url) {
        playlist.push({ name, url });
        renderPlaylist();
    }

    function removeFromPlaylist(index) {
        if (index < 0 || index >= playlist.length) return;
        const track = playlist[index];
        if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
        playlist.splice(index, 1);
        if (index < currentTrackIndex) currentTrackIndex--;
        else if (index === currentTrackIndex) {
            currentTrackIndex = -1;
            audio.pause();
            audio.src = '';
            nowPlaying.textContent = 'No track selected';
            vinylSongName.textContent = 'No Track';
            updateUIForStop();
            updateDisco();
        }
        renderPlaylist();
    }

    function clearPlaylist() {
        if (playlist.length === 0) return;
        playlist.forEach(track => {
            if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
        });
        playlist.length = 0;
        currentTrackIndex = -1;
        audio.pause();
        audio.removeAttribute('src');
        nowPlaying.textContent = 'No track selected';
        vinylSongName.textContent = 'No Track';
        renderPlaylist();
        updateUIForStop();
        updateDisco();
    }

    function renderPlaylist() {
        playlistEl.innerHTML = '';
        playlistCount.textContent = `${playlist.length} track${playlist.length !== 1 ? 's' : ''}`;
        playlist.forEach((track, idx) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (idx === currentTrackIndex) li.classList.add('active');
            const displayName = track.name.replace(/\.[^/.]+$/, '').replace(/^.*[\\/]/, '') || track.name;
            li.innerHTML = `
                <span class="track-num">${idx + 1}.</span>
                <span class="track-name">${displayName}</span>
                <button class="remove-track">✕</button>
            `;
            li.addEventListener('click', (e) => {
                if (e.target.closest('.remove-track')) return;
                playTrackAtIndex(idx);
            });
            li.querySelector('.remove-track').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromPlaylist(idx);
            });
            playlistEl.appendChild(li);
        });
    }

    function playTrackAtIndex(idx) {
        if (idx < 0 || idx >= playlist.length) return;
        currentTrackIndex = idx;
        const track = playlist[idx];
        if (!track.url) return;
        audio.src = track.url;
        audio.load();
        audio.play().catch(() => { });
        updateUIForPlay(track.name);
        renderPlaylist();
        updateDisco();
    }

    function playNext() {
        if (playlist.length === 0) return;
        playTrackAtIndex((currentTrackIndex + 1) % playlist.length);
    }

    function playPrev() {
        if (playlist.length === 0) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            updateSeekDisplay();
            return;
        }
        playTrackAtIndex((currentTrackIndex - 1 + playlist.length) % playlist.length);
    }

    // ===== UI =====
    function updateUIForPlay(trackName) {
        const displayName = trackName.replace(/\.[^/.]+$/, '').replace(/^.*[\\/]/, '') || trackName;
        nowPlaying.textContent = displayName;
        vinylSongName.textContent = displayName.length > 12 ? displayName.substring(0, 12) + '…' : displayName;
        vinyl.classList.remove('paused');
        vinyl.classList.add('playing');
        playPauseBtn.textContent = '⏸';
    }

    function updateUIForPause() {
        playPauseBtn.textContent = '▶';
        vinyl.classList.add('paused');
    }

    function updateUIForStop() {
        playPauseBtn.textContent = '▶';
        vinyl.classList.remove('playing', 'paused');
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        seekSlider.value = 0;
    }

    function updateSeekDisplay() {
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
        if (!isUserScrubbing && audio.duration) {
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
        }
    }

    // ===== DISCO MODE =====
    function updateDisco() {
        const isPlaying = !audio.paused && !audio.ended && audio.src && audio.readyState >= 2;
        if (discoEnabled && isPlaying) {
            discoOverlay.classList.add('active');
            document.body.classList.add('disco-active');
        } else {
            discoOverlay.classList.remove('active');
            document.body.classList.remove('disco-active');
        }
    }

    function toggleDisco() {
        discoEnabled = !discoEnabled;
        discoToggle.textContent = discoEnabled ? '💃' : '🪩';
        discoToggle.style.background = discoEnabled ? 'var(--accent2)' : 'var(--accent)';
        updateDisco();
    }

    // ===== PRESET SONGS =====
    document.getElementById('playSong1').addEventListener('click', () => {
        const existing = playlist.findIndex(t => t.url === 'song1.mp3');
        if (existing >= 0) playTrackAtIndex(existing);
        else { addToPlaylist('Song 1', 'song1.mp3'); playTrackAtIndex(playlist.length - 1); }
    });
    document.getElementById('playSong2').addEventListener('click', () => {
        const existing = playlist.findIndex(t => t.url === 'song2.mp3');
        if (existing >= 0) playTrackAtIndex(existing);
        else { addToPlaylist('Song 2', 'song2.mp3'); playTrackAtIndex(playlist.length - 1); }
    });

    // ===== FILE INPUT =====
    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        if (files.length === 0) return;
        const startIdx = playlist.length;
        files.forEach(file => addToPlaylist(file.name, URL.createObjectURL(file)));
        playTrackAtIndex(startIdx);
        fileInput.value = '';
    });

    // ===== CLEAR =====
    clearPlaylistBtn.addEventListener('click', clearPlaylist);

    // ===== PLAY/PAUSE =====
    playPauseBtn.addEventListener('click', () => {
        if (!audio.src) {
            if (playlist.length > 0) { playTrackAtIndex(0); }
            return;
        }
        if (audio.paused) {
            audio.play().catch(() => { });
            updateUIForPlay(playlist[currentTrackIndex]?.name || nowPlaying.textContent);
            updateDisco();
        } else {
            audio.pause();
            updateUIForPause();
            updateDisco();
        }
    });

    // ===== STOP =====
    stopBtn.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        updateUIForStop();
        updateDisco();
    });

    // ===== PREV/NEXT =====
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    // ===== AUDIO EVENTS =====
    audio.addEventListener('timeupdate', updateSeekDisplay);
    audio.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(audio.duration); });

    // Keep UI in sync with native play events (browser autoplay, context menu, etc.)
    audio.addEventListener('play', () => {
        if (!audio.ended) {
            updateUIForPlay(playlist[currentTrackIndex]?.name || nowPlaying.textContent);
            updateDisco();
        }
    });
    audio.addEventListener('pause', () => {
        if (!audio.ended) updateUIForPause();
        updateDisco();
    });
    audio.addEventListener('ended', () => {
        updateUIForStop();
        updateDisco();
        const nextIdx = currentTrackIndex + 1;
        if (nextIdx < playlist.length) {
            playTrackAtIndex(nextIdx);
        } else {
            nowPlaying.textContent = 'No track selected';
            vinylSongName.textContent = 'No Track';
            currentTrackIndex = -1;
            renderPlaylist();
            updateDisco();
        }
    });

    // ===== SEEK =====
    seekSlider.addEventListener('input', () => {
        isUserScrubbing = true;
        if (audio.duration) currentTimeEl.textContent = formatTime((seekSlider.value / 100) * audio.duration);
    });
    seekSlider.addEventListener('change', () => {
        if (audio.duration) audio.currentTime = (seekSlider.value / 100) * audio.duration;
        isUserScrubbing = false;
    });

    // ===== VOLUME =====
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
        audio.muted = false;
    });
    let prevVolume = 0.8;
    muteBtn.addEventListener('click', () => {
        if (audio.muted) {
            audio.muted = false;
            audio.volume = prevVolume;
            volumeSlider.value = prevVolume * 100;
        } else {
            prevVolume = audio.volume;
            audio.muted = true;
            volumeSlider.value = 0;
        }
    });

    // ===== DARK MODE =====
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        darkModeToggle.textContent = document.body.classList.contains('light-mode') ? '🌞' : '🌙';
    });

    // ===== DISCO TOGGLE =====
    discoToggle.addEventListener('click', toggleDisco);

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.key) {
            case ' ': e.preventDefault(); playPauseBtn.click(); break;
            case 'ArrowRight': e.preventDefault(); audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0); updateSeekDisplay(); break;
            case 'ArrowLeft': e.preventDefault(); audio.currentTime = Math.max(audio.currentTime - 5, 0); updateSeekDisplay(); break;
            case 'ArrowUp': e.preventDefault(); volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5); volumeSlider.dispatchEvent(new Event('input')); break;
            case 'ArrowDown': e.preventDefault(); volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5); volumeSlider.dispatchEvent(new Event('input')); break;
            case 'm': case 'M': muteBtn.click(); break;
            case 'n': case 'N': nextBtn.click(); break;
            case 'p': case 'P': prevBtn.click(); break;
            case 'd': case 'D': toggleDisco(); break;
        }
    });

    // ===== FORMAT =====
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ===== INIT =====
    audio.volume = 0.8;
    [['Song 1', 'song1.mp3'], ['Song 2', 'song2.mp3']].forEach(s => addToPlaylist(s[0], s[1]));
});
