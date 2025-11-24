import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "../schema/event.schema";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<Event>
    ) { }

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

}
