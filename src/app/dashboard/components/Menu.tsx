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

    // if (!targetRoom || targetRoom.length < 4) return; // Need at least 4 for closed to split meaningfully

    const roomLength = targetRoom.length;
    const wasClosed = targetRoom[0] === targetRoom[roomLength - 1];

    // Start of deleted segment
    const segmentStartIdx = wallIdx;
    const segmentEndIdx = (wallIdx + 1) % (wasClosed ? roomLength - 1 : roomLength);

    // Split into two open rooms: before segment and after segment
    let beforeSegment: number[] = [];
    let afterSegment: number[] = [];

    if (wasClosed) {
      // Handle wrap: from 0 to segmentStart, and segmentEnd to end (excluding duplicate)
      const effectiveLen = roomLength - 1;
      if (segmentStartIdx > 0) {
        beforeSegment = targetRoom.slice(0, segmentStartIdx + 1); // Include start
      } else {
        // If deleting first segment, before is empty
      }

      const afterStart = (segmentEndIdx + effectiveLen) % effectiveLen; // Wrap if needed
      afterSegment = targetRoom.slice(segmentEndIdx, effectiveLen).concat(targetRoom.slice(0, afterStart + 1));
      if (afterStart === 0) afterSegment = targetRoom.slice(segmentEndIdx, effectiveLen); // Adjust if wrap not needed
    } else {
      // Open room: simpler slice
      beforeSegment = targetRoom.slice(0, segmentStartIdx + 1);
      afterSegment = targetRoom.slice(segmentEndIdx);
    }

    // Filter degenerates (< 2 points)
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
