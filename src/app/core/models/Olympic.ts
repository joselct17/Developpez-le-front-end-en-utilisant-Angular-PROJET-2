// TODO: create here a typescript interface for an olympic country
//creation du model avec key:type


import {Participation} from "./Participation";

export interface OlympicData {
  id: number;
  country: string;
  participations: Participation[];
}

