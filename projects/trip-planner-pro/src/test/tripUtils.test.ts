import { describe, it, expect } from "vitest";
import { getDestinationEmoji } from "../lib/tripUtils";

describe("getDestinationEmoji", () => {
  it.each([
    ["beach", "🏖️"],
    ["BALI", "🏖️"],
    ["Hawaii Vacation", "🏖️"],
    ["maldives resort", "🏖️"],
    ["paris", "🗼"],
    ["FRANCE Trip", "🗼"],
    ["Trip to Japan", "🗾"],
    ["Tokyo tower", "🗾"],
    ["kyoto gardens", "🗾"],
    ["London bridge", "🇬🇧"],
    ["UK adventure", "🇬🇧"],
    ["England trip", "🇬🇧"],
    ["New York City", "🗽"],
    ["NYC getaway", "🗽"],
    ["Rome history", "🏛️"],
    ["italy tour", "🏛️"],
    ["mountain climbing", "🏔️"],
    ["Swiss Alps", "🏔️"],
    ["Nepal trekking", "🏔️"],
    ["Australia wild", "🦘"],
    ["Sydney Opera House", "🦘"],
    ["India spice tour", "🇮🇳"],
    ["China wall", "🇨🇳"],
    ["Beijing trip", "🇨🇳"],
    ["egypt pyramids", "🏺"],
    ["cairo museum", "🏺"],
    ["Safari expedition", "🦁"],
    ["Kenya trip", "🦁"],
    ["Africa tour", "🦁"],
    ["Caribbean Cruise", "🚢"],
    ["cruise vacation", "🚢"],
    ["camping in forest", "⛺"],
  ])("returns correct emoji '%s' for destination '%s'", (destination, expectedEmoji) => {
    expect(getDestinationEmoji(destination)).toBe(expectedEmoji);
  });

  it("returns default plane emoji for unknown destinations", () => {
    expect(getDestinationEmoji("Berlin")).toBe("✈️");
    expect(getDestinationEmoji("Random Place")).toBe("✈️");
    expect(getDestinationEmoji("12345")).toBe("✈️");
  });

  it("returns default plane emoji for empty string", () => {
    expect(getDestinationEmoji("")).toBe("✈️");
  });
});
