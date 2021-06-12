import { flow, makeAutoObservable } from "mobx";
import { serialize } from "object-to-formdata";

import { AxiosInstances } from "../../_prodamus";

enum TranslationState {
  None,
  Pending,
  Broadcasting,
  Error,
}

export class TranslationStore {
  state = TranslationState.None;
  errorMessage = "";

  constructor() {
    makeAutoObservable(this);
  }

  *start(uid: string, syncObject: unknown) {
    console.log("[INFO]: Start translation");
    try {
      this.state = TranslationState.Pending;
      const formData = serialize({ config: syncObject });
      formData.append("room", uid);
      const { data } = yield AxiosInstances.API.post(
        "/v1/translation/start",
        formData
      );
      if (data && data.error === 0) {
        this.state = TranslationState.Broadcasting;
        this.errorMessage = "";
      } else {
        this.state = TranslationState.None;
        this.errorMessage = data?.data.message;
      }
    } catch (error) {
      this.state = TranslationState.None;
      throw error;
    }
  }

  *stop(uid: string, syncObject: unknown) {
    console.log("[INFO]: Stop translation");
    try {
      this.state = TranslationState.Pending;
      const formData = serialize({ config: syncObject });
      formData.append("room", uid);
      const { data } = yield AxiosInstances.API.post(
        "/v1/translation/finish",
        formData
      );
      if (data && data.error === 0) {
        this.state = TranslationState.None;
        this.errorMessage = "";
      } else {
        this.state = TranslationState.None;
        this.errorMessage = data?.data.message;
      }
    } catch (error) {
      this.state = TranslationState.None;
      throw error;
    }
  }

  get broadcasting() {
    return this.state === TranslationState.Broadcasting;
  }

  get pending() {
    return this.state === TranslationState.Pending;
  }
}
