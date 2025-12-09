import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { appLogger } from "../logger/logger.service";
import { LinearModel } from "./simp.interface";

@Injectable()
export class MlService {
    private churnModel: LinearModel | null = null;
    private affinityModel: any = null;

    constructor() {
        this.loadModels();
    }

    private loadModels() {
        const churnPath = path.join(__dirname, "model", "churn-model.json");
        const affinityPath = path.join(__dirname, "model", "affinity-model.json");

        try {
            if (fs.existsSync(churnPath)) {
                this.churnModel = JSON.parse(fs.readFileSync(churnPath, "utf-8"));
                appLogger.info("ML: Loaded churn model");
            } else {
                appLogger.warn("ML: Churn model not found — using fallback");
            }

            if (fs.existsSync(affinityPath)) {
                this.affinityModel = JSON.parse(fs.readFileSync(affinityPath, "utf-8"));
                appLogger.info("ML: Loaded affinity model");
            } else {
                appLogger.warn("ML: Affinity model not found — using fallback");
            }
        } catch (err: any) {
            appLogger.error({
                msg: "ML: Error loading models",
                error: err.message,
            });
        }
    }

    predictChurn(features: number[]): number {
        if (!this.churnModel) {
            const fallback = 0.1;

            appLogger.warn({
                msg: "ML: Using fallback churn prediction",
                features,
                result: fallback,
            });

            return fallback;
        }

        const { weight, bias } = this.churnModel;

        let score = bias;
        for (let i = 0; i < weight.length; i++) {
            score += weight[i] * features[i];
        }

        const probability = 1 / (1 + Math.exp(-score));

        appLogger.debug({
            msg: "ML: Churn score computed",
            features,
            weight,
            bias,
            rawScore: score,
            probability,
        });

        return probability;
    }

    affinity(category: string, categoryCounts: Record<string, number>): number {
        const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        const result = (categoryCounts[category] || 0) / (total || 1);

        appLogger.debug({
            msg: "ML: Affinity computed",
            category,
            counts: categoryCounts,
            total,
            affinity: result,
        });

        return result;
    }
}
