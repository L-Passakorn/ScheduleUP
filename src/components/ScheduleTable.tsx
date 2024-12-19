import React from "react";

const ScheduleTable = ({ timeSlot, tableSubjects, width, height, space }) => {
  const extractDecimalMinutes = (time: string) => {
    const minutes = parseInt(time.slice(2, 4), 10);
    return minutes / 60;
  };

  const convertToDecimalHour = (time: string) => {
    const hours = parseInt(time.slice(0, 2), 10);
    const minutesDecimal = extractDecimalMinutes(time);
    return hours + minutesDecimal;
  };

  console.log({ timeSlot, tableSubjects, width, height, space });

  return (
    <div className="w-full h-auto rounded-md">
      <div className="fixed flex bg-white bg-opacity-50" />

      <div
        style={{
          paddingInlineStart: "8px",
          paddingRight: "8px",
          scrollbarWidth: "auto",
          scrollbarColor: "rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0)",
          msScrollbarTrackColor: "transparent",
        }}
        className=" min-w-full flex flex-col divide-opacity-0 divide-y divide-white overflow-x-auto"
      >
        <div className="flex flex-row text-white items-center text-sm h-[50px] divide-x-2 divide-white divide-opacity-50">
          <div className="flex min-w-[100px] justify-center">
            <p>Day / Time</p>
          </div>
          {timeSlot.map((time) => (
            <div
              key={time}
              style={{ minWidth: `${width}px` }}
              className="flex justify-center"
            >
              {time.toString().padStart(2, "0")} : 00
            </div>
          ))}
        </div>
        {tableSubjects?.schedule &&
          tableSubjects?.schedule.map((daySchedule: any, index: any) => (
            <div
              key={index}
              style={{
                height: `${space + daySchedule.maxLayer * (height + space)}px`,
                minWidth: `${
                  100 + width * (Math.max(timeSlot) - Math.min(timeSlot))
                }px`,
              }}
              className="flex relative flex-row text-white items-center text-sm"
            >
              <div className="flex w-[100px] justify-center">
                <p>{daySchedule.dayName}</p>
              </div>
              {daySchedule.subjects &&
                daySchedule.subjects.map((subject: any, index: any) => (
                    <div
                    key={index}
                    style={{
                      height: `${height}px`,
                      width: `${
                        width *
                        (convertToDecimalHour(subject.stopTime) -
                          convertToDecimalHour(subject.startTime))
                      }px`,
                      left: `${
                        100 +
                        width *
                          (convertToDecimalHour(subject.startTime) -
                            Math.floor(convertToDecimalHour(tableSubjects?.minTime)))
                      }px`,
                      top: `${space + (subject.layer - 1) * (height + space)}px`,
                    }}
                    className="absolute flex rounded-lg h-[35px] my-auto divide-x-2 divide-white divide-opacity-50 w-[170px] items-center justify-center top-[7.5px] bg-white bg-opacity-15"
                  >
                    <p
                      style={{ lineHeight: "initial !important" }}
                      className="line-clamp-1 font-medium text-center px-2 text-[12px]"
                    >
                      {subject.subjectCode} {subject.subjectNameEng}
                    </p>
                  </div>
                  
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ScheduleTable;
