import { KYC_CONTRACT } from "~/consts/contracts";

const apiUrl = process.env.API_URL ?? "";

export async function getKYCStatus(pkh: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storageRes: any = await fetch(
      `${apiUrl}/contracts/${KYC_CONTRACT}/storage/`
    );
    const bigMapId = (await storageRes.json()).memberLedger;

    const contractData = await fetch(
      `${apiUrl}/bigmaps/${bigMapId}/keys/${pkh}`
    );

    // if no data than no KYCed user
    if (contractData.status === 204) return false;

    const isKYCAddress = await contractData.json();

    return Boolean(isKYCAddress);
  } catch (e) {
    console.log(e);
    return false;
  }
}
