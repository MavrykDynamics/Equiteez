import { gql } from "~/utils/__generated__";

export const CONFIG_QUERY = gql(`
    query configQuery {
      super_admin {
        address
    }
}
`);
