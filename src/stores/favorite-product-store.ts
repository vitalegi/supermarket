import { defineStore } from 'pinia';

export const useFavoriteProductStore = defineStore('favorite-product', {
  state: () => ({
    favorites: new Array<string>(),
    loaded: false,
  }),
  getters: {
    getAll(): string[] {
      return this.favorites;
    },
    isFavorite: (state) => {
      return (code: string) => {
        return state.favorites.filter((f) => f === code).length > 0;
      };
    },
  },
  actions: {
    change(code: string) {
      const index = this.favorites.indexOf(code);
      if (index === -1) {
        this.favorites.push(code);
      } else {
        this.favorites.splice(index, 1);
      }
      localStorage.setItem('FAVS', JSON.stringify(this.favorites));
    },
    addAll(favorites: Array<string>) {
      this.favorites.push(...favorites);
    },
  },
});

const store = useFavoriteProductStore();
const favs = localStorage.getItem('FAVS');
if (favs !== null) {
  try {
    store.addAll(JSON.parse(favs));
    store.loaded = true;
  } catch (e) {
    console.error('Failed to process favorites', favs, e);
  }
}
