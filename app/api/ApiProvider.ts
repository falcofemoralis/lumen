import ApiInterface from "./interface/Api.interface";
//import KinoKongApi from "./KinoKongApi";
import RezkaApi from "./RezkaApi";

export type ApiServiceType = "rezka" | "kinokong";

export function ApiProvider(): ApiInterface {
  const currentService: ApiServiceType = "rezka" as ApiServiceType;

  switch (currentService) {
    case "rezka":
      return RezkaApi;
    // case "kinokong":
    //   return KinoKongApi;
    default:
      throw new Error("Unknown service");
  }
}
