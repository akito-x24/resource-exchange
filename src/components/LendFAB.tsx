// 'use client';

// import { useState } from 'react';
// import { Plus } from 'lucide-react';
// import { LendResourceModal } from './LendResourceModal';

// export function LendFAB() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-2xl hover:bg-blue-700"
//       >
//         <Plus size={18} /> Lend Something
//       </button>

//       <LendResourceModal open={open} onOpenChange={setOpen} />
//     </>
//   );
// }

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { LendResourceModal } from './LendResourceModal';

export function LendFAB() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Show only on homepage
  const showFAB = pathname === '/' || pathname === '/home';

  if (!showFAB) return null; // ✅ Hide everywhere else

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-2xl hover:bg-blue-700 transition"
      >
        <Plus size={18} /> Lend Something
      </button>

      <LendResourceModal open={open} onOpenChange={setOpen} />
    </>
  );
}
