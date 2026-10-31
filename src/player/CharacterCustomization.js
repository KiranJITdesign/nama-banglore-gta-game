export class CharacterCustomization {
  constructor(initialData = {}) {
    this.name = initialData.name || 'Naveen';
    this.gender = initialData.gender || 'male';

    this.skinTone = initialData.skinTone || '#a36d46';
    this.shirtColor = initialData.shirtColor || '#2b2b2b';
    this.jeansColor = initialData.jeansColor || '#4a6fa5';
    this.shoesColor = initialData.shoesColor || '#8a2323';

    // Palettes
    this.skinPalette = ['#a36d46', '#724a2e', '#c4916a', '#e0ab85'];
    this.shirtPalette = ['#2b2b2b', '#f5b000', '#1e7e34', '#a82323', '#f0f3f6'];
    this.jeansPalette = ['#4a6fa5', '#202c39', '#2b2d42', '#b89f72'];
    this.shoesPalette = ['#8a2323', '#111111', '#ffffff', '#2c3e50'];

    this.onChangeCallbacks = [];
  }

  subscribe(callback) {
    this.onChangeCallbacks.push(callback);
  }

  notify() {
    for (const cb of this.onChangeCallbacks) {
      cb(this.getData());
    }
  }

  setName(val) {
    this.name = val.trim() || 'Player';
    this.notify();
  }

  setSkinTone(hex) {
    this.skinTone = hex;
    this.notify();
  }

  setShirtColor(hex) {
    this.shirtColor = hex;
    this.notify();
  }

  setJeansColor(hex) {
    this.jeansColor = hex;
    this.notify();
  }

  setShoesColor(hex) {
    this.shoesColor = hex;
    this.notify();
  }

  getData() {
    return {
      name: this.name,
      gender: this.gender,
      skinTone: this.skinTone,
      shirtColor: this.shirtColor,
      jeansColor: this.jeansColor,
      shoesColor: this.shoesColor
    };
  }
}

