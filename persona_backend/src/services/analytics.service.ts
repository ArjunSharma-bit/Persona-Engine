import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "../schema/event.schema";
import { Client } from "pg";


@Injectable()
export class AnalyticsService {
    private pg: Client;
    constructor(
        @InjectModel(Event.name) private eventModel: Model<Event>
    ) {
        this.pg = new Client({
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
        })
        this.pg.connect();
    }

    async CountByType() {
        return this.eventModel.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }

    async userTimeline(userId: string) {
        return this.eventModel.find({ userId }).sort({ timestamp: -1 })
    }

    async dailyCount() {
        return this.eventModel.aggregate([
            {
                $addFields: {
                    date: { $toDate: "$timestamp" }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$date" },
                        month: { $month: "$date" },
                        year: { $year: "$date" },
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1, "_id.month": 1, "_id.day": 1
                }
            }
        ]);
    }

    async topCategories() {
        return this.eventModel.aggregate([
            { $match: { type: "product_view" } },
            { $group: { _id: "$data.category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }

    async funnel(userId: string) {
        const events = await this.eventModel
            .find({ userId })
            .sort({ timestamp: 1 })

        return {
            viewed: events.some(e => e.type === "product_view"),
            addedToCart: events.some(e => e.type === "add_to_cart"),
            purchased: events.some(e => e.type === "purchase"),

        }
    }
    async getSqlDailyEvents() {
        const result = await this.pg.query(
            "SELECT * FROM daily_events ORDER BY date DESC LIMIT 30"
        );
        return result.rows;
    }

    async getSqlCategoryStats() {
        const result = await this.pg.query(
            "SELECT * FROM category_stats ORDER BY date DESC LIMIT 50"
        );
        return result.rows;
    }

    async getSqlRevenue() {
        const result = await this.pg.query(
            "SELECT * FROM revenue_daily ORDER BY date DESC LIMIT 30"
        );
        return result.rows;
    }

}
