import Vue from 'vue';
import Vuex from 'vuex';
import { getProducts, deleteProducts } from '../../public/request';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    products: [],
    tableHeadings: [
      {
        isActive: true,
        name: 'Product (100g serving)',
        value: 'product',
      },
      {
        isActive: false,
        name: 'Calories',
        value: 'calories',
      },
      {
        isActive: false,
        name: 'Fat (g)',
        value: 'fat',
      },
      {
        isActive: false,
        name: 'Carbs (g)',
        value: 'carbs',
      },
      {
        isActive: false,
        name: 'Protein (g)',
        value: 'protein',
      },
      {
        isActive: false,
        name: 'Iron (%)',
        value: 'iron',
      },
    ],
    isSortAscending: false,
    responseFromServer: {
      getResponse: {
        isLoading: true,
        serverMassege: '',
      },
      deleteResponse: {
        isLoading: true,
        serverMassege: '',
      },
    },
  },
  getters: {
    doneTodos(state) {
      return state.tableHeadings;
    },
  },
  mutations: {
    refreshApiData(state, data) {
      state.products = data;
    },
    refreshGetResponse(state, status) {
      state.responseFromServer.getResponse.isLoading = status.isLoading;
      state.responseFromServer.getResponse.serverMassege = status.serverMassege;
    },
    refreshDeleteResponse(state, status) {
      state.responseFromServer.deleteResponse.isLoading = status.isLoading;
      state.responseFromServer.deleteResponse.serverMassege = status.serverMassege;
    },
    // сортировка данных по убыванию(if) и возрастанию(else)
    dataSorting(state, field) {
      if (state.isSortAscending) {
        state.products.sort((a, b) => (a[field] > b[field] ? -1 : 1));
        state.isSortAscending = false;
      } else {
        state.products.sort((a, b) => (a[field] > b[field] ? 1 : -1));
        state.isSortAscending = true;
      }
    },
    deleteApiData(state, arr) {
      arr.forEach((id) => {
        state.products.forEach((item, index) => {
          if (item.id === id) {
            state.products.splice(index, 1);
          }
        });
      });
    },
  },
  actions: {
    // метод получает данные и вызывает мутацию refreshApiData
    getData({ commit }) {
      getProducts()
        .then((json) => {
          commit('refreshApiData', json);
          commit('refreshGetResponse', { isLoading: true, serverMassege: '' });
        })
        .catch((reject) => {
          commit('refreshGetResponse', { isLoading: false, serverMassege: reject.error });
        });
    },
    // метод удаляет данные и вызывает мутацию deleteApiData
    deleteData({ commit }, data) {
      deleteProducts()
        .then((resolve) => {
          commit('deleteApiData', data);
          commit('refreshDeleteResponse', { isLoading: true, serverMassege: resolve.message });
        })
        .catch((reject) => commit('refreshDeleteResponse', { isLoading: false, serverMassege: reject.error }));
    },
  },
});
