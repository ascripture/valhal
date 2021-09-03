export interface Config {
  cacheMS?: number;
  idPath?: string[];
}

export const defaultConfig: Config = {
  idPath: ['id'],
};
