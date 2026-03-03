import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutDialog } from "./CheckoutDialog";
import { claimTickets } from "@/app/lib/apiClient";
import { useCartStore } from "@/store/cartStore";
import type { CartTicketType } from "@/store/cartStore.types";

jest.mock("@/app/lib/apiClient", () => ({
  claimTickets: jest.fn(),
}));

jest.mock("@/store/cartStore", () => ({
  useCartStore: jest.fn(),
}));

const mockedClaimTickets = claimTickets as jest.Mock;
const mockedUseCartStore = useCartStore as unknown as jest.Mock;
const emptyCartMock = jest.fn();

const mockEvent = {
  contentfulEventId: "event-1",
  title: "Test Event",
  date: new Date("2026-05-20T00:00:00.000Z"),
  price: 100,
  menu: { nodeType: "document", data: {}, content: [] },
  shortDescription: "Event short description",
  longDescription: { nodeType: "document", data: {}, content: [] },
  tickets: [],
};

const createCartTicket = (overrides: Partial<CartTicketType>): CartTicketType => ({
  eventContentfulId: "event-1",
  contentfulTicketId: "ticket-1",
  quantity: 1,
  title: "General Admission",
  time: new Date("2026-05-20T18:00:00.000Z"),
  ticketsAvailable: 20,
  price: 100,
  isAddonTicket: false,
  addons: [],
  ...overrides,
});

const renderDialogWithCart = (tickets: CartTicketType[]) => {
  mockedUseCartStore.mockImplementation((selector: (state: any) => unknown) =>
    selector({
      cart: {
        tickets,
        totalPrice: tickets.reduce((sum, ticket) => {
          const baseTotal = sum + ticket.price * ticket.quantity;
          const addonTotal =
            ticket.selectedAddonContentfulId && (ticket.addonQuantity ?? 0) > 0
              ? (ticket.selectedAddonPrice ?? 0) * (ticket.addonQuantity ?? 0)
              : 0;
          return baseTotal + addonTotal;
        }, 0),
      },
      emptyCart: emptyCartMock,
    })
  );

  render(<CheckoutDialog event={mockEvent} />);
};

const fillAndSubmitCheckoutForm = async () => {
  const user = userEvent.setup();
  const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
  const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
  const phoneNumberInput = document.querySelector('input[name="phoneNumber"]') as HTMLInputElement;
  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

  await user.type(nameInput, "Jane Buyer");
  await user.type(emailInput, "jane@example.com");
  await user.type(phoneNumberInput, "1234567890");
  await user.click(submitButton);
};

describe("CheckoutDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedClaimTickets.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "ok" }),
    });
  });

  it("submits ticket-only lines in purchasedTickets payload", async () => {
    const ticketOnlyLine = createCartTicket({
      quantity: 2,
    });

    renderDialogWithCart([ticketOnlyLine]);
    await fillAndSubmitCheckoutForm();

    await waitFor(() => {
      expect(mockedClaimTickets).toHaveBeenCalledTimes(1);
    });

    const requestBody = mockedClaimTickets.mock.calls[0][0];
    expect(requestBody.purchasedTickets).toEqual([ticketOnlyLine]);
  });

  it("submits addon selections in purchasedTickets payload", async () => {
    const ticketWithAddon = createCartTicket({
      quantity: 2,
      selectedAddonContentfulId: "addon-1",
      selectedAddonTitle: "Wine Pairing",
      selectedAddonPrice: 25,
      addonQuantity: 2,
    });

    renderDialogWithCart([ticketWithAddon]);
    await fillAndSubmitCheckoutForm();

    await waitFor(() => {
      expect(mockedClaimTickets).toHaveBeenCalledTimes(1);
    });

    const requestBody = mockedClaimTickets.mock.calls[0][0];
    expect(requestBody.purchasedTickets).toEqual([ticketWithAddon]);
  });
});
