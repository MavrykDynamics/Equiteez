import { z } from "zod";
import {
  OrderSchema,
  OrdersListSchema,
} from "~/lib/apis/mbrwa/user/userOrders/orders.schema";
import { TokenMetadata } from "~/lib/metadata";
import { JSX } from "react";

export type OrderType = {
  tokenMetadata: TokenMetadata;
  tokenSlug: string;
  isSell: boolean;
  orderName: string;
  assetLink: string;
  orderIcon: JSX.Element;
} & z.infer<typeof OrderSchema>;

export type OrdersListType = z.infer<typeof OrdersListSchema>;
