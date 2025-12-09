const axios = require("axios");

const API = "http://localhost:4000/api/events";

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(userId) {
    const types = ["product_view", "search", "add_to_cart", "purchase", "session_start"];
    const type = randomChoice(types);

    switch (type) {
        case "product_view":
            return {
                userId,
                type,
                data: {
                    productId: "p" + Math.floor(Math.random() * 500),
                    category: randomChoice(["shoes", "electronics", "books", "fashion", "laptop"]),
                },
            };
        case "search":
            return {
                userId,
                type,
                data: {
                    query: randomChoice(["shoes", "laptop", "iphone", "headphones", "books"]),
                },
            };
        case "add_to_cart":
            return {
                userId,
                type,
                data: {
                    productId: "p" + Math.floor(Math.random() * 500),
                    quantity: 1,
                    price: Math.floor(Math.random() * 3000),
                },
            };
        case "purchase":
            return {
                userId,
                type,
                data: {
                    orderId: "ord_" + Math.floor(Math.random() * 99999),
                    amount: Math.floor(Math.random() * 4000),
                    items: [],
                },
            };
        default:
            return { userId, type };
    }
}

async function run() {
    const USERS = 500;
    const EVENTS = 10000;

    for (let i = 0; i < EVENTS; i++) {
        const userId = "u" + Math.floor(Math.random() * USERS);
        const event = generateEvent(userId);

        axios.post(API, event).catch(() => { });

        if (i % 1000 === 0) {
            console.log("Sent", i, "events");
        }
    }
}

run();
