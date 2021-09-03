import { EntityStore, EntityUIState } from '..';

describe('EntityUIIntegration', () => {
  it('connects any entity with ui data', () => {
    const entityStore = new EntityStore<
      EntityUIState<{ id: string; value: number }, { isLoading: boolean }>,
      string,
      { globalLoading: boolean }
    >({
      idPath: ['entity', 'id'],
    });

    entityStore.add({
      entity: {
        id: 'test',
        value: 500,
      },
      ui: {
        isLoading: true,
      },
    });

    entityStore.add({
      entity: {
        id: 'test2',
        value: 700,
      },
      ui: {
        isLoading: false,
      },
    });

    const result = entityStore.get('test');
    expect(result?.entity?.value).toEqual(500);
    expect(result?.ui?.isLoading).toBeTruthy();
  });
});
