import qs from "qs";
import { omit } from "ramda";

type QueryStringManager = (options?: {
  reset: boolean;
}) => {
  setParams: (paramsToSet: { [key: string]: any }) => string;
  omitParams: (paramsToOmit: string[]) => string;
};

export const createQueryStringManager: QueryStringManager = (
  { reset } = { reset: true }
) => {
  const setURL = url => {
    const methodToSetURL = reset ? "replaceState" : "pushState";

    window.history[methodToSetURL]({}, "", url);
  };

  const getOriginalURL = () =>
    `${window.location.pathname}${window.location.search}`;

  const setParams = paramsToSet => {
    const [baseURL, searchString] = getOriginalURL().split("?");

    const searchObject = searchString ? qs.parse(searchString) : {};

    const resultSearchString = qs.stringify({
      ...searchObject,
      ...paramsToSet
    });

    const resultURL = `${baseURL}?${resultSearchString}`;

    setURL(resultURL);

    return resultURL;
  };

  const omitParams = paramsToOmit => {
    const [baseURL, searchString] = getOriginalURL().split("?");

    if (!searchString) {
      return baseURL;
    }

    const searchObject = qs.parse(searchString);
    const resultSearchString = qs.stringify(omit(paramsToOmit, searchObject));

    const resultURL = resultSearchString
      ? `${baseURL}?${resultSearchString}`
      : baseURL;

    setURL(resultURL);

    return resultURL;
  };

  return {
    setParams,
    omitParams
  };
};
