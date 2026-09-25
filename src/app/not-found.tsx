import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[7px] bg-yellow-500 p-6 sm:p-[64px]">
      <div className="flex items-center gap-0">
        <p className="text-[clamp(4.5rem,22vw,180px)] font-bold leading-none text-red-900">
          4
        </p>
        <div className="flex size-[clamp(7.5rem,38vw,300px)] items-center justify-center rounded-full bg-white">
          <Image
            src="/model-full.png"
            width={250}
            height={200}
            alt="404"
            className="h-auto w-[83%]"
          />
        </div>
        <p className="text-[clamp(4.5rem,22vw,180px)] font-bold leading-none text-amber-900">
          4
        </p>
      </div>
      <p className="text-base font-medium text-neutral-800">
        Хуудас олдсонгүй.
      </p>
      <Link href="/" className="">
        Нүүр хуудас руу
      </Link>
    </div>
  );
}
