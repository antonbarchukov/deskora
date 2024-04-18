<template>
    <DefaultHeader v-if="isAuthenticated" />
    <router-view />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

import DefaultHeader from "./components/DefaultHeader.vue";

const store = useStore();

const isAuthenticated = computed(() => store.state.isAuthenticated);
</script>

<style></style>
