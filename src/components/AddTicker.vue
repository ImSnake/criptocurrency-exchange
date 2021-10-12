<template>
  <section>
    <div class="flex justify-between">
      <div class="max-w-xs">
        <label
          for="add-currency"
          class="block text-sm font-medium text-gray-700"
          >Добавить криптовалюту</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="ticker = ticker.toUpperCase()"
            @keydown.enter="addTicker"
            type="text"
            name="wallet"
            id="add-currency"
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
      <button
        @click="addTicker"
        type="button"
        class="
          my-4
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
        <svg
          class="-ml-0.5 mr-2 h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="#ffffff"
        >
          <path
            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          ></path>
        </svg>
        Добавить
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "add-ticker",

  emits: ["addTicker"],

  data() {
    return {
      ticker: ""
    };
  },

  methods: {
    addTicker() {
      this.$emit("addTicker", this.ticker);
      this.ticker = "";
    }
  },

  computed: {}
};
</script>

<style scoped></style>
