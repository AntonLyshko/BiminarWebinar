import React, { useState } from "react";

import { getSchoolInfo } from "../_prodamus/actions/auth";

export const SchoolContext = React.createContext({});

const SchoolProvider = ({ children }) => {
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState(null);
  const [theme_image, set_theme_image] = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [legal, setLegal] = useState(null);
  const [subdomain, setSubdomain] = useState(null);

  async function schoolInitialization() {
    const response = getSchoolInfo(window.location.origin);
    if (typeof response.data.data === "object") {
      const {
        logo,
        name,
        theme_image,
        privacy,
        legal,
        subdomain,
      } = response.data.data;
      setLogo(logo);
      setName(name);
      set_theme_image(theme_image);
      setPrivacy(privacy);
      setLegal(legal);
      setSubdomain(subdomain);
    }
  }
  return (
    <SchoolContext.Provider
      value={{
        schoolInitialization,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};
