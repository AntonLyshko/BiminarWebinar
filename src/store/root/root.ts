import { makeAutoObservable } from "mobx";

import { TranslationStore } from "../translation";

export class RootStore {
  constructor() {
    makeAutoObservable(this);
  }

  translation = new TranslationStore();
}
