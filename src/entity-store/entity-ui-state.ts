import { CommonState } from '../common-state';

export interface EntityUIState<ENTITY, UI = CommonState> {
  entity?: Partial<ENTITY>;
  ui?: Partial<UI>;
}
