/// <reference types="vite/client" />

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare type ImportedSVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & { title?: string }
>;

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    readonly GOOGLE_MAPS_API_KEY: string;
    readonly API_URL: string;
    readonly RPC_NODE_URL: string;
    readonly BCD_API: string;
    readonly BCD_NETWORK_TYPE: 'sandboxnet' | 'mainnet';
    readonly MAVRYK_WALLET_API_URL: string;

    readonly REACT_APP_ENV: 'dev' | 'prod' | 'test';
    readonly TOKENS_METADATA_API: string;
  }
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  export const ReactComponent: ImportedSVGComponent;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
