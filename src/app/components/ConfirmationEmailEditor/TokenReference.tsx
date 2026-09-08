import { ORDER_CONFIRMATION_TOKENS } from "@/app/emails/emailTokens";

export const TokenReference = ({ unknownTokens }: { unknownTokens: string[] }) => {
  return (
    <div className="bg-black p-4 rounded-lg border border-gold/30">
      <h3 className="text-gold font-semibold mb-1">Placeholders</h3>
      <p className="text-gray-400 text-sm mb-3">
        Type these anywhere in the subject or body and they get filled in with the guest&apos;s
        real order.
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {ORDER_CONFIRMATION_TOKENS.map(({ token, description }) => (
          <li key={token} className="text-sm">
            <code className="text-gold">{`{{${token}}}`}</code>
            <span className="text-gray-400"> — {description}</span>
          </li>
        ))}
      </ul>

      {unknownTokens.length > 0 && (
        <p className="mt-3 text-sm text-red-300">
          Not a real placeholder, so it will show up literally in the guest&apos;s email:{" "}
          {unknownTokens.map((token) => `{{${token}}}`).join(", ")}
        </p>
      )}
    </div>
  );
};
