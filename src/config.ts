export interface Config {
  cacheMS?: number;
  idPath?: string[];
  logState?: boolean;
}

export const defaultConfig: Config = {
  idPath: ['id'],
  logState: false,
};
