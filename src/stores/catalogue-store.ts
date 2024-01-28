import { defineStore } from 'pinia';
import { Product } from 'src/components/models';

function compare(sortBy: string, a: Product, b: Product): number {
  switch (sortBy) {
    case 'NAME':
      return a.name > b.name ? 1 : -1;
    case 'PRICE':
      return a.price - b.price;
    case 'PRICE_PER_UNIT':
      return a.pricePerUnitValue - b.pricePerUnitValue;
    case 'BRAND':
      return a.brand > b.brand ? 1 : -1;
    default:
      return a.code > b.code ? 1 : -1;
  }
}

function sort(
  sortBy: string,
  descending: boolean,
  a: Product,
  b: Product
): number {
  if (descending) {
    return -compare(sortBy, a, b);
  }
  return compare(sortBy, a, b);
}

function match(a: Product, search: string) {
  if (search === '') {
    return true;
  }
  const name = (a.name + ' ' + a.brand).toLowerCase();
  const words = search
    .toLowerCase()
    .split(' ')
    .filter((w) => w.trim().length > 0);
  for (const word of words) {
    if (name.indexOf(word) === -1) {
      return false;
    }
  }
  return true;
}

export const useCatalogueStore = defineStore('catalogue', {
  state: () => ({
    products: new Array<Product>(),
    loaded: false,
  }),
  getters: {
    getAll(): Product[] {
      return this.products;
    },
    getPage: (state) => {
      return (
        page: number,
        pageSize: number,
        sortBy: string,
        descending: boolean,
        search: string
      ) => {
        console.log('search ', page, pageSize, sortBy, descending, search);
        //const filtered = [...state.products];
        const filtered = state.products.filter((p) => match(p, search));
        filtered.sort((a, b) => sort(sortBy, descending, a, b));

        const subset = filtered.slice(page * pageSize, (page + 1) * pageSize);
        return subset;
      };
    },
    size: (state) => {
      return (search: string) => {
        return state.products.filter((p) => match(p, search)).length;
      };
    },
  },
  actions: {
    addAll(products: Array<Product>) {
      this.products.push(...products);
    },
  },
});

async function load() {
  const response = await fetch('/unes.json');
  const catalogue = (await response.json()) as Product[];
  const store = useCatalogueStore();
  store.addAll(catalogue);
  store.loaded = true;
}

load();
