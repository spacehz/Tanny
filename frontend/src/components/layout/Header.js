import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          TANNY
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-primary-200">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary-200">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary-200">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
