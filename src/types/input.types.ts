export interface UserDTO {
  id?: string;
  email?: string;
  uname?: string;
  contact?: string;
  profile?: string;
  address?: string;
}
export interface PeopleErrorDTO {
  email?: string | null;
  uname?: string;
  contact?: string;
  profile?: string;
  address?: string;
}
export interface CompetitionDTO {
  id?: string | undefined;
  cname?: string;
  cid?: string;
  rounds?: RoundsDataDTO[];
}
export interface RoundsDataDTO {
  id: string;
  label: string;
}
export interface TError {
  cname?: string;
}
export interface RulesDTO {
  id?: string;
  value?: string;
}
export interface RuleError {
  rule?: string;
}
export interface LoginDTO {
  email?: string | null;
  id?: string | null;
  contact?: string | null;
  photourl?: string | null;
  fullname?: string | null;
}
export interface SubtabDTO {
  Participants: string;
  Rules: string;
  LeaderBoard: string;
}
export interface SelectedroundsDTO {
  id?: string | undefined;
}

export interface RadioValueDTO {
  "Clarity of Content": number;
  "Engagement Level": number;
  "Use of Visuals": number;
  "Explanation Impact": number;
  "Question & Answers": number;
  "Your Perception": number;
}

export interface OptionDTO {
  id: string;
  value: string;
  point?: number;
}

export interface FieldValueDTO {
  Description: string;
  Options: OptionDTO[];
}

export interface FeebackDataDTO {
  id: string;
}

export interface FeedbackErrorDTO{
point:string
}
export interface PresentationDTO {
  presentation?: string;
  topic?: string;
  category: string;
  fileName?: string;
  url?: string;
  time?: string;
  email?: string;
  description?: string;
  id?: string;
  competitionData:CompetitionDTO;
  roundData: RoundsDataDTO;
}