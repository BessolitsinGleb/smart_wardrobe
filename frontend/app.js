const { createApp } = Vue;

const CLOTHING_TYPES = [
  { value: 'tshirt',      label: 'Футболка',    emoji: '👕' },
  { value: 'shirt',       label: 'Рубашка',     emoji: '👔' },
  { value: 'hoodie',      label: 'Худи',        emoji: '🧥' },
  { value: 'sweater',     label: 'Свитер',      emoji: '🧶' },
  { value: 'jacket',      label: 'Куртка',      emoji: '🥼' },
  { value: 'coat',        label: 'Пальто',      emoji: '🧥' },
  { value: 'pants',       label: 'Брюки',       emoji: '👖' },
  { value: 'jeans',       label: 'Джинсы',      emoji: '👖' },
  { value: 'shorts',      label: 'Шорты',       emoji: '🩳' },
  { value: 'dress',       label: 'Платье',      emoji: '👗' },
  { value: 'skirt',       label: 'Юбка',        emoji: '👗' },
  { value: 'shoes',       label: 'Обувь',       emoji: '👟' },
  { value: 'socks',       label: 'Носки',       emoji: '🧦' },
  { value: 'underwear',   label: 'Нижнее',      emoji: '🩲' },
  { value: 'hat',         label: 'Шапка/Кепка', emoji: '🎩' },
  { value: 'scarf',       label: 'Шарф',        emoji: '🧣' },
  { value: 'gloves',      label: 'Перчатки',    emoji: '🧤' },
  { value: 'bag',         label: 'Сумка',       emoji: '👜' },
  { value: 'accessories', label: 'Аксессуары',  emoji: '💍' },
];

const SEASONS = [
  { value: 'spring',     label: 'Весна',          emoji: '🌸' },
  { value: 'summer',     label: 'Лето',           emoji: '☀️' },
  { value: 'autumn',     label: 'Осень',          emoji: '🍂' },
  { value: 'winter',     label: 'Зима',           emoji: '❄️' },
  { value: 'all_season', label: 'Всесезонное',    emoji: '🌍' },
];

createApp({
  data() {
    return {
      // ── User ────────────────────────────────────────────────────────────
      currentUser: null,
      showCreateUser: false,
      creatingUser: false,
      createUserForm: { username: '', email: '', password: '' },
      createUserError: '',

      // ── Navigation ──────────────────────────────────────────────────────
      activeTab: 'wardrobe',

      // ── Wardrobe ────────────────────────────────────────────────────────
      clothes: [],
      seasonFilter: null,
      showUploadModal: false,
      uploadForm: this._freshUploadForm(),
      isUploading: false,
      uploadError: '',

      // ── Generate ────────────────────────────────────────────────────────
      generateForm: { season: '', occasion: '' },
      isGenerating: false,
      generatedOutfit: null,
      generateError: '',

      // ── History ─────────────────────────────────────────────────────────
      outfits: [],

      // ── Toast ────────────────────────────────────────────────────────────
      toast: null,
      _toastTimer: null,

      // ── Constants ────────────────────────────────────────────────────────
      clothingTypes: CLOTHING_TYPES,
      seasons: SEASONS,
    };
  },

  computed: {
    filteredClothes() {
      if (!this.seasonFilter) return this.clothes;
      return this.clothes.filter(
        c => c.season === this.seasonFilter || c.season === 'all_season'
      );
    },
  },

  async mounted() {
    const savedId = localStorage.getItem('sw_user_id');
    if (savedId) {
      try {
        const res = await fetch(`/api/users/${savedId}`);
        if (res.ok) {
          this.currentUser = await res.json();
          await this._loadUserData();
          return;
        }
      } catch (_) {}
      localStorage.removeItem('sw_user_id');
    }
    this.showCreateUser = true;
  },

  methods: {
    // ── Auth ──────────────────────────────────────────────────────────────

    async createUser() {
      this.createUserError = '';
      this.creatingUser = true;
      try {
        const res = await fetch('/api/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.createUserForm),
        });
        if (!res.ok) {
          const err = await res.json();
          this.createUserError = err.detail || 'Не удалось создать аккаунт';
          return;
        }
        this.currentUser = await res.json();
        localStorage.setItem('sw_user_id', this.currentUser.id);
        this.showCreateUser = false;
        this.showToast('Аккаунт создан! Добро пожаловать ✨', 'success');
        await this._loadUserData();
      } catch (_) {
        this.createUserError = 'Ошибка сети. Попробуй снова.';
      } finally {
        this.creatingUser = false;
      }
    },

    logout() {
      localStorage.removeItem('sw_user_id');
      this.currentUser = null;
      this.clothes = [];
      this.outfits = [];
      this.generatedOutfit = null;
      this.createUserForm = { username: '', email: '', password: '' };
      this.showCreateUser = true;
    },

    // ── Clothes ───────────────────────────────────────────────────────────

    async fetchClothes() {
      const res = await fetch(`/api/clothes/user/${this.currentUser.id}`);
      if (res.ok) this.clothes = await res.json();
    },

    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.uploadForm.file = file;
      const reader = new FileReader();
      reader.onload = e => { this.uploadForm.preview = e.target.result; };
      reader.readAsDataURL(file);
    },

    onDrop(event) {
      const file = event.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      this.uploadForm.file = file;
      const reader = new FileReader();
      reader.onload = e => { this.uploadForm.preview = e.target.result; };
      reader.readAsDataURL(file);
    },

    async uploadClothes() {
      if (!this.uploadForm.file) { this.uploadError = 'Выбери изображение'; return; }
      if (!this.uploadForm.name.trim()) { this.uploadError = 'Введи название'; return; }
      this.isUploading = true;
      this.uploadError = '';
      try {
        const fd = new FormData();
        fd.append('user_id', this.currentUser.id);
        fd.append('name', this.uploadForm.name.trim());
        fd.append('clothing_type', this.uploadForm.clothing_type);
        fd.append('season', this.uploadForm.season);
        if (this.uploadForm.color) fd.append('color', this.uploadForm.color);
        if (this.uploadForm.brand) fd.append('brand', this.uploadForm.brand);
        if (this.uploadForm.comment) fd.append('comment', this.uploadForm.comment);
        fd.append('rating', this.uploadForm.rating);
        fd.append('file', this.uploadForm.file);

        const res = await fetch('/api/clothes/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json();
          this.uploadError = err.detail || 'Ошибка загрузки';
          return;
        }
        const item = await res.json();
        this.clothes.unshift(item);
        this.closeUploadModal();
        this.showToast(`«${item.name}» добавлена в гардероб!`, 'success');
      } catch (_) {
        this.uploadError = 'Ошибка сети. Попробуй снова.';
      } finally {
        this.isUploading = false;
      }
    },

    async deleteClothes(item) {
      if (!confirm(`Удалить «${item.name}» из гардероба?`)) return;
      const res = await fetch(`/api/clothes/${item.id}?user_id=${this.currentUser.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        this.clothes = this.clothes.filter(c => c.id !== item.id);
        this.showToast(`«${item.name}» удалена`, 'info');
      }
    },

    closeUploadModal() {
      this.showUploadModal = false;
      this.uploadForm = this._freshUploadForm();
      this.uploadError = '';
    },

    // ── Outfits ───────────────────────────────────────────────────────────

    async generateOutfit() {
      this.isGenerating = true;
      this.generateError = '';
      this.generatedOutfit = null;
      try {
        const res = await fetch('/api/outfits/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: this.currentUser.id,
            season: this.generateForm.season || null,
            occasion: this.generateForm.occasion || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          this.generateError = err.detail || 'Не удалось создать аутфит';
          return;
        }
        this.generatedOutfit = await res.json();
        this.outfits.unshift(this.generatedOutfit);
        this.showToast('Аутфит готов! 🎉', 'success');
      } catch (_) {
        this.generateError = 'Ошибка сети. Попробуй снова.';
      } finally {
        this.isGenerating = false;
      }
    },

    async fetchOutfits() {
      const res = await fetch(`/api/outfits/user/${this.currentUser.id}`);
      if (res.ok) this.outfits = await res.json();
    },

    async deleteOutfit(outfit) {
      if (!confirm('Удалить этот аутфит?')) return;
      const res = await fetch(`/api/outfits/${outfit.id}?user_id=${this.currentUser.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        this.outfits = this.outfits.filter(o => o.id !== outfit.id);
        if (this.generatedOutfit?.id === outfit.id) this.generatedOutfit = null;
        this.showToast('Аутфит удалён', 'info');
      }
    },

    // ── Helpers ───────────────────────────────────────────────────────────

    getTypeEmoji(type) { return CLOTHING_TYPES.find(t => t.value === type)?.emoji ?? '👕'; },
    getTypeLabel(type) { return CLOTHING_TYPES.find(t => t.value === type)?.label ?? type; },
    getSeasonEmoji(season) { return SEASONS.find(s => s.value === season)?.emoji ?? ''; },
    getSeasonLabel(season) { return SEASONS.find(s => s.value === season)?.label ?? season; },

    ratingGradient(r) {
      if (r >= 8) return 'linear-gradient(135deg,#10b981,#059669)';
      if (r >= 5) return 'linear-gradient(135deg,#f59e0b,#d97706)';
      return 'linear-gradient(135deg,#ef4444,#dc2626)';
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    showToast(message, type = 'info') {
      if (this._toastTimer) clearTimeout(this._toastTimer);
      this.toast = { message, type };
      this._toastTimer = setTimeout(() => { this.toast = null; }, 3500);
    },

    _freshUploadForm() {
      return { name: '', clothing_type: 'tshirt', season: 'all_season', color: '', brand: '', comment: '', rating: 5, file: null, preview: null };
    },

    async _loadUserData() {
      await Promise.all([this.fetchClothes(), this.fetchOutfits()]);
    },
  },
}).mount('#app');
