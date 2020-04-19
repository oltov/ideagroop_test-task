import Vue from 'vue';
import Vuex from 'vuex';
import _findIndex from 'lodash/findIndex';

import { getProducts, deleteProducts } from '../../public/request';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    products: [],
    selectedProducts: [],
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
        isError: false,
        serverMassege: '',
      },
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
      state.responseFromServer.deleteResponse.isError = status.isError;
      state.responseFromServer.deleteResponse.serverMassege = status.serverMassege;
    },
    changeIsDelete(state) {
      state.responseFromServer.deleteResponse.isDeleted = false;
    },
    changeIsError(state) {
      state.responseFromServer.deleteResponse.isError = false;
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
    deleteApiData(state) {
      state.selectedProducts.forEach((id) => {
        state.products.forEach((item, index) => {
          if (item.id === id) {
            state.products.splice(index, 1);
          }
        });
      });
    },
    addSelectedProduct(state, id) {
      const index = _findIndex(state.selectedProducts, (item) => (item === id));
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(id);
      }
    },
    clearSelectedProducts(state) {
      state.selectedProducts = [];
    },
  },
  actions: {
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
          commit('refreshDeleteResponse', { isError: false, serverMassege: resolve.message });
          commit('clearSelectedProducts');
        })
        .catch((reject) => {
          commit('refreshDeleteResponse', { isError: true, serverMassege: reject.error });
        });
    },
  },
});
