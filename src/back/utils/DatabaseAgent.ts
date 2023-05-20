import { ValueTransformer } from "typeorm/decorator/options/ValueTransformer";

export class CSVTransformer implements ValueTransformer {
  from(v: string) {
    return v ? v.split(",") : [];
  }
  to(v: string[]) {
    return v.join(",");
  }
}
