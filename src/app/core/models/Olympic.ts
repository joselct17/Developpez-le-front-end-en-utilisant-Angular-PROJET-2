// It's a typescript interface for an olympic country
/*
example of an olympic country:
{
    id: 1,
    country: "Italy",
    participations: []
}
*/
import { Participation } from "./Participation";

export class Olympic {

    id!: number;
    country!: number;
    participations!: Participation[]; 


}