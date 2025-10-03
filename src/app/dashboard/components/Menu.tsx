// Menu.tsx (updated handleDelete to split room without reconnecting)
import { roomsAtom, wallsAtom } from '@/utils/atoms/drawing';
import { cursorPosAtom, menuVisibleAtom } from '@/utils/atoms/ui';
import { Html } from '@react-three/drei';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

export const Menu = () => {
  const menuPos = useAtomValue(cursorPosAtom);
  const [activeMenu, setActiveMenu] = useAtom(menuVisibleAtom);

  const [rooms, setRooms] = useAtom(roomsAtom);
  const handleDelete = () => {
    const wallData = activeMenu?.wallData;
    if (!wallData) return;

    console.log(wallData);

    const wallIdx = wallData?.wallIndex;
    const roomIdx = wallData?.roomIndex;

    if (roomIdx === undefined || wallIdx === undefined) return;

    const updatedRooms = [...rooms];
    const targetRoom = updatedRooms[roomIdx];

    const roomLength = targetRoom.length;

    const adjustedWallIdx = wallIdx % roomLength;

    // Split into before (0 to adjustedWallIdx +1) and after ((adjustedWallIdx +1) to end)
    const beforeSegment = targetRoom.slice(0, adjustedWallIdx + 1);
    const afterSegment = targetRoom.slice(adjustedWallIdx + 1);

    // Add to new rooms, filter degenerates (<2 points)
    const newRooms = updatedRooms.filter((_, i) => i !== roomIdx);
    if (beforeSegment.length >= 2) newRooms.push(beforeSegment);
    if (afterSegment.length >= 2) newRooms.push(afterSegment);

    setRooms(newRooms);
    setActiveMenu(null); // Hide menu after action
  };

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
        pointerEvents: 'auto',
      }}
      onPointerDown={() => console.log('click')}
    >
      <div
        className={`z-50 px-4 py-2 bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 shadow-lg shadow-neutral-500/80  dark:text-neutral-900 transition-all duration-300 ease-in-out flex flex-col gap-4 items-start justify-start w-full`}
      >
        <button
          className='bg-neutral-300 text-neutral-600 rounded-sm hover:rounded-lg px-3 py-2'
          onClick={handleDelete}
        >
          Delete
        </button>
        <button className='bg-neutral-300 text-neutral-600 rounded-sm hover:rounded-lg px-3 py-2'>Split</button>
      </div>
    </Html>
  );
};
