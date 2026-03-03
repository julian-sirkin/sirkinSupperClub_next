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
  const nameInput = screen.getByLabelText("Name");
  const emailInput = screen.getByLabelText("Email");
  const phoneNumberInput = screen.getByLabelText("Phone Number");
  const submitButton = screen.getByRole("button", { name: "Checkout", hidden: true });

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

  it("formats phone number as user types and submits successfully", async () => {
    const user = userEvent.setup();
    renderDialogWithCart([createCartTicket({ quantity: 1 })]);

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const phoneNumberInput = screen.getByLabelText("Phone Number") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Checkout", hidden: true });

    await user.type(nameInput, "Jane Buyer");
    await user.type(emailInput, "jane@example.com");
    await user.type(phoneNumberInput, "1234567890");

    expect(phoneNumberInput.value).toBe("(123) 456 - 7890");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedClaimTickets).toHaveBeenCalledTimes(1);
    });
  });

  it("shows validation errors for invalid email and phone only after submit attempt", async () => {
    const user = userEvent.setup();
    renderDialogWithCart([createCartTicket({ quantity: 1 })]);

    const emailInput = screen.getByLabelText("Email");
    const phoneNumberInput = screen.getByLabelText("Phone Number");
    const submitButton = screen.getByRole("button", { name: "Checkout", hidden: true });

    expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
    expect(screen.queryByText("Please enter a valid 10-digit phone number")).not.toBeInTheDocument();

    await user.type(emailInput, "invalid-email");
    await user.type(phoneNumberInput, "12345");
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
    expect(await screen.findByText("Please enter a valid 10-digit phone number")).toBeInTheDocument();
    expect(mockedClaimTickets).not.toHaveBeenCalled();
  });
});
