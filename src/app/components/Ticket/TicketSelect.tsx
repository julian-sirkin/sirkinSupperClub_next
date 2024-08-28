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
  return (
    <Select
      onValueChange={(newQuantity) => handleChangeQuantity(Number(newQuantity))}
    >
      <SelectTrigger className="bg-gold w-[180px] h-12 font-bold text-lg text-white text-bold hover:bg-white hover:text-gold">
        <SelectValue placeholder="Select Quantity" />
      </SelectTrigger>
      <SelectContent className="bg-gold">
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
