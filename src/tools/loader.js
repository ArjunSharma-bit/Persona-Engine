import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 50,
    duration: '20s',
};

export default function () {
    const users = ["u1", "u2", "u3", "u4", "u5"];
    const types = ["product_view", "search", "add_to_cart", "purchase"];

    const payload = JSON.stringify({
        userId: users[Math.floor(Math.random() * users.length)],
        type: types[Math.floor(Math.random() * types.length)],
        data: {
            productId: "p" + Math.floor(Math.random() * 200),
            category: "test"
        }
    });

    http.post("http://localhost:4000/api/events", payload, {
        headers: { "Content-Type": "application/json" },
    });

    sleep(0.01);
}
