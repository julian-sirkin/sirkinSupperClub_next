import { FaInstagram } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { AiFillTikTok } from "react-icons/ai";
import Link from "next/link";

export const ContactLinks = () => {
  return (
    <ul className="flex  flex-col py-2 md:py-20 gap-10">
      <li className="flex gap-4 text-xl md:text-3xl font-bold">
        <MdEmail />
        <Link href="mailto:sirkinsupperclub@gmail.com">
          sirkinsupperclub@gmail.com
        </Link>
      </li>
      <li className="flex gap-4 text-xl md:text-3xl font-bold">
        <Link
          href="https://www.instagram.com/julian.sirkin/"
          className="flex gap-4"
        >
          <FaInstagram /> Julian.Sirkin
        </Link>
      </li>
      <li className="flex gap-4 text-xl md:text-3xl font-bold">
        <Link
          href="https://www.instagram.com/sirkinsupperclub/"
          className="flex gap-4"
        >
          <FaInstagram /> sirkinsupperclub
        </Link>
      </li>
      <li className="flex gap-4 text-xl md:text-3xl font-bold">
        <Link
          href="https://www.tiktok.com/@sirkinsupperclub"
          className="flex gap-4"
        >
          <AiFillTikTok /> sirkinsupperclub
        </Link>
      </li>
    </ul>
  );
};
