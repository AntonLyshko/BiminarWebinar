import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";

import sortBy from "lodash/sortBy";

import { SyncContext } from "../SyncProvider";

export const ConfereeContext = React.createContext({});

const ConfereeProvider = ({ children }) => {
  const [conferees, setConferees] = useState({});
  const [sortedDisplayLimit, setSortedDisplayLimit] = useState(null);

  const { updateSyncAction } = useContext(SyncContext);

  const sortedUsers = useCallback(
    (users) => {
      const inLiveUserIndex = users.findIndex((user) => user.isLive);
      const inLiveUser = users[inLiveUserIndex];
      /** Сценарий, если пользователи зашли, но трансляции еще нет */
      const sortedUsers = inLiveUser ? [inLiveUser] : [];
      let outerIndex = 0;
      sortBy(users, (user) => !user.hand_up).forEach((user, index) => {
        if (
          (inLiveUser && inLiveUser.cuid === user.cuid) ||
          (sortedDisplayLimit && sortedUsers.length > sortedDisplayLimit)
        ) {
          return;
        }
        if (outerIndex % 2 === 0) {
          sortedUsers.push(user);
        } else {
          sortedUsers.unshift(user);
        }
        outerIndex++;
      });
      return sortedUsers;
    },
    [sortedDisplayLimit]
  );

  function confereeInitialize(users) {
    if (users) {
      console.log("conferee initialization");
      setConferees((state) => ({
        ...state,
        ...users,
      }));
    }
  }

  const manage = (data) => {
    // console.warn('DEBUG', data);
    const { users, joined, disconnected, updated } = data;

    if (joined) {
      setConferees((state) => ({
        ...state,
        ...users,
      }));
      return;
    }

    if (users && disconnected) {
      setConferees((state) => {
        Object.keys(users).map((deletedUser) => {
          delete state[deletedUser];
        });
        return { ...state };
      });
    }

    if (updated) {
      setConferees((state) => ({
        ...state,
        ...users,
      }));
    }
  };

  function users(users) {
    return Object.values(users);
  }

  const confereeProps = useMemo(
    () => ({
      conferees,
      confereeInitialize,
      manage,
      sortedDisplayLimit,
      setSortedDisplayLimit,
      sortedUsers,
      users,
    }),
    [conferees, sortedDisplayLimit, sortedUsers]
  );

  return (
    <ConfereeContext.Provider value={confereeProps}>
      {children}
    </ConfereeContext.Provider>
  );
};

export default ConfereeProvider;
