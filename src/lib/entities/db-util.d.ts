import { Database } from "./db";

export type TableKey = keyof Database["public"]["Tables"] | keyof Database["public"]["Views"]