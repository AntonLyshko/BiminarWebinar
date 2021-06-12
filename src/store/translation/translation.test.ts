import { TranslationStore } from "./translation";

// TODO: add more complex tests

describe("TranslationStore", () => {
  const translationStore = new TranslationStore();

  test("instance", () => {
    expect(translationStore).toBeInstanceOf(TranslationStore);
  });

  test("start", () => {
    expect(translationStore.pending).toBe(false);
    expect(translationStore.broadcasting).toBe(false);
    expect(translationStore.errorMessage).toBe("");
  });

  test("stop", () => {
    expect(translationStore.pending).toBe(false);
    expect(translationStore.broadcasting).toBe(false);
    expect(translationStore.errorMessage).toBe("");
  });
});
