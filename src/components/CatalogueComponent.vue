<template>
  <q-table
    :rows="products"
    :columns="columns"
    row-key="CODE"
    :binary-state-sort="true"
    v-model:pagination="pagination"
    :filter="searchParams"
    :rows-per-page-options="[5, 10, 20, 50, 75, 100]"
    @request="onRequest"
    :loading="loading"
    :grid="true"
    class="col-12"
  >
    <template v-slot:top>
      <div class="row q-pa-md q-gutter-sm col">
        <div>
          <q-btn
            round
            text-color="red"
            outline
            :icon="searchParams.favorites ? 'favorite' : 'favorite_border'"
            v-model="searchParams.favorites"
            @click="searchParams.favorites = !searchParams.favorites"
          />
        </div>
        <q-input
          outlined
          v-model="searchParams.search"
          label="Search"
          debounce="100"
          class="col"
          clearable
        />
      </div>
    </template>
    <template v-slot:body-cell-CODE="props">
      <q-td :props="props">
        <div>
          <a
            :href="props.row.link"
            referrerpolicy="no-referrer"
            target="_blank"
          >
            {{ props.row.code }}
          </a>
        </div>
      </q-td>
    </template>
    <template v-slot:item="props">
      <div class="q-pa-xs col-xs-12 col-sm-12 col-md-6 col-xl-3">
        <q-card bordered flat>
          <q-card-section horizontal style="min-height: 130px">
            <q-img
              width="70px"
              :src="props.row.image"
              referrerpolicy="no-referrer"
            ></q-img>
            <q-card-section class="col">
              <div class="text-subtitle2">
                {{ props.row.name }}
              </div>
              <div>
                {{ props.row.brand }}
              </div>
              <div>
                {{ props.row.price }}€ ({{
                  props.row.pricePerUnitValue
                }}€/unità)
              </div>
            </q-card-section>

            <q-separator vertical />

            <q-card-actions vertical class="justify-center">
              <q-btn
                flat
                round
                color="primary"
                icon="shopping_cart"
                :href="props.row.link"
                target="_blank"
              />
              <product-favorite-component :code="props.row.code" />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Product } from './models';
import { useCatalogueStore } from 'src/stores/catalogue-store';
import ProductFavoriteComponent from './ProductFavoriteComponent.vue';

type Pagination = {
  sortBy: string;
  descending?: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
};

type TableFilter = {
  search: string;
  favorites: boolean;
};

const store = useCatalogueStore();

const loading = ref(false);

const products = ref<Array<Product>>(new Array<Product>());

const columns = [
  {
    name: 'CODE',
    label: 'Code',
    sortable: false,
    field: 'code',
  },
  {
    name: 'NAME',
    label: 'Nome',
    sortable: true,
    field: 'name',
  },
  {
    name: 'PRICE',
    label: 'Prezzo',
    sortable: true,
    field: 'price',
  },
  {
    name: 'PRICE_PER_UNIT',
    label: 'Prezzo unitario',
    sortable: true,
    field: 'pricePerUnitValue',
  },
  {
    name: 'BRAND',
    label: 'Brand',
    sortable: true,
    field: 'brand',
  },
];

const pagination = ref<Pagination>({
  sortBy: 'NAME',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const searchParams = ref<TableFilter>({
  search: '',
  favorites: false,
});

async function update(
  querySearchParams: TableFilter,
  queryPagination: Pagination
) {
  const descending =
    queryPagination.descending !== undefined
      ? queryPagination.descending
      : false;
  const res = store.getPage(
    queryPagination.page - 1,
    queryPagination.rowsPerPage,
    queryPagination.sortBy,
    descending,
    querySearchParams.search,
    querySearchParams.favorites
  );
  products.value.splice(0, products.value.length, ...res);
  pagination.value.rowsNumber = store.size(
    querySearchParams.search,
    querySearchParams.favorites
  );
  pagination.value.descending = queryPagination.descending;
  pagination.value.page = queryPagination.page;
  pagination.value.rowsPerPage = queryPagination.rowsPerPage;
  pagination.value.sortBy = queryPagination.sortBy;
}

async function onRequest(props: any): Promise<void> {
  loading.value = true;
  const { page, rowsPerPage, sortBy, descending } =
    props.pagination as Pagination;
  await update(searchParams.value, {
    page: page,
    rowsPerPage: rowsPerPage,
    sortBy: sortBy,
    descending: descending,
    rowsNumber: 0,
  });
  loading.value = false;
}

async function loadState() {
  loading.value = true;
  await update(searchParams.value, pagination.value);
  loading.value = false;
}

onMounted(async () => await loadState());

if (!store.loaded) {
  store.$subscribe((mutation, state) => {
    console.log('store state changed');
    loadState();
  });
}
</script>
