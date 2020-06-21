import { createQueryStringManager } from ".";

global.window = {
  location: {
    pathname: "somePathName",
    search: ""
  } as Location,
  history: ({
    pushState: jest.fn(),
    replaceState: jest.fn()
  } as unknown) as History
} as any;

describe("queryStringManager", () => {
  let queryStringManager;
  // let setUpQueryString;

  beforeEach(() => {
    queryStringManager = createQueryStringManager();
  });

  afterEach(() => {
    (window.history.replaceState as any).mockClear();
    (window.history.pushState as any).mockClear();
  });

  describe("setParams(paramsToAdd)", () => {
    it("adds query params properly to the url without query params", () => {
      const resultUrl = queryStringManager.setParams({
        param1: "value1",
        param2: "value2"
      });

      expect(resultUrl).toBe("somePathName?param1=value1&param2=value2");
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });

    it("adds query params properly to the url with original query params in the url", () => {
      window.location.search = "?originalParam=originalValue";

      const resultUrl = queryStringManager.setParams({
        param1: "value1",
        param2: "value2"
      });

      expect(resultUrl).toBe(
        "somePathName?originalParam=originalValue&param1=value1&param2=value2"
      );
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });

    it("rewrites original query params with the same name", () => {
      window.location.search = "?param1=originalValue";

      const resultUrl = queryStringManager.setParams({
        param1: "value1",
        param2: "value2"
      });

      expect(resultUrl).toBe("somePathName?param1=value1&param2=value2");
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });

    it("calls pushState instead of replaceState with reset equals to true", () => {
      queryStringManager = createQueryStringManager({ reset: false });

      window.location.search = "?param1=originalValue";

      const resultUrl = queryStringManager.setParams({
        param1: "value1",
        param2: "value2"
      });

      expect(resultUrl).toBe("somePathName?param1=value1&param2=value2");
      expect(window.history.pushState).toHaveBeenCalledTimes(1);
      expect(window.history.pushState).toHaveBeenCalledWith({}, "", resultUrl);
    });

    it("works properly with url, passed in arguments", () => {
      const resultUrl = queryStringManager.setParams(
        {
          param1: "value1",
          param2: "value2"
        },
        "/someNewPathName?someNewParam=someNewValue"
      );

      expect(resultUrl).toBe(
        "/someNewPathName?someNewParam=someNewValue&param1=value1&param2=value2"
      );
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });
  });

  describe("removeQueryString(paramsToRemove)", () => {
    it("omits query params properly from the url", () => {
      window.location.search = "?param1=value1&param2=value2&param3=value3";

      const resultUrl = queryStringManager.omitParams(["param1", "param2"]);

      expect(resultUrl).toBe("somePathName?param3=value3");
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });

    it("omits all params from the url properly", () => {
      window.location.search = "?param1=value1&param2=value2";

      const resultUrl = queryStringManager.omitParams(["param1", "param2"]);

      expect(resultUrl).toBe("somePathName");
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });

    it("exits if there is no searching string in the url", () => {
      window.location.search = "";

      const resultUrl = queryStringManager.omitParams(["param1", "param2"]);

      expect(resultUrl).toBe("somePathName");
      expect(window.history.replaceState).toHaveBeenCalledTimes(0);
    });

    it("works properly with url, passed in arguments", () => {
      const resultUrl = queryStringManager.omitParams(
        ["param1"],
        "/someNewPathName?param1=value1&param2=value2"
      );

      expect(resultUrl).toBe("/someNewPathName?param2=value2");
      expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        "",
        resultUrl
      );
    });
  });
});
