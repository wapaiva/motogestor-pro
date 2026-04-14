export type RideSource =
  | "Uber"
  | "99"
  | "iFood"
  | "Rappi"
  | "UaiRango"
  | "MotoSJ"
  | "Pedemoto"
  | "Particular"
  | "Outro";

export type Ride = {
  id: string;
  amount: number;
  distance: number;
  date: string;
  source: RideSource;
  customSource?: string;
};
