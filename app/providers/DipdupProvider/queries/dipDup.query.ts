import { gql } from "~/utils/__generated__";

export const DIP_DUP_QUERY = gql(`
  subscription DipDupHeadLvl {
    dipdup_head {
      level
    }
  }
`);
