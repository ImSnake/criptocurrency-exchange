<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div ref="appWidth" class="container">
      <div class="w-full my-4"></div>

      <add-ticker @add-ticker="add"></add-ticker>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="block text-sm font-medium text-gray-700">
          Количество криптовалют в списке: {{ tickers.length }}
        </div>
        <dl class="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="[
              selectedTicker === t ? 'ticker-selected' : 'ticker-default'
            ]"
            class="
              bg-white
              border-4
              overflow-hidden
              shadow
              cursor-pointer
              rounded-lg
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
        <br />
        <div v-if="tickers.length > 6" class="flex justify-between">
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Назад
          </button>
          <button
            v-else
            style="opacity: 0.5; cursor: default"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
            "
          >
            Назад
          </button>
          <button
            @click="page = page + 1"
            v-if="hasNextPage"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Вперед
          </button>
          <button
            v-else
            style="opacity: 0.5; cursor: default"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
            "
          >
            Вперед
          </button>
        </div>
        <br />
        <div class="max-w-xs">
          <label for="filter" class="block text-sm font-medium text-gray-700"
            >Найти в списке</label
          >
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              v-model="filter"
              type="text"
              name="wallet"
              id="filter"
              class="
                block
                w-full
                pr-10
                border-gray-300
                text-gray-900
                focus:outline-none focus:ring-gray-500 focus:border-gray-500
                sm:text-sm
                rounded-md
              "
              placeholder="Например DOGE"
            />
          </div>
        </div>
        <br />
      </template>

      <hr class="w-full border-t border-gray-600 my-4" />

      <ticker-graph
        v-if="selectedTicker"
        @graph-close="selectedTicker = null"
        :graph="getGraphData"
        :barWidth="GRAPH_BAR_WIDTH"
      >
      </ticker-graph>
    </div>
  </div>
</template>

<script>
import {
  requestCurrencyList,
  subscribeToTicker,
  unsubscribeFromTicker
} from "./api";
import AddTicker from "@/components/AddTicker";
import TickerGraph from "@/components/TickerGraph";

export default {
  name: "App",

  components: { AddTicker, TickerGraph },

  setup() {
    const TICKERS_PER_PAGE = 6;
    const GRAPH_BAR_WIDTH = 30;
    const GRAPH_MAX_BAR_COUNT = 50;

    return { TICKERS_PER_PAGE, GRAPH_BAR_WIDTH, GRAPH_MAX_BAR_COUNT };
  },

  data() {
    return {
      currencyList: [],
      tickers: [],
      selectedTicker: null,

      graph: [],

      filter: "",
      page: 1
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["filter", "page"];

    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    this.getCurrencyList();

    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, newPrice =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }
  },

  methods: {
    getCurrencyList() {
      const gclResponse = requestCurrencyList();
      gclResponse.then(tickers => {
        this.currencyList = Object.keys(tickers.Data);
        console.log(tickers);
        console.log(this.currencyList);
      });
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    updateTicker(tickerName, price) {
      const count = this.GRAPH_MAX_BAR_COUNT;
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          t.price = price;
          const tickerGraph = this.graph.find(function(obj) {
            if (obj.name === t.name) {
              obj.data.length <= count
                ? obj.data.push(t.price)
                : obj.data.shift();
              return true;
            }
          });
          if (tickerGraph === undefined) {
            this.graph.push({ name: t.name, data: [t.price] });
          }
        });
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      price > 1 ? price.toFixed(2) : price.toPrecision(2);
      return new Intl.NumberFormat().format(price);
    },

    add(ticker) {
      console.log(this.currencyList.filter(t => t === ticker));
      console.log(!this.currencyList.filter(t => t === ticker).length);

      if (this.tickers.find(t => t.name === ticker)) {
        console.log(`Ticker with code ${ticker} has already in the list!`);
        return;
      }

      if (!this.currencyList.filter(t => t === ticker).length) {
        console.log(`Ticker with code ${ticker} does not exist!`);
        return;
      }

      const currentTicker = {
        name: ticker,
        price: "-"
      };

      this.tickers = [...this.tickers, currentTicker];

      this.filter = "";
      this.page = 1;

      subscribeToTicker(currentTicker.name, newPrice =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter(t => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
      this.graph = this.graph.filter(t => t.name !== tickerToRemove.name);
    }
  },

  watch: {
    tickers() {
      this.tickers.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },

  computed: {
    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    startIndex() {
      return (this.page - 1) * this.TICKERS_PER_PAGE;
    },

    endIndex() {
      return this.page * this.TICKERS_PER_PAGE;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    },

    getGraphData() {
      return (
        this.graph.find(t => t.name === this.selectedTicker.name) || {
          name: this.selectedTicker.name,
          data: []
        }
      );
    }
  }
};
</script>

<style>
.ticker-selected {
  border-color: rgba(91, 33, 182, 1);
}
.ticker-default {
  border-color: rgba(243, 244, 246, 1);
}
</style>
