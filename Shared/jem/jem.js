jem = {
    assertRenderer: null,
    newTickers: [],
    tickers: [],
    expiredTickers: [],

    setAssertRenderer: function(renderer) {
        this.assertRenderer = renderer;
    },

    assert: function(test, message) {
        if (!test) {
            console.log(message);

            if (this.assertRenderer) {
                this.assertRenderer.render(message);
            }

            debugger;
        }
    },

    addTicker: function(ticker) {
        this.newTickers.push(ticker);
    },

    removeTicker: function(ticker) {
        this.expiredTickers.push(ticker);
    },

    tick: function(dt) {
        this.expiredTickers.forEach((ticker) => {
            if (this.tickers.indexOf(ticker) >= 0) {
                jem.Utils.removeElement(this.tickers, ticker, true);
            }
        });
        this.expiredTickers.length = 0;

        this.newTickers.forEach((ticker) => {
            if (this.tickers.indexOf(ticker) < 0) {
                this.tickers.push(ticker);
            }
        });
        this.newTickers.length = 0;

        this.tickers.forEach((ticker) => {
            ticker.update(dt);
        });
    },
};