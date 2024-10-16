import { atom } from "recoil";
import {
  CompetitionDTO,
  LoginDTO,
  RoundsDataDTO,
  SubtabDTO,
  UserDTO,
} from "../types/input.types";

export const UserAtom = atom<LoginDTO | undefined>({
  key: "UserAtom",
  default: {} as LoginDTO,
});
export const AllCompetitionAtom = atom<CompetitionDTO[]>({
  key: "AllCompetitionAtom",
  default: [] as CompetitionDTO[],
});
export const SelectedCompetitionAtom = atom<CompetitionDTO>({
  key: "SelectedCompetitionAtom",
  default: {} as CompetitionDTO,
});
export const AtomAllPeople = atom<UserDTO[]>({
  key: "AtomTableData",
  default: [] as UserDTO[],
});
export const AtomSubTab = atom<SubtabDTO[]>({
  key: "AtomSubTab",
  default: [] as SubtabDTO[],
});
export const SelectedRoundAtom = atom<string | undefined>({
  key: "SelectedRoundAtom",
  default: undefined,
});
export const ActiveRoundAtom = atom<RoundsDataDTO>({
  key: "ActiveRoundAtom",
  default: {} as RoundsDataDTO,
});
export const AtomFilterUser = atom<UserDTO[]>({
  key: "AtomFilterUser",
  default: [] as UserDTO[],
});

export const AtomSelectedParticipants = atom<UserDTO[]>({
  key: "AtomSelectedParticipants",
  default: [] as UserDTO[],
});
export const ActiveParticipantATOM = atom<UserDTO>({
  key: "ActiveParticipantATOM",
  default: {} as UserDTO,
});
