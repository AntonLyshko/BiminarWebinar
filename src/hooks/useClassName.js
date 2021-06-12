import { withNaming } from "@bem-react/classname";

const cn = withNaming({ n: "", e: "__", m: "--" });

function mergeClassName(...classes) {
  return classes.filter((className) => className).join(" ");
}

function useClassName(blockClassName) {
  return {
    cn: cn(blockClassName),
    mergeClassName: mergeClassName,
  };
}

export default useClassName;
