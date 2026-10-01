import Link from "next/link";
import Image from "next/image";
import { brand } from "@/config/brand";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label={brand.name}>
      <Image src={brand.logo} alt="" width={36} height={36} />
      <span>{brand.name}</span>
    </Link>
  );
}
