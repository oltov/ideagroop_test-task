<template>
  <div>
    <h1 class="common__title">Table UI</h1>
    <TableComponent />
  </div>
</template>

<script>
import TableComponent from './components/TableComponent.vue';

export default {
  name: 'App',
  components: {
    TableComponent,
  },
};
</script>
