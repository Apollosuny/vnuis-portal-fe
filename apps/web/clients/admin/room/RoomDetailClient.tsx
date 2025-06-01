'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, EditIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DateTime } from 'luxon';
import { useRoomOperations } from '@/hooks/useRoom';
import { RoomType, RoomTimeSlot } from '@/types/room.types';

type RoomDetailClientProps = {
  roomId: string;
};

export const RoomDetailClient = ({ roomId }: RoomDetailClientProps) => {
  const router = useRouter();
  const { selectedRoom, isLoading, fetchRoomById, deleteRoom } =
    useRoomOperations();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRoomById(roomId);
  }, [roomId]);

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?'
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    const success = await deleteRoom(roomId);
    setIsDeleting(false);

    if (success) {
      router.push('/rooms');
    }
  };

  const getRoomTypeLabel = (type: RoomType) => {
    switch (type) {
      case RoomType.CLASSROOM:
        return 'Classroom';
      case RoomType.LAB:
        return 'Laboratory';
      case RoomType.EVENT:
        return 'Event Hall';
      default:
        return type;
    }
  };

  // Helper function to get day name from abbreviation
  const getDayName = (dayAbbreviation: string): string => {
    const days: Record<string, string> = {
      // Support both uppercase and lowercase day abbreviations
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
      // Support lowercase variants from backend
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    };
    return days[dayAbbreviation] || dayAbbreviation;
  };

  // Weekly schedule display component
  const WeeklyScheduleDisplay = ({
    timeSlots,
  }: {
    timeSlots: RoomTimeSlot[];
  }) => {
    if (!timeSlots || timeSlots.length === 0) return null;

    // Debug - xem dữ liệu time slots chi tiết
    console.log(
      'Raw time slots passed to WeeklyScheduleDisplay:',
      JSON.stringify(timeSlots, null, 2)
    );

    // Kiểm tra định dạng và xuất chi tiết để debug
    timeSlots.forEach((slot, index) => {
      console.log(`Time slot #${index}:`, {
        id: slot.id,
        time: `${slot.startTime} - ${slot.endTime}`,
        dowsType: typeof slot.dows,
        dowsValue: slot.dows,
        dowsBit: slot.dowsBit,
      });
    });

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames: Record<string, string> = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    };

    // Normalize day abbreviation to lowercase 3-letter format with enhanced support for various formats
    const normalizeDayAbbr = (day: string | number): string => {
      if (day === undefined || day === null) return '';

      // Handle numeric day of week (0-6 or 1-7)
      if (typeof day === 'number' || !isNaN(Number(day))) {
        const numDay = Number(day);
        // Check if using 0-6 format (0 = Sunday) or 1-7 format (1 = Monday)
        if (numDay >= 0 && numDay <= 6) {
          // 0-6 format (0 = Sunday)
          const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          console.log(`Normalizing numeric day: ${day} to ${dayMap[numDay]}`);
          return dayMap[numDay] || ''; // Fallback to ensure we always return a string
        } else if (numDay >= 1 && numDay <= 7) {
          // 1-7 format (1 = Monday, 7 = Sunday)
          const dayMap = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          console.log(`Normalizing numeric day: ${day} to ${dayMap[numDay]}`);
          return dayMap[numDay] || ''; // Fallback to ensure we always return a string
        }
      }

      // Convert to string and lowercase for string processing
      const dayStr = String(day).toLowerCase().trim();

      // Also check uppercase values
      if (typeof day === 'string') {
        const upperDay = day.toUpperCase();
        // Direct mapping from uppercase day values like "MON" to lowercase "mon"
        if (upperDay === 'SUN') return 'sun';
        if (upperDay === 'MON') return 'mon';
        if (upperDay === 'TUE') return 'tue';
        if (upperDay === 'WED') return 'wed';
        if (upperDay === 'THU') return 'thu';
        if (upperDay === 'FRI') return 'fri';
        if (upperDay === 'SAT') return 'sat';
      }

      console.log('Normalizing day:', day, 'to lowercase:', dayStr);

      // Comprehensive mapping for day names and abbreviations
      const dayMapping: Record<string, string> = {
        // Full names
        sunday: 'sun',
        monday: 'mon',
        tuesday: 'tue',
        wednesday: 'wed',
        thursday: 'thu',
        friday: 'fri',
        saturday: 'sat',
        // Common abbreviations
        sun: 'sun',
        mon: 'mon',
        tue: 'tue',
        wed: 'wed',
        thu: 'thu',
        fri: 'fri',
        sat: 'sat',
        // Alternative abbreviations
        s: 'sun',
        m: 'mon',
        t: 'tue',
        w: 'wed',
        th: 'thu',
        f: 'fri',
        sa: 'sat',
        // Single digit representation
        '0': 'sun',
        '1': 'mon',
        '2': 'tue',
        '3': 'wed',
        '4': 'thu',
        '5': 'fri',
        '6': 'sat',
        '7': 'sun',
        // Vietnamese abbreviations (if used)
        cn: 'sun',
        hai: 'mon',
        ba: 'tue',
        tu: 'wed',
        nam: 'thu',
        sau: 'fri',
        bay: 'sat',
        // Alternative spelling
        tues: 'tue',
        thur: 'thu',
        thurs: 'thu',
      };

      // Try direct mapping first
      if (dayStr && dayMapping[dayStr]) {
        console.log(`Mapped ${dayStr} to ${dayMapping[dayStr]}`);
        return dayMapping[dayStr] || ''; // Đảm bảo luôn trả về string
      }

      // If it's already in the correct format, return as is
      if (days.includes(dayStr)) {
        return dayStr;
      }

      // For any case where the full name starts with the correct prefix
      for (const [fullName, abbr] of Object.entries(dayMapping)) {
        if (dayStr.startsWith(fullName.substring(0, 3))) {
          console.log(
            `Prefix match: ${dayStr} starts with ${fullName.substring(0, 3)}, mapped to ${abbr}`
          );
          return abbr;
        }
      }

      // Last resort: try to extract the first 3 letters and check if valid
      const result = dayStr.substring(0, 3);
      if (days.includes(result)) {
        console.log(`Extracted first 3 letters: ${result}`);
        return result;
      }

      console.log(`Could not normalize day: ${day}, returning empty string`);
      return '';
    };

    // Convert all time slots to a schedule format that shows which times are available on which days
    const schedule: Record<string, string[]> = {};

    // Initialize schedule with all days and time slots
    days.forEach((day) => {
      schedule[day] = [];
    });

    // Get all unique time slots
    const allTimeSlots = new Set<string>();
    timeSlots.forEach((slot) => {
      const timeRange = `${slot.formattedStartTime || slot.startTime} - ${slot.formattedEndTime || slot.endTime}`;
      allTimeSlots.add(timeRange);
    });

    // Hàm chuyển đổi từ giờ UTC sang giờ địa phương sử dụng Luxon
    const convertToLocalTime = (timeStr: string): string => {
      if (!timeStr) return '';

      // Nếu đã là định dạng HH:MM thì trả về
      if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
        return timeStr;
      }

      try {
        // Sử dụng Luxon để parse và chuyển đổi timezone
        let dateTime: DateTime;

        // Kiểm tra xem có phải là ISO string không
        if (timeStr.includes('T') || timeStr.includes('Z')) {
          // Parse ISO string as UTC
          dateTime = DateTime.fromISO(timeStr, { zone: 'utc' });
        } else {
          // Thử parse với các format khác
          dateTime = DateTime.fromFormat(timeStr, 'HH:mm', { zone: 'utc' });

          // Nếu không thành công, thử với format có ngày
          if (!dateTime.isValid) {
            dateTime = DateTime.fromISO(timeStr, { zone: 'utc' });
          }
        }

        if (!dateTime.isValid) {
          console.warn('Invalid time format:', timeStr);
          return timeStr;
        }

        // Chuyển đổi sang local timezone
        const localTime = dateTime.toLocal();

        // Trả về format HH:mm
        return localTime.toFormat('HH:mm');
      } catch (err) {
        console.error('Lỗi khi chuyển đổi thời gian với Luxon:', err);
        return timeStr;
      }
    };

    // Fill in the schedule with available time slots for each day
    timeSlots.forEach((slot) => {
      const localStartTime = convertToLocalTime(
        slot.formattedStartTime || slot.startTime
      );
      const localEndTime = convertToLocalTime(
        slot.formattedEndTime || slot.endTime
      );
      const timeRange = `${localStartTime} - ${localEndTime}`;

      // Handle different formats of dows data
      let dowsList: string[] = [];

      // Thêm log để debug
      console.log('Original dows:', slot.dows);
      console.log('Time slot dowsBit value:', slot.dowsBit);

      // First try to use the dows property if available
      if (slot.dows) {
        if (Array.isArray(slot.dows)) {
          dowsList = slot.dows.map((d: any) =>
            typeof d === 'string' ? d : String(d)
          );
        } else if (typeof slot.dows === 'string') {
          dowsList = [slot.dows];
        } else if (typeof slot.dows === 'object' && slot.dows !== null) {
          try {
            const values = Object.values(slot.dows);
            if (Array.isArray(values) && values.length > 0) {
              dowsList = values.map((v) => String(v));
            }
          } catch (e) {
            console.error('Error processing dows object:', e);
          }
        }
      }

      // If no dows found but we have a dowsBit, convert from bit representation
      // Using a binary approach: bit 0 = Sunday, bit 1 = Monday, etc.
      if (
        (!dowsList || dowsList.length === 0) &&
        typeof slot.dowsBit === 'number' &&
        slot.dowsBit > 0
      ) {
        console.log('Trying to convert dowsBit to days:', slot.dowsBit);
        const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        // Process each bit
        for (let i = 0; i < 7; i++) {
          // Check if the bit at position i is set and that dayMap[i] exists
          if ((slot.dowsBit & (1 << i)) !== 0 && dayMap[i]) {
            // We know dayMap[i] is defined here because of the condition check
            dowsList.push(dayMap[i] as string);
            console.log(`Found day at bit ${i}: ${dayMap[i]}`);
          }
        }
      }

      console.log('Processed dowsList:', dowsList);

      // Add time slot to each day it's available
      dowsList.forEach((day) => {
        if (!day) return;

        const normalizedDay = normalizeDayAbbr(day);
        console.log('Processing day:', day, 'normalized to:', normalizedDay);

        // Make sure normalizedDay is a valid string day name
        if (!normalizedDay || typeof normalizedDay !== 'string') {
          console.log('Invalid normalized day (not a string):', normalizedDay);
          return;
        }

        // Đảm bảo ngày đã được normalize thuộc danh sách ngày hợp lệ
        if (days.includes(normalizedDay) && schedule) {
          // Đảm bảo schedule[normalizedDay] tồn tại
          if (!schedule[normalizedDay]) {
            schedule[normalizedDay] = [];
          }

          // Đảm bảo không thêm trùng lặp
          if (
            Array.isArray(schedule[normalizedDay]) &&
            !schedule[normalizedDay].includes(timeRange)
          ) {
            console.log(
              'Adding timeRange:',
              timeRange,
              'to day:',
              normalizedDay
            );
            schedule[normalizedDay].push(timeRange);
          }
        } else {
          console.log('Day not valid after normalization:', normalizedDay);
        }
      });
    });

    // Sort time slots for each day
    Object.keys(schedule).forEach((day) => {
      if (schedule[day]) {
        schedule[day].sort();
      }
    });

    // Log các ngày và time slots sau khi xử lý
    console.log('Processed schedule for all days:', schedule);

    // Kiểm tra xem có bất kỳ ngày nào có lịch không
    const hasAnySchedule = days.some(
      (day) =>
        schedule[day] &&
        Array.isArray(schedule[day]) &&
        schedule[day].length > 0
    );

    console.log('Has any schedule:', hasAnySchedule);

    return (
      <>
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='bg-gray-50 font-medium border-b border-gray-200 grid grid-cols-7'>
            {days.map((day) => (
              <div
                key={day}
                className={`px-4 py-3 text-center border-r last:border-r-0 ${['sat', 'sun'].includes(day) ? 'text-gray-500' : 'text-gray-800'}`}
              >
                {dayNames[day]}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 min-h-[150px]'>
            {days.map((day) => {
              const daySchedule =
                schedule && schedule[day] ? schedule[day] : [];
              return (
                <div
                  key={day}
                  className={`border-r last:border-r-0 p-3 flex flex-col ${['sat', 'sun'].includes(day) ? 'bg-gray-50' : ''}`}
                >
                  {daySchedule.length > 0 ? (
                    <div className='space-y-2'>
                      {daySchedule.map((timeRange, idx) => (
                        <div
                          key={`${day}-${idx}`}
                          className='text-xs bg-green-50 text-green-700 border border-green-100 rounded px-2 py-1 flex items-center'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-3 w-3 mr-1 text-green-500'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                              clipRule='evenodd'
                            />
                          </svg>
                          {timeRange}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-xs text-gray-400 flex items-center justify-center h-full'>
                      Not available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className='bg-gray-50 border-t border-gray-200 py-2 px-4'>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-3 h-3 bg-green-100 border border-green-300 rounded mr-1'></div>
              <span>Available time slots</span>
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin debug nếu không có lịch nào được tìm thấy */}
        {!hasAnySchedule && (
          <div className='mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200'>
            <h4 className='text-sm font-medium text-yellow-800 mb-2'>
              Thông tin gỡ lỗi
            </h4>
            <p className='text-xs text-yellow-700'>
              Không tìm thấy lịch nào cho các ngày trong tuần. Dưới đây là thông
              tin chi tiết về time slots:
            </p>
            <div className='mt-2'>
              <div className='flex items-center mb-2'>
                <span className='text-xs font-medium text-yellow-800 inline-block w-28'>
                  Tổng số time slots:
                </span>
                <span className='text-xs'>{timeSlots.length}</span>
              </div>
              <div className='flex items-center mb-2'>
                <span className='text-xs font-medium text-yellow-800 inline-block w-28'>
                  Trạng thái lịch:
                </span>
                <span className='text-xs'>
                  {Object.entries(schedule)
                    .map(([day, slots]) => `${day}: ${slots.length} slots`)
                    .join(', ')}
                </span>
              </div>
            </div>
            <pre className='mt-2 text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto max-h-48'>
              {JSON.stringify(
                {
                  timeSlots: timeSlots.map((slot) => ({
                    id: slot.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    localStartTime: convertToLocalTime(slot.startTime),
                    localEndTime: convertToLocalTime(slot.endTime),
                    dowsBit: slot.dowsBit,
                    dows: slot.dows,
                    formattedStartTime: slot.formattedStartTime,
                    formattedEndTime: slot.formattedEndTime,
                  })),
                },
                null,
                2
              )}
            </pre>
            <div className='mt-2 text-xs text-yellow-800'>
              <p className='font-medium'>Hướng dẫn khắc phục:</p>
              <ol className='list-decimal pl-5 mt-1 text-yellow-700 space-y-1'>
                <li>
                  Kiểm tra xem mỗi time slot phải có thuộc tính dows chứa các
                  ngày trong tuần.
                </li>
                <li>
                  Nếu dows là rỗng, hãy kiểm tra giá trị dowsBit (biểu diễn bit
                  của các ngày).
                </li>
                <li>
                  Định dạng ngày trong tuần phải là: mon, tue, wed, thu, fri,
                  sat, sun.
                </li>
                <li>Đảm bảo startTime và endTime ở định dạng HH:MM.</li>
              </ol>

              <div className='mt-3 mb-2 font-medium'>
                Công cụ chuyển đổi dowsBit:
              </div>
              <div className='grid grid-cols-7 gap-1 text-center bg-gray-100 p-2 rounded mb-1'>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                  <div key={idx} className='text-[10px] text-gray-600'>
                    {day}
                  </div>
                ))}
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(
                  (day, idx) => (
                    <div
                      key={idx}
                      className='text-[10px] text-gray-700 font-medium'
                    >
                      {day}
                    </div>
                  )
                )}
                {Array(7)
                  .fill(0)
                  .map((_, idx) => (
                    <div key={idx} className='text-[10px] text-gray-800'>
                      {1 << idx} ({idx})
                    </div>
                  ))}
              </div>
              <p className='text-[10px] text-yellow-700'>
                Ví dụ: dowsBit = 34 = 0b0100010 = T6 (bit 1) + T2 (bit 5) = fri
                + mon
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  // Component to display time slot data when grouping fails
  const RawTimeSlotsDisplay = ({
    timeSlots,
  }: {
    timeSlots: RoomTimeSlot[];
  }) => {
    if (!timeSlots || timeSlots.length === 0) return null;

    return (
      <div className='space-y-4'>
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h3 className='text-sm font-medium text-blue-800 mb-2'>
            Available Time Slots
          </h3>
          <p className='text-sm text-blue-700 mb-4'>
            This room has {timeSlots.length} time slot
            {timeSlots.length !== 1 ? 's' : ''} defined.
          </p>

          <WeeklyScheduleDisplay timeSlots={timeSlots} />
        </div>
      </div>
    );
  };

  // Group time slots by day of week
  const groupTimeSlotsByDay = (timeSlots: any[]) => {
    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      console.log('No time slots available or not in array format');
      return {};
    }

    console.log('Processing time slots:', timeSlots);
    const groupedSlots: Record<string, any[]> = {};

    timeSlots.forEach((slot) => {
      console.log('Processing slot:', slot);
      // Try to access dows both directly and through formattedDows for compatibility
      let dowsArray = [];

      console.log('Dows property type:', typeof slot.dows);

      if (slot.dows) {
        if (Array.isArray(slot.dows)) {
          dowsArray = slot.dows;
        } else if (typeof slot.dows === 'string') {
          dowsArray = [slot.dows];
        } else if (typeof slot.dows === 'object') {
          // Might be a getter that returns an array
          try {
            const possibleArray = Object.values(slot.dows);
            if (Array.isArray(possibleArray) && possibleArray.length > 0) {
              dowsArray = possibleArray;
            }
          } catch (e) {
            console.error('Error processing dows object:', e);
          }
        }
      }

      console.log('Dows array:', dowsArray);

      if (dowsArray && dowsArray.length > 0) {
        dowsArray.forEach((day: string) => {
          // Normalize day format to MON, TUE, etc.
          const normalizedDay = day.toUpperCase();

          if (!groupedSlots[normalizedDay]) {
            groupedSlots[normalizedDay] = [];
          }

          // Extract time information, always preferring formatted times if available
          let startTime = slot.formattedStartTime || slot.startTime;
          let endTime = slot.formattedEndTime || slot.endTime;

          console.log('Using times for slot:', {
            original: { start: slot.startTime, end: slot.endTime },
            formatted: {
              start: slot.formattedStartTime,
              end: slot.formattedEndTime,
            },
            final: { start: startTime, end: endTime },
          });

          // Check if this time slot already exists in this day's array to avoid duplicates
          const exists = groupedSlots[normalizedDay].some(
            (existingSlot) =>
              existingSlot.startTime === startTime &&
              existingSlot.endTime === endTime
          );

          if (!exists) {
            groupedSlots[normalizedDay].push({
              id: slot.id,
              startTime: startTime,
              endTime: endTime,
            });
          }
        });
      }
    });

    // Sort time slots by start time within each day
    Object.keys(groupedSlots).forEach((day) => {
      if (groupedSlots[day]) {
        groupedSlots[day].sort((a, b) => {
          return a.startTime.toString().localeCompare(b.startTime.toString());
        });
      }
    });

    // Sort days in week order
    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return Object.fromEntries(
      Object.entries(groupedSlots).sort(
        ([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB)
      )
    );
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className='text-center py-10'>
        <p className='text-lg text-gray-500'>Room not found</p>
        <Link
          href='/rooms'
          className='text-primary hover:underline mt-4 inline-block'
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  console.log('Selected Room:', selectedRoom);
  console.log('Time Slots:', selectedRoom.timeSlots);

  // Group time slots by day
  const groupedTimeSlots = groupTimeSlotsByDay(selectedRoom.timeSlots || []);

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <Link
          href='/dashboard/rooms'
          className='text-gray-500 hover:text-gray-700 flex items-center gap-1'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          Back to Rooms
        </Link>
      </div>

      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>{selectedRoom.name}</h1>
          <p className='text-gray-500'>{selectedRoom.location}</p>
        </div>
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/rooms/${roomId}/edit`}
            className='bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2'
          >
            <EditIcon className='h-4 w-4' />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2'
          >
            {isDeleting ? (
              <Loader2Icon className='h-4 w-4 animate-spin' />
            ) : (
              <TrashIcon className='h-4 w-4' />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 border'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-lg font-semibold mb-4'>Room Details</h2>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500'>Status</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                    selectedRoom.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedRoom.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Room Type</p>
                <p className='font-medium'>
                  {getRoomTypeLabel(selectedRoom.type)}
                </p>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Capacity</p>
                <p className='font-medium'>{selectedRoom.capacity} people</p>
              </div>

              {selectedRoom.description && (
                <div>
                  <p className='text-sm text-gray-500'>Description</p>
                  <p className='font-medium'>{selectedRoom.description}</p>
                </div>
              )}

              <div>
                <p className='text-sm text-gray-500'>Created</p>
                <p className='font-medium'>
                  {new Date(selectedRoom.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Last Updated</p>
                <p className='font-medium'>
                  {new Date(selectedRoom.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-semibold'>Availability Schedule</h2>
              {selectedRoom.timeSlots && selectedRoom.timeSlots.length > 0 && (
                <Link
                  href={`/dashboard/rooms/${roomId}/edit`}
                  className='text-sm text-blue-600 hover:text-blue-800 flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                    />
                  </svg>
                  Edit Schedule
                </Link>
              )}
            </div>

            {selectedRoom.timeSlots && selectedRoom.timeSlots.length > 0 && (
              <div className='mb-4 p-4 bg-blue-50 rounded-lg'>
                <div className='flex items-start'>
                  <div className='bg-blue-100 rounded-full p-2 mr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 text-blue-600'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-blue-800 mb-2'>
                      Room Availability Schedule
                    </h3>
                    <p className='text-sm text-blue-700'>
                      {selectedRoom.name} has {selectedRoom.timeSlots.length}{' '}
                      time slot{selectedRoom.timeSlots.length !== 1 ? 's' : ''}{' '}
                      defined.
                    </p>
                    {selectedRoom.timeSlots.some(
                      (slot) =>
                        !slot.dows ||
                        (Array.isArray(slot.dows) && slot.dows.length === 0)
                    ) && (
                      <div className='mt-2 flex items-center text-yellow-600 text-sm'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Some time slots may not have day-of-week information
                        <Link
                          href={`/dashboard/rooms/${roomId}/edit`}
                          className='text-blue-600 hover:text-blue-800 ml-2 inline-flex items-center'
                        >
                          <span>Edit Schedule</span>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-3 w-3 ml-1'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {selectedRoom.timeSlots && selectedRoom.timeSlots.length > 0 ? (
              <div className='space-y-4'>
                <div className='mb-4'>
                  <div className='bg-white rounded-lg overflow-hidden'>
                    <WeeklyScheduleDisplay timeSlots={selectedRoom.timeSlots} />
                  </div>
                </div>

                <div className='bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p>
                    These are the regular time slots when this room is typically
                    available. The actual availability may vary based on
                    bookings and scheduling.
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                <svg
                  className='w-12 h-12 text-gray-400 mb-3'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <p className='text-gray-500 text-center'>
                  No regular availability schedule has been defined for this
                  room.
                </p>
                <p className='text-sm text-gray-400 mt-2 text-center'>
                  Room availability is used for scheduling and booking. Define
                  the days and times when this room is typically available.
                </p>
                <Link
                  href={`/dashboard/rooms/${roomId}/edit`}
                  className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  Add Availability Schedule
                </Link>
              </div>
            )}

            <h2 className='text-lg font-semibold mt-6 mb-4'>Recent Bookings</h2>
            {selectedRoom.bookings && selectedRoom.bookings.length > 0 ? (
              <div className='space-y-3'>
                {selectedRoom.bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className='p-3 border rounded-lg'>
                    <div className='flex justify-between mb-1'>
                      <p className='font-medium'>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className='text-sm'>{booking.purpose}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No recent bookings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
