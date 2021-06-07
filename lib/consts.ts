export const WEEK_DAYS = [
  // 0, // lundi
  // 1, // mardi
  2, // mercredi,
  // 3, // jeudi
  // 4, // vendredi
  // 5, // samedi
  6, // dimanche
]

export const START_HOURS: { [dayId: number]: number[] } = {
  2: [20, 21],
  5: [14, 15],
  6: [10, 11],
}

export const PLACES = [0, 1]
export const PLACES_MAP: { [id: number]: { name: string; max: number } } = {
  0: { name: "Précision", max: 7 },
  1: { name: "Vitesse", max: 1 },
}
