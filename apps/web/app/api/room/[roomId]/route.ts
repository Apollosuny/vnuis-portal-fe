import { RoomType } from '@/types/room.types';
import { NextRequest, NextResponse } from 'next/server';

// Mock database for rooms
const mockRooms = [
  {
    roomId: '1',
    name: 'Conference Room A',
    description: 'Large conference room with projector and video conferencing',
    capacity: 20,
    location: 'Building A, Floor 1',
    type: RoomType.EVENT,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeSlots: [],
    bookings: [],
  },
  {
    roomId: '2',
    name: 'Computer Lab 101',
    description: 'Computer lab with 30 workstations',
    capacity: 30,
    location: 'Building B, Floor 2',
    type: RoomType.LAB,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeSlots: [],
    bookings: [],
  },
  {
    roomId: '3',
    name: 'Classroom 201',
    description: 'Standard classroom with whiteboard',
    capacity: 40,
    location: 'Building C, Floor 2',
    type: RoomType.CLASSROOM,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeSlots: [],
    bookings: [],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const room = mockRooms.find((r) => r.roomId === roomId);

  if (!room) {
    return NextResponse.json({ message: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(room);
}
