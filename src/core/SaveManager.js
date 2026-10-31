export class SaveManager {
  constructor() {
    this.storageKey = 'bengaluru_city_of_dreams_save_v1';
    this.defaultData = {
      player: {
        name: 'Naveen',
        gender: 'male',
        skinTone: '#a36d46',
        shirtColor: '#2b2b2b', // Black polo from character art
        jeansColor: '#4a6fa5', // Blue denim
        shoesColor: '#8a2323'  // Crimson sneakers with white sole
      },
      currentDistrict: 'ambedkar_road',
      timeOfDay: 'sunset',
      money: 12500,
      stats: {
        distanceTraveled: 0,
        missionsCompleted: 0
      },
      settings: {
        graphicsQuality: 'high',
        mouseSensitivity: 1.2,
        masterVolume: 0.8,
        ambience: true
      }
    };
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...this.defaultData,
          ...parsed,
          player: { ...this.defaultData.player, ...(parsed.player || {}) },
          settings: { ...this.defaultData.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.warn('Failed to load save data, using defaults.', e);
    }
    return JSON.parse(JSON.stringify(this.defaultData));
  }

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game data.', e);
      return false;
    }
  }

  reset() {
    try {
      localStorage.removeItem(this.storageKey);
      return JSON.parse(JSON.stringify(this.defaultData));
    } catch (e) {
      console.error('Failed to reset save data.', e);
      return null;
    }
  }
}

