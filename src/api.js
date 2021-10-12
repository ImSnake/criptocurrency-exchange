const API_KEY =
  "20ac57ba82a89c09f0224c27a1134031dc678b674be9a8f15c62621d2b4b8026";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";
const tickersHandlers = new Map(); // {}

export const requestCurrencyList = () =>
  //fetch(`https://min-api.cryptocompare.com/data/blockchain/list?api_key=${API_KEY}`)
  fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?api_key=${API_KEY}`
  ).then(response => response.json());

socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

/*
//TODO refactor with using urlSearchParams
export const loadTicker = tickerName =>
  fetch(`https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`).then(r => r.json());*/
