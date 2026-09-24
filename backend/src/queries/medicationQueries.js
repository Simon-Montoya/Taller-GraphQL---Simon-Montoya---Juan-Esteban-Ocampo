import { supabase } from "../config/supabase.js";

export async function getMedications(search) {
  let query = supabase
    .from("medications")
    .select("*")
    .order("id", { ascending: true });

  if (search && search.trim() !== "") {
    const term = search.trim();

    query = query.or(
      `name.ilike.%${term}%,active_ingredient.ilike.%${term}%,category.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching medications: ${error.message}`);
  }

  return data ?? [];
}

export async function getMedicationById(id) {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching medication: ${error.message}`);
  }

  return data;
}