import { render, screen } from "@testing-library/react";

import { describe } from "node:test";
import { getExpectedRequestStore } from "../node_modules/next/dist/client/components/request-async-storage.external";
import Home from "../src/app/page";

describe("Dummy test for home component", () => {
  it("should have Docs text", () => {
    render(<Home />);

    const myElem = screen.getByText("Docs");

    expect(myElem).toBeInTheDocument();
  });
});
