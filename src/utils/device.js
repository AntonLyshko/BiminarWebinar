export const Device = {
  ...Browser,

  isSafariMacOS() {
    return this.isSafari() && !this.isAndroid() && !this.isiOS();
  },

  get portrait() {
    return window.innerHeight / window.innerWidth > 1;
  },

  get landscape() {
    return !this.portrait;
  }
}
