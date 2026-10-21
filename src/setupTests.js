import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextDecoder, TextEncoder });

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

const clearAllMocks = jest.clearAllMocks.bind(jest);

jest.clearAllMocks = () => {
  clearAllMocks();
  window.localStorage.getItem.mockReturnValue(null);
};
