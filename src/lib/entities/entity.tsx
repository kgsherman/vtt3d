import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Tables } from "./db";
import type { TableKey } from "./db-util";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

type EntityQueryKey = ["entity", { table: TableKey; id: string }];
type EntitiesQueryKey<T extends TableKey> = [
  "entities",
  { table: T; filter: Partial<Tables<T>> },
];

const entityMatchesFilter = <T extends TableKey>(
  entity: Partial<Tables<T>>,
  filter: Partial<Tables<T>>
) =>
  Object.keys(filter).every(
    (key) => entity[key as keyof Tables<T>] === filter[key as keyof Tables<T>]
  );

const entityDoesNotMatchFilter = <T extends TableKey>(
  entity: Partial<Tables<T>>,
  filter: Partial<Tables<T>>
) =>
  Object.keys(filter).some(
    (key) => entity[key as keyof Tables<T>] !== filter[key as keyof Tables<T>]
  );

export const useEntityIds = <T extends TableKey>(table: T) => {
  type Entity = Tables<T>;
  return ({
    filter = {},
    order = ["id"],
  }: {
    filter: Partial<Entity>;
    order?: [
      field: string,
      options?: {
        ascending?: boolean;
        nullsFirst?: boolean;
        referencedTable?: undefined;
      },
    ];
  }) => {
    const client = useQueryClient();
    const queryKey: EntitiesQueryKey<T> = ["entities", { table, filter }];

    const { data } = useSuspenseQuery({
      queryKey: queryKey,
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .match(filter)
          .order(...order)
          .returns<Entity[]>();

        if (error) throw error;

        data.forEach((entity) => {
          if (!("id" in entity)) return;

          client.setQueryData(["entity", { table, id: entity.id }], entity);
        });

        supabase
          .channel(`${table}-realtime`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table,
            },
            (payload: RealtimePostgresChangesPayload<Entity>) => {
              const ids = client.getQueryData(queryKey) as string[];
              switch (payload.eventType) {
                case "INSERT":
                  if (entityDoesNotMatchFilter(payload.new, filter)) return;

                  client.setQueryData(queryKey, [...ids, payload.new.id]);
                  break;
                case "UPDATE":
                  if (
                    entityMatchesFilter(payload.new, filter) &&
                    entityDoesNotMatchFilter(payload.old, filter)
                  ) {
                    client.setQueryData(queryKey, [...ids, payload.new.id]);
                  } else if (
                    entityDoesNotMatchFilter(payload.new, filter) &&
                    entityMatchesFilter(payload.old, filter)
                  ) {
                    client.setQueryData(
                      queryKey,
                      ids.filter((id) => id !== payload.old.id)
                    );
                  }
                  break;
                case "DELETE":
                  if (entityDoesNotMatchFilter(payload.old, filter)) return;

                  client.setQueryData(
                    queryKey,
                    ids.filter((id) => id !== payload.old.id)
                  );
                  break;
              }
            }
          )
          .subscribe();

        return data.map((entity) => entity.id);
      },
    });

    return data;
  };
};

export const useEntityData =
  <T extends TableKey>(table: T) =>
  (id: string) => {
    type Entity = Tables<T>;
    const client = useQueryClient();
    const queryKey: EntityQueryKey = ["entity", { table, id }];

    const { data } = useSuspenseQuery({
      queryKey: queryKey,
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .single<Entity>();

        if (error) throw error;

        supabase
          .channel(`${table}-${id}-realtime`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table,
              filter: `id=eq.${id}`,
            },
            (payload: RealtimePostgresChangesPayload<Entity>) => {
              client.setQueryData(queryKey, payload.new);
            }
          )
          .subscribe();

        return data;
      },
    });

    return data;
  };
