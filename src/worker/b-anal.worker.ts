import mongoose from "mongoose";
import { Client } from "pg"
import { EventSchema } from "../schema/event.schema";
import * as cron from "node-cron";

async function runBatch() {
    console.log("Batch Analytics running.....");

    await mongoose.connect(process.env.MONGO_URL || "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/personalization?replicaSet=rs0")

    const Event = mongoose.model("Event", EventSchema)

    const pg = new Client({
        host: "postgres",
        user: "postgres",
        password: "postgres",
        database: "persona"
    });
    await pg.connect()

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // For Production
    // const yesterday = new Date(today);
    // yesterday.setDate(yesterday.getDate() - 1);

    // const start = yesterday.getTime();
    // const end = today.getTime()

    const start = today.getTime();
    const end = Date.now();

    //total events
    const totalEvents = await Event.countDocuments({
        createdAt: { $gte: new Date(start), $lt: new Date(end) }
    });


    await pg.query(
        "INSERT INTO daily_events(date, total_events) VALUES($1, $2) ON CONFLICT (date) DO UPDATE SET total_events=$2",
        [today, totalEvents]
    );

    const categoryAgg = await Event.aggregate([
        { $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
        {
            $group: {
                _id: "$data.category",
                views: { $sum: { $cond: [{ $eq: ["$type", "product_view"] }, 1, 0] } },
                purchases: { $sum: { $cond: [{ $eq: ["$type", "purchase"] }, 1, 0] } }
            }
        }
    ])

    for (const c of categoryAgg) {
        const category = c._id || "unknown";
        const views = Number(c.views) || 0;
        const purchases = Number(c.purchases || 0)
        await pg.query(
            `INSERT INTO category_stats(date, category, views, purchases)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (date, category) DO UPDATE SET views=$3, purchases=$4`,
            [today, category, views, purchases]
        );
    }
    const revenueAgg = await Event.aggregate([
        { $match: { type: "purchase", createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
        { $group: { _id: null, total: { $sum: "$data.amount" }, orders: { $sum: 1 } } }
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const orders = revenueAgg[0]?.orders || 0;

    await pg.query(
        "INSERT INTO revenue_daily(date, revenue, orders) VALUES($1, $2, $3) ON CONFLICT (date) DO UPDATE SET revenue=$2, orders=$3",
        [today, revenue, orders]
    );

    console.log("Batch analytics job completed!");

    await pg.end();
    await mongoose.disconnect();
}
cron.schedule("0 0 * * *", () => {
    runBatch();
    console.log("Running daily analytics job.... ")
})
runBatch().catch(console.error);