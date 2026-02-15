// Система звуков и музыки для игры Honey
// Используем Web Audio API для генерации звуков

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.5;
  private musicVolume = 0.3;
  private sfxVolume = 0.7;
  private isMuted = false;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;

  // Инициализация аудио контекста
  init() {
    if (typeof window === 'undefined') return;
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Включить/выключить звук
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.musicGain) {
      this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume * this.masterVolume;
    }
    return this.isMuted;
  }

  // Установить громкость
  setMasterVolume(volume: number) {
    this.masterVolume = volume;
  }

  // Воспроизвести звук
  private playSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    attack = 0.01,
    decay = 0.1,
    volume = 1
  ) {
    if (this.isMuted || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // ADSR огибающая
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + attack + decay + duration);

    oscillator.start(now);
    oscillator.stop(now + attack + decay + duration + 0.1);
  }

  // Звук совпадения (приятный арпеджио)
  playMatch(comboLevel = 1) {
    if (this.isMuted) return;
    
    const baseFreq = 440 + (comboLevel * 50);
    const notes = [0, 4, 7, 12]; // Мажорное трезвучие + октава
    
    notes.forEach((semitone, index) => {
      setTimeout(() => {
        const freq = baseFreq * Math.pow(2, semitone / 12);
        this.playSound(freq, 0.15, 'sine', 0.01, 0.05, 0.4);
      }, index * 40);
    });
  }

  // Звук комбо (восходящая мелодия)
  playCombo(level: number) {
    if (this.isMuted) return;
    
    const baseFreq = 523.25; // C5
    const notes = [0, 2, 4, 5, 7, 9, 11, 12]; // До-ре-ми-фа-соль-ля-си-до
    
    for (let i = 0; i < Math.min(level, 8); i++) {
      setTimeout(() => {
        const freq = baseFreq * Math.pow(2, notes[i] / 12);
        this.playSound(freq, 0.2, 'triangle', 0.01, 0.1, 0.5);
      }, i * 60);
    }
  }

  // Звук свапа
  playSwap() {
    if (this.isMuted) return;
    this.playSound(600, 0.08, 'sine', 0.01, 0.03, 0.3);
    setTimeout(() => {
      this.playSound(800, 0.08, 'sine', 0.01, 0.03, 0.25);
    }, 40);
  }

  // Звук ошибки (невозможный свап) - "beeb beeb"
  playError() {
    if (this.isMuted) return;
    // Первый "beeb"
    this.playSound(400, 0.1, 'square', 0.01, 0.05, 0.4);
    // Второй "beeb" через небольшую паузу
    setTimeout(() => {
      this.playSound(400, 0.1, 'square', 0.01, 0.05, 0.4);
    }, 130);
  }

  // Звук падения элементов
  playFall() {
    if (this.isMuted) return;
    this.playSound(300 + Math.random() * 200, 0.05, 'sine', 0.01, 0.02, 0.15);
  }

  // Звук бонуса
  playBonus() {
    if (this.isMuted) return;
    
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.2, 'sine', 0.01, 0.1, 0.5);
      }, i * 80);
    });
  }

  // Звук крипто-бонуса
  playCryptoBonus() {
    if (this.isMuted) return;
    
    const melody = [523.25, 783.99, 1046.50, 1318.51, 1567.98]; // C-G-C-E-G
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.3, 'sine', 0.01, 0.15, 0.6);
        this.playSound(freq * 1.5, 0.2, 'triangle', 0.01, 0.1, 0.3);
      }, i * 100);
    });
  }

  // Звук оружия
  playWeapon(type: string) {
    if (this.isMuted) return;
    
    switch (type) {
      case 'lightning':
        // Звук электрошокера - электрические разряды
        this.playElectricShock();
        break;
      case 'dynamite':
        // Звук взрыва гранаты
        this.playExplosion();
        break;
      case 'honeyblast':
        // Медовый взрыв - мягкий звук
        this.playSound(400, 0.4, 'sine', 0.05, 0.2, 0.5);
        this.playSound(600, 0.3, 'triangle', 0.05, 0.15, 0.4);
        break;
      case 'beeswarm':
        // Рой пчёл - жужжание
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.playSound(200 + Math.random() * 100, 0.15, 'sawtooth', 0.01, 0.1, 0.3);
          }, i * 50);
        }
        break;
    }
  }

  // Звук электрошокера
  private playElectricShock() {
    if (!this.audioContext) return;
    
    const ctx = this.audioContext;
    const duration = 0.8;
    const now = ctx.currentTime;
    
    // Создаём шум для электрического треска
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    // Воспроизводим шум
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    // Фильтр для высоких частот (электрический звук)
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 2000;
    
    // Фильтр для низких частот
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 8000;
    
    // Громкость
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5 * this.sfxVolume * this.masterVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Соединяем
    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    
    // Добавляем тональные "затухающие" звуки
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const freq = 1500 + Math.random() * 2000;
        this.playSound(freq, 0.15, 'sawtooth', 0.01, 0.1, 0.3);
      }, i * 150);
    }
    
    // Финальный разряд
    setTimeout(() => {
      this.playSound(3000, 0.2, 'sine', 0.01, 0.15, 0.4);
      this.playSound(4500, 0.15, 'sine', 0.01, 0.1, 0.3);
    }, 500);
  }

  // Звук взрыва гранаты
  private playExplosion() {
    if (!this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // 1. Начальный удар (бум)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.8 * this.sfxVolume * this.masterVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);
    
    // 2. Шум взрыва
    const bufferSize = ctx.sampleRate * 0.6;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 5);
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;
    
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.6 * this.sfxVolume * this.masterVolume;
    
    noiseSource.connect(lowpass);
    lowpass.connect(gain2);
    gain2.connect(ctx.destination);
    noiseSource.start(now);
    
    // 3. Треск и осколки
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const freq = 200 + Math.random() * 500;
        this.playSound(freq, 0.08, 'sawtooth', 0.01, 0.05, 0.15);
      }, 50 + i * 40);
    }
    
    // 4. Эхо взрыва
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 60;
      
      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc2.connect(gain3);
      gain3.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.4);
    }, 200);
  }

  // Звук покупки
  playPurchase() {
    if (this.isMuted) return;
    this.playSound(523.25, 0.1, 'sine', 0.01, 0.05, 0.4);
    setTimeout(() => this.playSound(659.25, 0.1, 'sine', 0.01, 0.05, 0.4), 80);
    setTimeout(() => this.playSound(783.99, 0.15, 'sine', 0.01, 0.1, 0.5), 160);
  }

  // Звук победы/окончания игры
  playGameOver(isWin: boolean) {
    if (this.isMuted) return;
    
    if (isWin) {
      const melody = [392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.50];
      melody.forEach((freq, i) => {
        setTimeout(() => {
          this.playSound(freq, 0.3, 'sine', 0.01, 0.15, 0.5);
        }, i * 150);
      });
    } else {
      const melody = [392, 349.23, 329.63, 293.66];
      melody.forEach((freq, i) => {
        setTimeout(() => {
          this.playSound(freq, 0.4, 'sine', 0.05, 0.2, 0.4);
        }, i * 200);
      });
    }
  }

  // Звук обмена
  playExchange() {
    if (this.isMuted) return;
    const melody = [659.25, 783.99, 987.77, 1174.66];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.2, 'sine', 0.01, 0.1, 0.5);
        this.playSound(freq * 0.5, 0.15, 'triangle', 0.01, 0.08, 0.3);
      }, i * 100);
    });
  }

  // Звук клика
  playClick() {
    if (this.isMuted) return;
    this.playSound(800, 0.05, 'sine', 0.005, 0.02, 0.2);
  }

  // Звук выбора ячейки
  playSelect() {
    if (this.isMuted) return;
    this.playSound(500, 0.08, 'sine', 0.005, 0.03, 0.25);
  }

  // Запустить фоновую музыку
  startBackgroundMusic() {
    if (this.isMuted || !this.audioContext || this.musicOscillator) return;

    // Создаём мягкий дрон для фона
    const ctx = this.audioContext;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicVolume * this.masterVolume;
    this.musicGain.connect(ctx.destination);

    // Слой 1 - бас
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 65.41; // C2
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.3;
    osc1.connect(gain1);
    gain1.connect(this.musicGain);
    osc1.start();

    // Слой 2 - мягкая квинта
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 98; // G2
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.15;
    osc2.connect(gain2);
    gain2.connect(this.musicGain);
    osc2.start();

    // Слой 3 - тихий высокий тон
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 261.63; // C4
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.05;
    osc3.connect(gain3);
    gain3.connect(this.musicGain);
    osc3.start();

    this.musicOscillator = osc1; // Сохраняем для остановки
  }

  // Остановить музыку
  stopBackgroundMusic() {
    if (this.musicOscillator) {
      this.musicOscillator.stop();
      this.musicOscillator = null;
    }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }
}

// Экспортируем singleton
export const soundManager = new SoundManager();
