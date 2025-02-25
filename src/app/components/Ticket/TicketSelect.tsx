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
};

export const TicketSelect = ({
  availableTickets,
  handleChangeQuantity,
  ticketTitle,
}: TicketSelectProps) => {
  const ticketInCart = useCartStore((state) =>
    state.cart.tickets.find((t) => t.title === ticketTitle)
  );

  const placeholderValue = ticketInCart?.quantity
    ? ticketInCart.quantity
    : "Select";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full md:w-auto"
    >
      <Select
        onValueChange={(newQuantity) => handleChangeQuantity(Number(newQuantity))}
      >
        <SelectTrigger className="bg-gold w-full md:w-[180px] h-12 font-bold text-md md:text-lg text-black hover:bg-white hover:text-gold transition-colors duration-300">
          <SelectValue placeholder={placeholderValue} />
        </SelectTrigger>
        <SelectContent className="bg-gold border-none rounded">
          <SelectGroup className="text-lg">
            <SelectLabel className="text-black font-semibold">Tickets</SelectLabel>
            {availableTickets.map((ticketQuantity) => (
              <SelectItem
                key={`${ticketTitle}quantity-${ticketQuantity}`}
                value={String(ticketQuantity)}
                className="text-lg font-bold text-black hover:bg-white hover:text-gold"
              >
                {ticketQuantity}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </motion.div>
  );
};
