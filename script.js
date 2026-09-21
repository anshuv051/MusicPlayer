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
    const uploadBtn = document.getElementById('uploadBtn');
    const playlistEl = document.getElementById('playlist');
    const playlistCount = document.getElementById('playlistCount');
    const clearPlaylistBtn = document.getElementById('clearPlaylist');
    const nowPlaying = document.getElementById('nowPlaying');
    const vinyl = document.getElementById('vinyl');
    const vinylSongName = document.getElementById('vinylSongName');
    const discoToggle = document.getElementById('discoToggle');
    const discoOverlay = document.getElementById('discoOverlay');
    const dropZone = document.getElementById('dropZone');

    const playlist = [];
    let currentTrackIndex = -1;
    let isUserScrubbing = false;
    let discoEnabled = false;
    let previousVolume = 0.8;

    const displayName = (name) => {
        const cleaned = (name || '').replace(/\.[^/.]+$/, '').replace(/^.*[\\/]/, '');
        return cleaned || 'Unknown track';
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const setMessage = (message, vinylName = 'No Track') => {
        nowPlaying.textContent = message;
        vinylSongName.textContent = vinylName;
    };

    function renderPlaylist() {
        playlistEl.replaceChildren();
        playlistCount.textContent = `${playlist.length} track${playlist.length === 1 ? '' : 's'}`;

        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === currentTrackIndex) li.classList.add('active');

            const trackNumber = document.createElement('span');
            trackNumber.className = 'track-num';
            trackNumber.textContent = `${index + 1}.`;

            const trackName = document.createElement('span');
            trackName.className = 'track-name';
            trackName.textContent = displayName(track.name);

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-track';
            removeButton.type = 'button';
            removeButton.title = `Remove ${displayName(track.name)}`;
            removeButton.setAttribute('aria-label', `Remove ${displayName(track.name)}`);
            removeButton.textContent = '✕';

            li.append(trackNumber, trackName, removeButton);

            li.addEventListener('click', (e) => {
                if (e.target.closest('.remove-track')) return;
                playTrackAtIndex(index);
            });

            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromPlaylist(index);
            });

            playlistEl.appendChild(li);
        });
    }

    function addToPlaylist(name, url) {
        playlist.push({ name, url });
        renderPlaylist();
    }

    function removeFromPlaylist(index) {
        if (index < 0 || index >= playlist.length) return;

        const removedTrack = playlist[index];
        const wasCurrent = index === currentTrackIndex;

        if (removedTrack.url.startsWith('blob:')) {
            URL.revokeObjectURL(removedTrack.url);
        }

        playlist.splice(index, 1);

        if (index < currentTrackIndex) {
            currentTrackIndex -= 1;
        } else if (wasCurrent) {
            currentTrackIndex = -1;
            audio.pause();
            audio.removeAttribute('src');
            setMessage('No track selected');
            updateUIForStop();
        }

        renderPlaylist();
        updateDisco();
    }

    function clearPlaylist() {
        if (playlist.length === 0) return;

        playlist.forEach((track) => {
            if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
        });

        playlist.length = 0;
        currentTrackIndex = -1;
        audio.pause();
        audio.removeAttribute('src');
        setMessage('No track selected');
        renderPlaylist();
        updateUIForStop();
        updateDisco();
    }

    function updateUIForPlay(trackName) {
        const title = displayName(trackName);
        nowPlaying.textContent = title;
        vinylSongName.textContent = title.length > 12 ? `${title.slice(0, 12)}…` : title;
        vinyl.classList.remove('paused');
        vinyl.classList.add('playing');
        playPauseBtn.textContent = '⏸';
        playPauseBtn.setAttribute('aria-label', 'Pause');
    }

    function updateUIForPause() {
        playPauseBtn.textContent = '▶';
        playPauseBtn.setAttribute('aria-label', 'Play');
        vinyl.classList.add('paused');
    }

    function updateUIForStop() {
        playPauseBtn.textContent = '▶';
        playPauseBtn.setAttribute('aria-label', 'Play');
        vinyl.classList.remove('playing', 'paused');
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        seekSlider.value = 0;
    }

    function updateSeekDisplay() {
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);

        if (!isUserScrubbing && Number.isFinite(audio.duration) && audio.duration > 0) {
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
        }
    }

    function updateDisco() {
        const active = discoEnabled && !audio.paused && !audio.ended && Boolean(audio.src);
        discoOverlay.classList.toggle('active', active);
        document.body.classList.toggle('disco-active', active);
    }

    function toggleDisco() {
        discoEnabled = !discoEnabled;
        discoToggle.textContent = discoEnabled ? '💃' : '🪩';
        discoToggle.setAttribute('aria-pressed', String(discoEnabled));
        updateDisco();
    }

    function playTrackAtIndex(index) {
        if (index < 0 || index >= playlist.length) return;

        currentTrackIndex = index;
        const track = playlist[index];

        if (!track.url) return;

        audio.src = track.url;
        audio.load();
        updateUIForPlay(track.name);
        renderPlaylist();

        audio.play().catch(() => {
            nowPlaying.textContent = `${displayName(track.name)} (press play to start)`;
            updateUIForPause();
        });

        updateDisco();
    }

    function playNext() {
        if (playlist.length === 0) return;
        const nextIndex = currentTrackIndex >= 0 ? (currentTrackIndex + 1) % playlist.length : 0;
        playTrackAtIndex(nextIndex);
    }

    function playPrev() {
        if (playlist.length === 0) return;

        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            updateSeekDisplay();
            return;
        }

        const prevIndex = currentTrackIndex >= 0 ? (currentTrackIndex - 1 + playlist.length) % playlist.length : 0;
        playTrackAtIndex(prevIndex);
    }

    function addFiles(fileList) {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        const audioFiles = files.filter((file) => {
            const isAudioType = file.type.startsWith('audio/');
            const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name);
            return isAudioType || hasAudioExtension;
        });

        if (audioFiles.length === 0) {
            setMessage('Please select an audio file');
            return;
        }

        const startIndex = playlist.length;
        audioFiles.forEach((file) => addToPlaylist(file.name, URL.createObjectURL(file)));
        playTrackAtIndex(startIndex);
    }

    document.getElementById('playSong1').addEventListener('click', () => {
        const existingIndex = playlist.findIndex((track) => track.url === 'song1.mp3');
        if (existingIndex >= 0) {
            playTrackAtIndex(existingIndex);
        } else {
            addToPlaylist('Song 1', 'song1.mp3');
            playTrackAtIndex(playlist.length - 1);
        }
    });

    document.getElementById('playSong2').addEventListener('click', () => {
        const existingIndex = playlist.findIndex((track) => track.url === 'song2.mp3');
        if (existingIndex >= 0) {
            playTrackAtIndex(existingIndex);
        } else {
            addToPlaylist('Song 2', 'song2.mp3');
            playTrackAtIndex(playlist.length - 1);
        }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        addFiles(fileInput.files);
        fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
    });

    clearPlaylistBtn.addEventListener('click', clearPlaylist);

    playPauseBtn.addEventListener('click', () => {
        if (!audio.src) {
            if (playlist.length > 0) {
                playTrackAtIndex(0);
            } else {
                setMessage('Add a track to start');
            }
            return;
        }

        if (audio.paused) {
            audio.play().catch(() => {});
            updateUIForPlay(playlist[currentTrackIndex]?.name || nowPlaying.textContent);
            updateDisco();
        } else {
            audio.pause();
            updateUIForPause();
            updateDisco();
        }
    });

    stopBtn.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        updateUIForStop();
        updateDisco();
    });

    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    audio.addEventListener('timeupdate', updateSeekDisplay);
    audio.addEventListener('loadedmetadata', updateSeekDisplay);
    audio.addEventListener('error', () => {
        if (currentTrackIndex >= 0 && playlist[currentTrackIndex]) {
            nowPlaying.textContent = `Unable to play ${displayName(playlist[currentTrackIndex].name)}`;
            updateUIForPause();
        }
    });

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

        if (currentTrackIndex + 1 < playlist.length) {
            playTrackAtIndex(currentTrackIndex + 1);
        } else {
            setMessage('No track selected');
            currentTrackIndex = -1;
            renderPlaylist();
            updateDisco();
        }
    });

    seekSlider.addEventListener('input', () => {
        isUserScrubbing = true;
        if (Number.isFinite(audio.duration)) {
            currentTimeEl.textContent = formatTime((seekSlider.value / 100) * audio.duration);
        }
    });

    seekSlider.addEventListener('change', () => {
        if (Number.isFinite(audio.duration)) {
            audio.currentTime = (seekSlider.value / 100) * audio.duration;
        }
        isUserScrubbing = false;
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
        audio.muted = false;
        muteBtn.textContent = audio.volume > 0 ? '🔊' : '🔇';
    });

    muteBtn.addEventListener('click', () => {
        if (audio.muted || audio.volume === 0) {
            audio.muted = false;
            audio.volume = previousVolume || 0.8;
            volumeSlider.value = audio.volume * 100;
            muteBtn.textContent = '🔊';
        } else {
            previousVolume = audio.volume;
            audio.muted = true;
            volumeSlider.value = 0;
            muteBtn.textContent = '🔇';
        }
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        darkModeToggle.textContent = document.body.classList.contains('light-mode') ? '🌞' : '🌙';
    });

    discoToggle.addEventListener('click', toggleDisco);

    document.addEventListener('keydown', (e) => {
        const targetTag = e.target && e.target.tagName ? e.target.tagName : '';
        if (['INPUT', 'TEXTAREA', 'BUTTON', 'LABEL'].includes(targetTag)) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                playPauseBtn.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (Number.isFinite(audio.duration)) {
                    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
                    updateSeekDisplay();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                audio.currentTime = Math.max(audio.currentTime - 5, 0);
                updateSeekDisplay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                volumeSlider.value = Math.min(100, Number(volumeSlider.value) + 5);
                volumeSlider.dispatchEvent(new Event('input'));
                break;
            case 'ArrowDown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, Number(volumeSlider.value) - 5);
                volumeSlider.dispatchEvent(new Event('input'));
                break;
            default:
                if (e.key.toLowerCase() === 'm') muteBtn.click();
                else if (e.key.toLowerCase() === 'n') nextBtn.click();
                else if (e.key.toLowerCase() === 'p') prevBtn.click();
                else if (e.key.toLowerCase() === 'd') toggleDisco();
        }
    });

    audio.volume = 0.8;
    addToPlaylist('Song 1', 'song1.mp3');
    addToPlaylist('Song 2', 'song2.mp3');
});
