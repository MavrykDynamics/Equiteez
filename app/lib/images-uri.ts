import { isTruthy } from "app/lib/utils/is-truthy";

type TcInfraMediaSize = "small" | "medium" | "large" | "raw";
type ObjktMediaTail = "display" | "artifact" | "thumb288";

const IPFS_PROTOCOL = "ipfs://";
const IPFS_GATE = "https://cloudflare-ipfs.com/ipfs";
const MEDIA_HOST = "https://static.tcinfra.net/media";
const DEFAULT_MEDIA_SIZE: TcInfraMediaSize = "small";
const OBJKT_MEDIA_HOST = "https://assets.objkt.media/file/assets-003";

const SVG_DATA_URI_UTF8_PREFIX = "data:image/svg+xml;charset=utf-8,";

export const isSvgDataUriInUtf8Encoding = (uri: string) =>
  uri.slice(0, SVG_DATA_URI_UTF8_PREFIX.length).toLowerCase() ===
  SVG_DATA_URI_UTF8_PREFIX;

export const buildTokenImagesStack = (url?: string): string[] => {
  if (!url) return [];

  if (url.startsWith(IPFS_PROTOCOL) || url.startsWith("http")) {
    const uriInfo = getMediaUriInfo(url);
    return [
      buildIpfsMediaUriByInfo(uriInfo, "small"),
      buildIpfsMediaUriByInfo(uriInfo, "medium"),
    ].filter(isTruthy);
  }

  if (
    url.startsWith("data:image/") ||
    url.startsWith("chrome-extension") ||
    url.startsWith("moz-extension")
  ) {
    return [url];
  }

  return [];
};

interface MediaUriInfo {
  uri?: string;
  ipfs: IpfsUriInfo | nullish;
}

const getMediaUriInfo = (uri?: string): MediaUriInfo => ({
  uri,
  ipfs: uri ? getIpfsItemInfo(uri) : null,
});

interface IpfsUriInfo {
  id: string;
  path: string;
  /** With leading `?` if applicable */
  search: "" | `?${string}`;
}

const getIpfsItemInfo = (uri: string): IpfsUriInfo | null => {
  if (!uri.startsWith(IPFS_PROTOCOL)) {
    return null;
  }

  const [path, search] = uri.slice(IPFS_PROTOCOL.length).split("?");
  const id = path.split("/")[0];

  if (id === INVALID_IPFS_ID) {
    return null;
  }

  return {
    id,
    path,
    search: search ? `?${search}` : "",
  };
};

/** Black circle in `thumbnailUri`
 * See:
 * - KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH_79
 * - KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton_19484
 * - KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton_3312
 */
const INVALID_IPFS_ID = "QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc";

export const buildObjktCollectibleArtifactUri = (artifactUri: string) =>
  buildObjktMediaURI(getIpfsItemInfo(artifactUri), "artifact") || artifactUri;

const buildObjktMediaURI = (
  ipfsInfo: IpfsUriInfo | nullish,
  tail: ObjktMediaTail
) => {
  if (!ipfsInfo) {
    return;
  }

  let result = buildObjktMediaUriForItemPath(ipfsInfo.id, tail);
  if (ipfsInfo.search) {
    result += `/index.html${ipfsInfo.search}`;
  }

  return result;
};

const buildObjktMediaUriForItemPath = (itemId: string, tail: ObjktMediaTail) =>
  `${OBJKT_MEDIA_HOST}/${itemId}/${tail}`;

const buildIpfsMediaUriByInfo = (
  { uri, ipfs: ipfsInfo }: MediaUriInfo,
  size: TcInfraMediaSize = DEFAULT_MEDIA_SIZE,
  useMediaHost = true
): string => {
  if (!uri) return "";

  if (ipfsInfo) {
    return useMediaHost
      ? `${MEDIA_HOST}/${size}/ipfs/${ipfsInfo.path}${ipfsInfo.search}`
      : `${IPFS_GATE}/${ipfsInfo.path}${ipfsInfo.search}`;
  }

  if (useMediaHost && uri.startsWith("http")) {
    return `${MEDIA_HOST}/${size}/web/${uri.replace(/^https?:\/\//, "")}`;
  }

  return "";
};
