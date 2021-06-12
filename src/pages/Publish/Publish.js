import React from "react";

import PublishProvider from "../../providers/PublishProvider";

import PublishPage from "./PublishPage";

const Publish = ({ isLogged }) => {
  return (
    <PublishProvider>
      <PublishPage isLogged={isLogged} />
    </PublishProvider>
  );
};

export default Publish;
