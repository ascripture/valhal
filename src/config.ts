export interface Config {
  cacheMS?: number;
  logState?: boolean;
  idPath?: string[];
}

export const defaultConfig: Config = {
  idPath: ['id'],
  logState: false,
};
