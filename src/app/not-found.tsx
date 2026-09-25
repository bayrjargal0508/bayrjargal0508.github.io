import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[7px] bg-yellow-500 p-[64px]">
      <div className="flex items-center gap-0">
        <p className="text-[180px] font-bold leading-none text-red-900">4</p>
        <div className="flex size-[300px] items-center justify-center rounded-full bg-white">
          <Image src="/model-full.png" width={250} height={200} alt="404" />
        </div>
        <p className="text-[180px] font-bold leading-none text-amber-900">4</p>
      </div>
      <p className="mb-3 text-base font-medium text-neutral-800">
        Хуудас олдсонгүй.
      </p>
      <Link href="/" className="">
        Нүүр хуудас руу
      </Link>
    </div>
  );
}
