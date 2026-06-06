jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown) => ({
      json: async () => body,
    }),
  },
}));

jest.mock("@/app/networkCalls/contentful/contentfulService", () => ({
  contentfulService: jest.fn(),
}));

jest.mock("../queries/select", () => ({
  getAllowedAddonsForTicketSelections: jest.fn(),
  getCustomerByEmail: jest.fn(),
  getTicketsByIdAndEvent: jest.fn(),
}));

jest.mock("../queries/insert", () => ({
  createCustomer: jest.fn(),
  createTicketPurchase: jest.fn(),
}));

jest.mock("./successEmail", () => ({
  successEmail: jest.fn(),
}));

import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import {
  getAllowedAddonsForTicketSelections,
  getCustomerByEmail,
  getTicketsByIdAndEvent,
} from "../queries/select";
import { createTicketPurchase } from "../queries/insert";
import { successEmail } from "./successEmail";
import { POST } from "./route";

const mockedContentfulService = contentfulService as jest.Mock;
const mockedGetTicketsByIdAndEvent = getTicketsByIdAndEvent as jest.Mock;
const mockedGetAllowedAddonsForTicketSelections =
  getAllowedAddonsForTicketSelections as jest.Mock;
const mockedGetCustomerByEmail = getCustomerByEmail as jest.Mock;
const mockedCreateTicketPurchase = createTicketPurchase as jest.Mock;
const mockedSuccessEmail = successEmail as jest.Mock;

const basePurchasedTicket = {
  eventContentfulId: "event-1",
  contentfulTicketId: "ticket-1",
  quantity: 1,
  title: "Dinner Ticket",
  time: new Date("2026-08-01T18:00:00.000Z"),
  ticketsAvailable: 10,
  price: 100,
  isAddonTicket: false,
  addons: [],
};

const buildRequest = (presalePassword: string) =>
  ({
    json: async () => ({
      name: "Jane Buyer",
      email: "jane@example.com",
      phoneNumber: "1234567890",
      purchasedTickets: [basePurchasedTicket],
      presalePassword,
      clientTimeZone: "America/Los_Angeles",
    }),
  } as unknown as Request);

describe("POST /api/claimTickets presale password validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedContentfulService.mockReturnValue({
      getEventsWithoutDB: jest.fn().mockResolvedValue([
        {
          contentfulEventId: "event-1",
          presaleEnabled: true,
          presalePassword: "correct-password",
          presaleEndsAt: new Date("2026-12-01T00:00:00.000Z"),
        },
      ]),
    });

    mockedGetTicketsByIdAndEvent.mockResolvedValue([
      {
        ticket: {
          contentfulId: "ticket-1",
          totalAvailable: 10,
          totalSold: 1,
        },
      },
    ]);
    mockedGetAllowedAddonsForTicketSelections.mockResolvedValue([]);
    mockedGetCustomerByEmail.mockResolvedValue([{ id: 123 }]);
    mockedCreateTicketPurchase.mockResolvedValue({
      isSuccessful: true,
      message: "ok",
    });
    mockedSuccessEmail.mockResolvedValue({ emailSuccessfully: true });
  });

  it("blocks checkout when presale password is incorrect", async () => {
    const response = await POST(buildRequest("wrong-password"));
    const body = await response.json();

    expect(body.status).toBe(500);
    expect(body.error.message).toContain("Presale password validation failed");
    expect(String(body.error.data)).toContain("incorrect");
    expect(mockedCreateTicketPurchase).not.toHaveBeenCalled();
  });

  it("allows checkout when presale password is correct", async () => {
    const response = await POST(buildRequest("correct-password"));
    const body = await response.json();

    expect(body.status).toBe(200);
    expect(mockedCreateTicketPurchase).toHaveBeenCalledTimes(1);
  });
});
