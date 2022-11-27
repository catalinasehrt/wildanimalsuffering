import { Navigation } from "./navigation";

export function Header() {
  return (
    <header className="absolute left-0 flex w-full items-start p-10 text-gray">
      <Navigation />
      <span className="ml-8 hidden font-light md:block">
        Illustrations by{" "}
        <a
          className="font-normal underline"
          href="https://katerodman.com/"
          target="_blank"
          rel="noreferrer"
        >
          Kate Rodman
        </a>
      </span>
      {/* <SearchIcon size={23} /> */}
    </header>
  );
}
