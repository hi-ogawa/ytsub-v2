import { useLocalStorage } from "@rehooks/local-storage";
import type { LocalStorageReturnValue } from "@rehooks/local-storage/lib/use-localstorage";
import type { LanguageSetting } from "./language";

const PREFIX = "ytsub-v2";

function toKey(name: string, version: string = "v1"): string {
  return PREFIX + "/" + name + "-" + version;
}

export function useLanguageSetting(): LocalStorageReturnValue<LanguageSetting> {
  return useLocalStorage<LanguageSetting>(toKey("language-setting"), {
    language1: undefined,
    language2: undefined,
  });
}
