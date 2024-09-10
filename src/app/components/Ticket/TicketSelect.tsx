"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectItem,
} from "@/schad/components/ui/select";
import { useCartStore } from "@/store/cartStore";

type TicketSelectProps = {
  availableTickets: number[];
  handleChangeQuantity: (numberOfTickets: number) => void;
  ticketTitle: string;
};

export const TicketSelect = ({
  availableTickets,
  handleChangeQuantity,
  ticketTitle,
}: TicketSelectProps) => {
  const cart = useCartStore((state) => state.cart);

  const ticketInCart = cart.tickets.find(
    (ticketInCart) => ticketInCart.title === ticketTitle
  );
  const placeholderValue = ticketInCart?.quantity
    ? ticketInCart.quantity
    : "Select Quantity";

  return (
    <Select
      onValueChange={(newQuantity) => handleChangeQuantity(Number(newQuantity))}
    >
      <SelectTrigger className="bg-gold w-[140px] md:w-[180px] h-12 font-bold text-md md:text-lg text-white text-bold hover:bg-white hover:text-gold">
        <SelectValue placeholder={placeholderValue} />
      </SelectTrigger>
      <SelectContent className="bg-gold w-[140px] md:w-[180px]">
        <SelectGroup className="text-lg">
          <SelectLabel>Number of Tickets</SelectLabel>
          {availableTickets.map((ticketQuantity) => (
            <SelectItem
              key={`${ticketTitle}quantity-${ticketQuantity}`}
              value={String(ticketQuantity)}
              className="text-lg font-bold"
            >
              {ticketQuantity}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
