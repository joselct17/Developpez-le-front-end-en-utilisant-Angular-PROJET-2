// TODO: create here a typescript interface for an olympic country
//creation du model avec key:type
export interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}

export interface OlympicData {
  id: number;
  country: string;
  participations: Participation[];
}

