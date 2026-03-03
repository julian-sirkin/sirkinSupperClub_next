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
import { motion } from "framer-motion";

type TicketSelectProps = {
  availableTickets: number[];
  handleChangeQuantity: (numberOfTickets: number) => void;
  ticketTitle: string;
  triggerClassName?: string;
};

export const TicketSelect = ({
  availableTickets,
  handleChangeQuantity,
  ticketTitle,
  triggerClassName,
}: TicketSelectProps) => {
  const ticketInCart = useCartStore((state) =>
    state.cart.tickets.find((t) => t.title === ticketTitle)
  );

  const placeholderValue =
    ticketInCart && ticketInCart.quantity > 0
      ? `Qty: ${ticketInCart.quantity}`
      : "No Ticket Selected";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full md:w-auto"
    >
      <Select
        onValueChange={(newQuantity) => handleChangeQuantity(Number(newQuantity))}
      >
        <SelectTrigger className={triggerClassName ?? "bg-gold w-full md:w-[180px] h-11 text-base font-semibold text-black"}>
          <SelectValue placeholder={placeholderValue} />
        </SelectTrigger>
        <SelectContent className="bg-gold border-none rounded">
          <SelectGroup className="text-base font-semibold">
            <SelectLabel className="text-black font-semibold">Tickets</SelectLabel>
            {availableTickets.map((ticketQuantity) => (
              <SelectItem
                key={`${ticketTitle}quantity-${ticketQuantity}`}
                value={String(ticketQuantity)}
                className="text-base font-semibold text-black"
              >
                {ticketQuantity === 0 ? "No Ticket Selected" : `Qty: ${ticketQuantity}`}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </motion.div>
  );
};
