import { Injectable } from "@nestjs/common";
import { Client } from "pg";
import { appLogger } from "../logger/logger.service";

@Injectable()
export class ExperimentService {
  private readonly pg: Client;

  constructor() {
    this.pg = new Client({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      port: Number(process.env.POSTGRES_PORT),
    });

    this.pg.connect().catch(err => appLogger.error(`ExperimentService PG connect error ${err}`));
  }

  async trackConversion(args: {
    userId: string;
    experiment: string;
    variant: string;
    goal: string;
    metadata?: Record<string, any>;
  }) {
    const { userId, experiment, variant, goal, metadata = {} } = args;
    const res = await this.pg.query(
      `INSERT INTO experiment_conversions (user_id, experiment, variant, goal, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, experiment, variant, goal, metadata]
    );
    return res.rows[0];
  }

  async getResults(experiment: string) {
    const exposures = await this.pg.query(
      `SELECT variant, COUNT(*)::int as exposures
       FROM experiment_exposures
       WHERE experiment = $1
       GROUP BY variant
       ORDER BY variant`,
      [experiment]
    );

    const conversions = await this.pg.query(
      `SELECT variant, goal, COUNT(*)::int as conversions
       FROM experiment_conversions
       WHERE experiment = $1
       GROUP BY variant, goal
       ORDER BY variant`,
      [experiment]
    );

    return {
      exposures: exposures.rows,
      conversions: conversions.rows,
    };
  }
}
