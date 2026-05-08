<script setup lang="ts">
import { useRoute } from 'vue-router';

// This is how we get the ID from the URL in Vue
const route = useRoute();
const taskId = route.params.id;
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Task Details</h1>
    <p>Viewing details for task: {{ taskId }}</p>
  </div>
</template>
