<template>
  <q-btn
    flat
    round
    color="red"
    icon="favorite"
    v-if="favoriteProductStore.isFavorite(code)"
    @click="favoriteProductStore.change(code)"
  />
  <q-btn
    flat
    round
    color="red"
    icon="favorite_border"
    v-else
    @click="favoriteProductStore.change(code)"
  />
</template>

<script setup lang="ts">
import { useFavoriteProductStore } from 'src/stores/favorite-product-store';

interface Props {
  code: string;
}

withDefaults(defineProps<Props>(), {
  code: '',
});

const favoriteProductStore = useFavoriteProductStore();
</script>
