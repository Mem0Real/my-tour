import { cursorPosAtom } from '@/utils/atoms/ui';
import { Html } from '@react-three/drei';
import { useAtomValue } from 'jotai';

export const Menu = () => {
  const menuPos = useAtomValue(cursorPosAtom);

  return (
    <Html
      position={menuPos}
      style={{
        background: '#e2e2e2',
        color: '#1a1a1a',
        padding: '2px 2px',
        fontSize: '13px',
        borderRadius: '3px',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div
        className={`z-10 px-4 py-2 bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 shadow-lg shadow-neutral-500/80  dark:text-neutral-900 transition-all duration-300 ease-in-out flex flex-col gap-4 items-start justify-start w-full`}
      >
        <button className='bg-neutral-300 text-neutral-600 rounded-sm hover:rounded-lg px-3 py-2'>Delete</button>
        <button className='bg-neutral-300 text-neutral-600 rounded-sm hover:rounded-lg px-3 py-2'>Split</button>
      </div>
    </Html>
  );
};
