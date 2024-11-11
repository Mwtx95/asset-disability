import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export interface Category {
  id: number;
  name: string;
}

export const categoryQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: fetchCategories,
});

async function fetchCategories() {
  const { data } = await axios.get<Category[]>("/categories");
  return data;
}

