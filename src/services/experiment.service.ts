import { Injectable } from "@nestjs/common";
import { Client } from "pg";

@Injectable()
export class ExperimentService {
  private pg: Client;

  constructor() {
    this.pg = new Client({
      host: process.env.POSTGRES_HOST || 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'persona',
      port: Number(process.env.POSTGRES_PORT || 5432),
    });

    this.pg.connect().catch(err => console.error('ExperimentService PG connect error', err));
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
