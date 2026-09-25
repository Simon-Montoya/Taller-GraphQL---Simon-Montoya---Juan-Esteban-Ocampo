import DataLoader from "dataloader";

import {
  getMedicationsByIds
} from "../queries/medicationQueries.js";

export function createMedicationLoader() {
  return new DataLoader(async (medicationIds) => {
    const ids = [...medicationIds];

    console.log(
      "[DATALOADER BATCH] Fetching medication IDs:",
      ids
    );

    const medications = await getMedicationsByIds(ids);

    const medicationsById = new Map(
      medications.map((medication) => [
        medication.id,
        medication
      ])
    );

    return ids.map(
      (id) => medicationsById.get(id) ?? null
    );
  });
}