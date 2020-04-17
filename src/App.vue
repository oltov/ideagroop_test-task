<template>
  <div>
    <h1 class="common__title">Table UI</h1>
    <TableHeader />
  </div>
</template>

<script>
import TableHeader from './components/TableHeader.vue';

export default {
  name: 'App',
  components: {
    TableHeader,
  },
};
</script>
