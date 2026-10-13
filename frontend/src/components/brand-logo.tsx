import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ href = "/", className = "", priority = false }: BrandLogoProps) {
  const logo = (
    <Image
      src="/cognix-logo.png"
      alt="COGNIX Learning, Assessment, Insights"
      width={998}
      height={286}
      priority={priority}
      unoptimized
      sizes="(max-width: 768px) 150px, 155px"
      className={`block object-contain ${className}`}
    />
  );

  return href ? (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {logo}
    </Link>
  ) : logo;
}
