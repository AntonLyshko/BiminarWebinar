import ReactDOM from "react-dom";

const HandUpPortal = ({ children }) => {
  return ReactDOM.createPortal(children, document.getElementById("streamer"));
};

export default HandUpPortal;
