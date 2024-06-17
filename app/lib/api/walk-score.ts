// https://api.walkscore.com/score?format=json&
// address=1119%8th%20Avenue%20Seattle%20WA%2098101&lat=47.6085&
// lon=-122.3295&transit=1&bike=1&wsapikey=05e2917bb5c652963987503d6d5a8eec

import { api } from '../utils/api';

export async function getWalkScoreData(
  params = {
    format: 'json',
    address: '268 Lee St #38 Opelika, Alabama(AL)',
    lat: '32.65023244148331',
    lon: '-85.36937602493992',
    transit: '1',
    bike: '1',
    wsapikey: '05e2917bb5c652963987503d6d5a8eec',
  }
) {
  try {
    const urlSearchParams = new URLSearchParams(params);
    const encodedString = urlSearchParams.toString();

    return await api(`https://api.walkscore.com/score?${encodedString}`, {
      method: 'GET',
      body: null,
      headers: {
        accept: '*/*',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Access-Control-Allow-Origin': 'https://walk-score.equiteez.pages.dev',
      },
    });
  } catch (e) {
    console.log(e);
  }
}
