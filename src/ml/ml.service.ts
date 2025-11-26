import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MlService {
    private churnModel: any = null;
    private affinityModel: any = null;

    constructor() {
        this.loadModels();
    }

    loadModels() {
        const churnPath = path.join(__dirname, 'model', 'churn-model.json');
        const affinityPath = path.join(__dirname, 'model', 'affinity-model.json');

        if (fs.existsSync(churnPath)) {
            this.churnModel = JSON.parse(fs.readFileSync(churnPath, 'utf-8'))
        }

        if (fs.existsSync(affinityPath)) {
            this.affinityModel = JSON.parse(fs.readFileSync(affinityPath, 'utf-8'))
        }
    }

    predictChurn(features: number[]): number {
        if (!this.churnModel) return 0.1;

        let { weight, bias } = this.churnModel;
        let score = bias;
        for (let i = 0; i < weight.length; i++) {
            score += weight[i] * features[i];
        }

        return 1 / (1 + Math.exp(-score));
    }

    affinity(category: string, categoryCounts: Record<string, number>): number {
        const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        return (categoryCounts[category] || 0) / (total || 1);
    }
}