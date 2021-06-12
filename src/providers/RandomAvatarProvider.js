import React, { useState, useMemo, useCallback } from "react";

import invert from "invert-color";
import randomColor from "randomcolor";

export const RandomAvatarsContext = React.createContext({});

const RandomAvatarsProvider = ({ children }) => {
  const [avatars, setAvatars] = useState({});

  const generate = useCallback((coreUserId) => {
    const color = randomColor({
      luminosity: "light",
      seed: coreUserId,
    });

    return {
      bgc: color,
      color: invert(color, true),
    };
  }, []);

  function getFirstSigns(words) {
    if (!words) {
      return "";
    }
    return words
      .split(" ")
      .map((item) => item[0])
      .join("");
  }

  const initials = useCallback((minFullName) => {
    return getFirstSigns(minFullName);
  }, []);

  const avatarProps = useMemo(
    () => ({
      setAvatars,
      avatars,
      initials,
      generate,
    }),
    [avatars, initials]
  );

  return (
    <RandomAvatarsContext.Provider value={avatarProps}>
      {children}
    </RandomAvatarsContext.Provider>
  );
};

export default RandomAvatarsProvider;
