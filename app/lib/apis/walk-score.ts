/* eslint-disable no-useless-catch */
import { api } from '../utils/api';

const DEFAUL_WALK_PARAMS: Partial<WalkScoreParams> = {
  format: 'json',
  transit: '1',
  bike: '1',
};

export type WalkScoreParams = {
  lat: string;
  lon: string;
  address: string;
  transit?: string; // 	Set transit=1 to request Transit Score (if available).
  bike?: string; //	Set bike=1 to request Bike Score (if available).
  format?: string; // 	Return results in XML or JSON (defaults to XML).
};

export async function getWalkScoreData(params: WalkScoreParams) {
  try {
    const urlSearchParams = new URLSearchParams({
      ...DEFAUL_WALK_PARAMS,
      ...params,
    });
    const encodedString = urlSearchParams.toString();

    const { data } = await api<WalkScoreRes>(
      `https://walk-api-proxy.akilawallet.workers.dev/?${encodedString}`,
      {
        method: 'GET',
      }
    );

    return data;
  } catch (e) {
    throw e;
  }
}

export interface WalkScoreRes {
  status: number;
  walkscore: number;
  description: string;
  updated: string;
  logo_url: string;
  more_info_icon: string;
  more_info_link: string;
  ws_link: string;
  help_link: string;
  snapped_lat: number;
  snapped_lon: number;
  transit: Transit;
  bike: Bike;
}

export interface Transit {
  score: number;
  description: string;
  summary: string;
}

export interface Bike {
  score: number;
  description: string;
}
