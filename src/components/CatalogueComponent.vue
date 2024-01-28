<template>
  <q-table
    title="Unes"
    :rows="products"
    :columns="columns"
    row-key="CODE"
    :binary-state-sort="true"
    v-model:pagination="pagination"
    :filter="searchParams"
    :rows-per-page-options="[5, 10, 20, 50, 75, 100]"
    @request="onRequest"
    :loading="loading"
    :grid="$q.screen.xs"
  >
    <template v-slot:top-right>
      <div class="row q-gutter-md">
        <q-input outlined v-model="searchParams.name" label="Search" />
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
  </q-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Product } from './models';
import { useCatalogueStore } from 'src/stores/catalogue-store';

type Pagination = {
  sortBy: string;
  descending?: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
};

type TableFilter = {
  name?: string;
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
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const searchParams = ref<TableFilter>({});

async function update(
  querySearchParams: TableFilter,
  queryPagination: Pagination
) {
  const search = querySearchParams.name ? querySearchParams.name : '';
  const descending =
    queryPagination.descending !== undefined
      ? queryPagination.descending
      : false;
  const res = store.getPage(
    queryPagination.page - 1,
    queryPagination.rowsPerPage,
    queryPagination.sortBy,
    descending,
    search
  );
  products.value.splice(0, products.value.length, ...res);
  pagination.value.rowsNumber = store.size(search);
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
