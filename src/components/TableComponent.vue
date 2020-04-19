<template>
<div>
  <div class="control-panel">
    <!-- блок с кнопками сортировки -->
    <div class="sort-buttons">
      <span class="sort-buttons__title">Sorting by:</span>
      <ul class="sort-buttons__list">
        <li
          v-for="(item, index) in sortButtons"
          :key="index"
          class="sort-buttons__item"
        >
          <button
            class="buttons"
            :class="{'buttons--active': item.isActive}"
            @click="setActiveButton(item)"
          >
            {{ item.name }}
          </button>
        </li>
      </ul>
    </div>

    <!-- блок с пагинацией и селектами -->
    <div class="control-panel__controls">

      <!-- кнопка удаления продуктов -->

      <div class="control-panel__inner">
        <button
          class="buttons buttons--delete"
          :class="{'buttons--active': selectedProducts.length > 0}"
          :disabled="!selectedProducts.length"
          @click="popupIsOn = true"
        >
          Delete {{ `\(${selectedProducts.length}\)` }}
        </button>
      </div>

      <!-- селект для колличества продуктов на странице -->

      <div class="control-panel__select">
        <select
          v-model="productsPerPage"
          class="select"
          @change="resetDeleteList"
          :disabled="!dataLoadingIsError.getResponse.isLoading"
        >
          <option value="10">10 Per Page</option>
          <option value="15">15 Per Page</option>
          <option value="20">20 Per Page</option>
        </select>
      </div>

      <!-- блок с пагинацией -->

      <div class="control-panel__pagination">
        <button
          @click="pageFlipping('prev')"
          class="buttons buttons__pagination buttons__pagination--left"
          :disabled="currentPageIndex <= 1"
        ></button>
        <span class="control-panel__pagination-text">
          {{ minProductNumberPerPage }} - {{ maxProductNumberPerPage }} of {{ numberProducts }}
        </span>
        <button
          @click="pageFlipping('next')"
          class="buttons buttons__pagination buttons__pagination--right"
          :disabled="currentPageIndex >= lengthTableData"
        ></button>
      </div>

      <!-- блок с выпадающим списком для выбора отоброжаемых колонок  -->

      <div class="control-panel__selection">
        <button
          class="buttons buttons__selection"
          @click="isColumnSelectionList = !isColumnSelectionList"
          :disabled="!dataLoadingIsError.getResponse.isLoading"
        >
          6 columns selected
        </button>
        <ul v-show="isColumnSelectionList" class="control-panel__selection-list">
          <li class="control-panel__selection-item">
            <input
              type="checkbox" id="all-products"
              @change="selectAllProducts($event.target.checked)"
              v-model="allColumnsCheck"
              class="check check__input--off"
            >
            <label
              for="all-products"
              class="check check__lable check__lable--select"
            >
              <b>Select All</b>
            </label>
          </li>
          <li
            v-for="(item, index) in sortButtons"
            :key="index"
            class="control-panel__selection-item"
          >
            <input
              type="checkbox"
              :id="item.value"
              v-model="isVisibleProducts[item.value]"
              class="check check__input--off"
            >
            <label
              :for="item.value"
              class="check check__lable check__lable--select"
            >
              {{ item.name }}
            </label>
          </li>
        </ul>
      </div>
    </div>
  </div>

    <!-- таблица с продуктами -->
    <div>
      <table v-if="isShowTable && dataLoadingIsError.getResponse.isLoading" class="table">

        <!-- ============ -->

        <thead>
          <tr class="table__head">
            <th>
              <input
                type="checkbox"
                id="all-prod"
                class="check check__input--off"
                :ref="5454"
                @change="addAllSelectedProducts($event.target.checked)"
              >
              <label for="all-prod" class="check check__lable check__lable--product"></label>
            </th>
            <th
              class="table__head-name"
              v-for="(item, index) in columnHeadings" :key="index"
              v-on="setSortingHandler(item.value, index)"
              v-show="isVisibleProducts[item.value]"
            >
             {{ item.name }}
            </th>
          </tr>
        </thead>

        <!-- ============= -->

        <tbody>
          <tr
            class="table__body"
            v-for="(item, index) in tableData" :key="index"
            @click.stop="chooseProduct(item.id)"
          >
            <td class="table__head">
              <input
                type="checkbox"
                :id="item.id"
                :ref="item.id"
                class="check check__input--off"
                @click.stop="addSelectedProduct(item.id)"
                v-model="markedProducts[item.id]"
              >
              <label
                :for="item.id"
                class="check check__lable check__lable--product"
              ></label>
            </td>
            <td v-show="isVisibleProducts[headings[0]]"> {{ item[headings[0]] }} </td>
            <td v-show="isVisibleProducts[headings[1]]"> {{ item[headings[1]] }} </td>
            <td v-show="isVisibleProducts[headings[2]]"> {{ item[headings[2]] }} </td>
            <td v-show="isVisibleProducts[headings[3]]"> {{ item[headings[3]] }} </td>
            <td v-show="isVisibleProducts[headings[4]]"> {{ item[headings[4]] }} </td>
            <td v-show="isVisibleProducts[headings[5]]"> {{ item[headings[5]] }} </td>
            <td class="table__bucket" >
              <span
                :class="{'buttons--delete--on': markedProducts[item.id]}"
                class="buttons buttons--delete--off"
              >
                Delete
              </span>
            </td>
          </tr>
        </tbody>

        <!-- ============= -->

      </table>
      <div
        v-else-if="!isShowTable && dataLoadingIsError.getResponse.isLoading"
        class="modal__no-columns"
      >
          <p>Не выбранно ни одной категории для отображения,</p>
          <p>пожалуйста выберите из списка колонок нужную категорию.</p>
      </div>
      <div
        v-else-if="!dataLoadingIsError.getResponse.isLoading"
        class="modal__no-columns"
      >
        <p>
          При получении данных произошла ошибка:
          {{ dataLoadingIsError.getResponse.serverMassege }},
        </p>
        <p>пожалуйста перезагрузите страницу.</p>
      </div>
    </div>

    <!-- попап для подтверждения удаления -->

    <div>
      <div v-if="popupIsOn" class="modal">
        <p class="modal__title">Are you sure you want to <b>delete item?</b></p>
        <button class="buttons buttons--modal" @click="popupIsOn = false">Cancel</button>
        <button
          class="buttons buttons--active buttons--modal"
          @click="initiateDataDeletion"
        >
          Confirm</button>
      </div>
      <div v-if="errorDelete.deleteResponse.isError" class="modal modal--fone">
        <div class="modal modal--error-massage">
          <p>
            При удалении данных произошла ошибка:
            {{ dataLoadingIsError.deleteResponse.serverMassege }},
          </p>
          <p>повторите попытку удаления позже.</p>
          <button
            class="buttons buttons--active"
            @click="chengeError"
          >OK</button>
        </div>
        <div class="modal modal--fone"></div>
        </div>
    </div>
</div>
</template>

<script>
import {
  mapState,
  mapActions,
  mapMutations,
} from 'vuex';
import _chunk from 'lodash/chunk';
import _forIn from 'lodash/forIn';
import _findIndex from 'lodash/findIndex';

export default {
  name: 'TableHeader',
  data() {
    return {
      headings: [
        'product',
        'calories',
        'fat',
        'carbs',
        'protein',
        'iron',
      ],
      productsPerPage: 10,
      currentPageIndex: 1,
      isVisibleProducts: {
        'product': true,
        'calories': true,
        'fat': true,
        'carbs': true,
        'protein': true,
        'iron': true,
      },
      selectedProducts: [],
      isShowTable: true,
      allColumnsCheck: true,
      popupIsOn: false,
      isColumnSelectionList: false,
      sortButtons: null,
      columnHeadings: null,
      markedProducts: {},
    };
  },
  computed: {
    ...mapState(['tableHeadings', 'errorTextFromServer']),
    tableData() {
      return _chunk(this.$store.state.products, this.productsPerPage)[[this.currentPageIndex - 1]];
    },
    lengthTableData() {
      return this.$store.state.products.length / this.productsPerPage;
    },
    numberProducts() {
      return this.$store.state.products.length;
    },
    minProductNumberPerPage() {
      return (this.currentPageIndex * this.productsPerPage) - (this.productsPerPage - 1);
    },
    maxProductNumberPerPage() {
      return this.currentPageIndex * this.productsPerPage;
    },
    dataLoadingIsError() {
      return this.$store.state.responseFromServer;
    },
    errorDelete() {
      if (this.$store.state.responseFromServer.deleteResponse.isDeleted) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.selectedProducts = [];
        this.changeIsDelete();
      }
      return this.$store.state.responseFromServer;
    },
  },
  watch: {
    tableData() {

      // markedProducts объект для хранения состояния(check) продуктов, для v-model
      // привязка будет по id продукта, переопределяется при каждой загрузке
      this.markedProducts = {};

      this.tableData.forEach((item) => {

        const product = { ...item };
        this.markedProducts[product.id] = false;
      });
    },
  },
  methods: {
    // переопределение активного состояния кнопок
    // в соответствии с нажатой кнопкой
    setActiveButton(item) {
      this.sortButtons.forEach((el) => {
        if (el.name === item.name) {
          // eslint-disable-next-line no-param-reassign
          el.isActive = true;
        } else {
          // eslint-disable-next-line no-param-reassign
          el.isActive = false;
        }
      });
      // вызов метода для определения сортировочной колонки
      // в соответствии с кнопкой сортировки
      this.reRenderColumns(item);
    },
    reRenderColumns(name) {
      this.columnHeadings.forEach((el, index) => {

        // условие: если входящий и текущий элементы равны
        // и при этом текущий элемент не первый в массиве
        if (el.name === name.name && this.columnHeadings[0].name !== el.name) {

          // удаляем и сохраняем первый елемент, вставляем на его место текущий елемент
          const firstElement = this.columnHeadings.splice(0, 1, el);

          // удаляем из массива текущий элемент с прежнего индекса,
          // сейчас их 2, el[0] === el[index]
          this.columnHeadings.splice(index, 1);

          // пушим элемент который был удален с нулевого индекса
          this.columnHeadings.push(...firstElement);

          // пересобираем массив с заголовками,
          // что бы колонки соответствовали заголовкам
          this.headings = [];
          this.columnHeadings.forEach((element) => {
            this.headings.push(element.value);
          });
        }
      });
    },
    changeState(value) {
      this.$store.commit('dataSorting', value);
    },
    pageFlipping(value) {
      if (value === 'prev') {
        this.currentPageIndex -= 1;
      }
      if (value === 'next') {
        this.currentPageIndex += 1;
      }
    },
    // перебираем все продукты и переопределяем значение на (false / true)
    // нужно для работы v-show при отрисовки колонок таблицы
    selectAllProducts(checkedValue) {
      _forIn(this.isVisibleProducts, (value, key) => {
        this.isVisibleProducts[key] = checkedValue;
      });
    },
    // заполнение массива с id продукта, для удаления из списка продуктов
    // сначала проверяем наличие id в массиве, если есть, то удаляем id
    // если нет, то пушим в массив (юзер делает check/uncheck по продукту)
    addSelectedProduct(id) {
      const index = _findIndex(this.selectedProducts, (item) => (item === id));

      if (index > -1) {
        this.selectedProducts.splice(index, 1);
      } else {
        this.selectedProducts.push(id);
      }
    },
    // собираем массив из всех выбранных продуктов (check all)
    // паралельно чекаем продукты из списка
    addAllSelectedProducts(check) {
      if (!check) {
        this.tableData.forEach((item) => {
          this.markedProducts[item.id] = false;
        });

        this.selectedProducts = [];

      } else {

        this.selectedProducts = [];

        this.tableData.forEach((item) => {
          this.selectedProducts.push(item.id);
          this.markedProducts[item.id] = true;
        });
      }
    },
    // генерация клика по инпуту в выбранной строке таблицы
    chooseProduct(id) {
      this.$refs[id][0].click();
    },
    // инициализация удаления продуктов из таблицы
    initiateDataDeletion() {
      // вызов экшена и передача ему массива с id выбранных продуктов
      this.deleteData(this.selectedProducts);
      this.popupIsOn = false;
    },
    // eslint-disable-next-line consistent-return
    // установка обработчика только на 1 колонку, чтобы остальные не сортировались
    setSortingHandler(value, index) {
      if (index === 0) {
        return { 'click': () => { this.changeState(value); } };
      }
      return {};
    },
    resetDeleteList() {
      if (this.selectedProducts.length) {
        this.selectedProducts = [];
      }
    },
    columnVisibilityManagement() {
      const numberOfColumns = Object.keys(this.isVisibleProducts).length;
      let numberNotSelectedColumns = 0;

      _forIn(this.isVisibleProducts, (value) => {
        if (value === false) numberNotSelectedColumns += 1;
      });

      if (numberNotSelectedColumns === numberOfColumns) {
        this.isShowTable = false;
      }

      else if (numberNotSelectedColumns < numberOfColumns && numberNotSelectedColumns > 0) {
        this.allColumnsCheck = false;
        this.isShowTable = true;
      }

      else {
        this.allColumnsCheck = true;
        this.isShowTable = true;
      }
    },
    chengeError() {
      this.changeIsError();
    },
    ...mapActions(['getData', 'deleteData']),
    ...mapMutations(['changeIsDelete', 'changeIsError']),
  },
  created() {
    this.getData();
  },
  mounted() {
    this.sortButtons = [...this.tableHeadings];
    this.columnHeadings = [...this.tableHeadings];
    this.$watch('isVisibleProducts', this.columnVisibilityManagement, { deep: true });
  },
};
</script>
