import { LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type ExtractGeneric<Type> = Type extends TypedResponse<infer X> ? X : never;
export function useDataFromLoader<T extends LoaderFunction>() {
  return useLoaderData() as ExtractGeneric<Awaited<ReturnType<T>>>;
}
