import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/router";
import NavigationBar from "@/components/NavBar";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { useCallback } from "react";
import clsx from "clsx";
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import Loading from "@/components/Loading";
import ScheduleTable from "@/components/ScheduleTable";
import Modal from "@/components/modal";

export const ClassScheduleScheme = z.object({
  classDate: z.string(),
  classDateDesc: z.string(),
  startTime: z.string(),
  stopTime: z.string(),
});

export type ClassSchedule = z.infer<typeof ClassScheduleScheme>;

export const SectionSchema = z.object({
  section: z.string(),
  lecturerNameThai: z.string(),
  lecturerNameEng: z.string(),
  classSchedule: z.array(ClassScheduleScheme),
});

export type Section = z.infer<typeof SectionSchema>;

export const SubjectSchema = z.object({
  subjectId: z.string(),
  subjectCode: z.string(),
  eduTerm: z.string(),
  eduYear: z.string(),
  shortNameEng: z.string(),
  subjectNameThai: z.string(),
  subjectNameEng: z.string(),
  subjectType: z.string(),
  subjectTypeDesc: z.string(),
  totalCredit: z.number(),
  credit: z.string(),
  roomId: z.string().nullable(),
  roomName: z.string().nullable(),
  buildingName: z.string().nullable(),
  campusId: z.string(),
  campusNameThai: z.string(),
  facId: z.string(),
  facNameThai: z.string(),
  deptId: z.string().nullable(),
  deptNameThai: z.string().nullable(),
  majorId: z.string().nullable(),
  majorNameThai: z.string().nullable(),
  sections: z.array(SectionSchema),
});

export type Subject = z.infer<typeof SubjectSchema>;

const convertToDecimalHour = (time: string) => {
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = parseInt(time.slice(2, 4), 10);
  return hours + minutes / 60;
};

// Function to convert decimal hours to time string
const convertDecimalHourToTimeString = (decimalHour: number) => {
  const hours = Math.floor(decimalHour);
  const minutes = Math.floor((decimalHour - hours) * 60);
  return `${hours.toString().padStart(2, "0")}${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Function to generate time slots
const generateTimeSlots = (minTime: string, maxTime: string) => {
  const minDecimalHour = Math.floor(convertToDecimalHour(minTime));
  const maxDecimalHour = convertToDecimalHour(maxTime);

  let currentTime = convertDecimalHourToTimeString(minDecimalHour);
  const timeSlots = [];

  while (convertToDecimalHour(currentTime) <= maxDecimalHour) {
    timeSlots.push(currentTime);

    let hours = parseInt(currentTime.slice(0, 2), 10);
    let minutes = parseInt(currentTime.slice(2, 4), 10);

    hours += 1; // Increment by 1 hour

    if (hours >= 24) {
      hours = 0; // Reset to midnight if over 24 hours
    }

    currentTime = `${hours.toString().padStart(2, "0")}${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return timeSlots;
};

const Schedule = () => {
  const auth = useAuth();
  const router = useRouter();

  const extractDecimalMinutes = (time: string) => {
    const minutes = parseInt(time.slice(2, 4), 10);
    return minutes / 60;
  };

  const convertToDecimalHour = (time: string) => {
    const hours = parseInt(time.slice(0, 2), 10);
    const minutesDecimal = extractDecimalMinutes(time);
    return hours + minutesDecimal;
  };

  const convertDecimalHourToTimeString = (decimalHour: number) => {
    const hours = Math.floor(decimalHour);
    const minutes = Math.floor((decimalHour - hours) * 60);
    return `${hours.toString().padStart(2, "0")}${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const generateTimeSlots = (
    minTime: string | null = "0800",
    maxTime: string | null = "1800"
  ) => {
    const minDecimalHour = Math.floor(convertToDecimalHour(minTime || "0800"));
    const maxDecimalHour = convertToDecimalHour(maxTime || "1800");

    let currentTime = convertDecimalHourToTimeString(minDecimalHour);
    const timeSlots = [];

    while (convertToDecimalHour(currentTime) <= maxDecimalHour) {
      timeSlots.push(currentTime);

      let hours = parseInt(currentTime.slice(0, 2), 10);
      let minutes = parseInt(currentTime.slice(2, 4), 10);

      hours += 1; // Increment by 1 hour

      if (hours >= 24) {
        hours = 0; // Reset to midnight if over 24 hours
      }

      currentTime = `${hours.toString().padStart(2, "0")}${minutes
        .toString()
        .padStart(2, "0")}`;
    }

    return timeSlots;
  };

  const [searchResult, setSearchResult] = useState<Subject[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tableSubjects, setTableSubjects] = useState(null);
  const [compareTableSubjects, setCompareTableSubjects] = useState(null);
  const [option, setOption] = useState(false);
  const [user, setUser] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [owner, setOwner] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string[]>(
    generateTimeSlots(tableSubjects?.minTime, tableSubjects?.maxTime)
  );
  const [compareTimeSlot, setCompareTimeSlot] = useState<string[]>(
    generateTimeSlots(tableSubjects?.minTime, tableSubjects?.maxTime)
  );

  const fetchSchedule = useCallback(async () => {
    try {
      const result = await axios.get(
        `http://localhost:8080/schedule/search?query=${router.query.id}`
      );
      setSchedule(result.data[0]);
      setSubjects(result.data[0].scheduleSubject);
      setTitle(result.data[0].scheduleName);
      setPublist(result.data[0].isPublic);
      console.log(result.data[0].user.studentId)
      if (
        result.data[0].user.studentId == auth.user?.profile.preferred_username
      ) {
        setOwner(true);
      }
    } catch (error) {
      console.error("Error fetchSchedule", error);
    }
  }, [auth.user?.profile.preferred_username, router.query.id]);

  const fetchTable = useCallback(async () => {
    try {
      const result = await axios.get(
        `http://localhost:8080/schedule/getTable/${router.query.id}`
      );
      setTableSubjects(result.data);
      setTimeSlot(result.data.timeRange);
      console.log(result.data);

      // setTableSubjects(result.data.scheduleSubject);
      // console.log(schedule, subjects);
    } catch (error) {
      console.error("Error fetchCompareTable", error);
    }
  }, [router.query.id]);

  const fetchComparedTable = useCallback(async (scheduleId: string) => {
    try {
      const result = await axios.get(
        `http://localhost:8080/schedule/getTable/${scheduleId}`
      );
      setCompareTableSubjects(result.data);
      setCompareTimeSlot(result.data.timeRange);
      console.log(result.data.timeRange);
      // setTableSubjects(result.data.scheduleSubject);
      // console.log(schedule, subjects);
    } catch (error) {
      console.error("Error fetchTable", error);
    }
  }, []);

  const fetchSubject = async (values: { semester: string; search: string }) => {
    try {
      const result = await axios.get(
        `http://localhost:8080/open-api/01/${values.semester}?keySearch=${values.search}`
      );
      setSearchResult(result.data);
    } catch (error) {
      console.error("Error fetchSubject", error);
    }
  };

  const addSubject = async (section: string, subject: Subject) => {
    try {
      if (subject.sections) {
        await axios.patch(
          `http://localhost:8080/schedule/${section}/${router.query.id}`,
          { subject: subject }
        );
        await fetchSchedule();
        await fetchTable();
      } else {
        console.error("Subject does not contain any sections.");
      }
    } catch (error) {
      console.error("Error addSubject", error);
    }
  };

  const getUser = useCallback(async () => {
    try {
      const result = await axios.get(`http://localhost:8080/user/userData`, {
        headers: {
          token: auth.user?.access_token,
        },
      });

      setUser(result.data);
    } catch (error) {
      console.error("Error getUser", error);
    }
  }, [auth.user?.access_token]);

  const deleteSubject = async (subjectId: string) => {
    try {
      await axios.patch(
        `http://localhost:8080/schedule/delete/${subjectId}/${router.query.id}`
      );
      await fetchSchedule();
      await fetchTable();
    } catch (error) {
      console.error("Error addSubject", error);
    }
  };

  const handleSubmit = async (values: any): Promise<void> => {
    await fetchSubject(values);
  };

  const divRef = useRef(null);

  const captureDiv = async () => {
    if (divRef.current) {
      const canvas = await html2canvas(divRef.current, {
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      // Create a link to download the image
      const link = document.createElement("a");
      link.href = imgData;
      link.download = router.query.id + ".png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const [title, setTitle] = useState(`${schedule?.scheduleName}`);
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && router.query.id && !schedule) {
      getUser();
      fetchSchedule();
      fetchSubject({ semester: "1/2563", search: "" });
      fetchTable();
      if (user && user.bookMark.length > 0) {
        fetchComparedTable(user.bookMark[0].scheduleId);
      }

      console.log(schedule);
    }
  }, [
    auth.isAuthenticated,
    auth.user,
    router.query.id,
    fetchSchedule,
    schedule,
    fetchTable,
    fetchComparedTable,
    getUser,
    user,
    title,
  ]);

  const [isEditing, setEditing] = useState(false);
  const [hoveredEdit, setHoveredEdit] = useState(false);
  const [openPublishModal, setPublishModal] = useState(false);
  const [isPublished, setPublist] = useState(false);

  const handlePublishModal = () => {
    setPublishModal(!openPublishModal);
  };

  const handleEditTitle = () => {
    setEditing(true);
  };
  const handleEditOff = () => {
    handleTitleChangeNSent();
    setEditing(false);
  };

  const handleEnterPress = (event: any) => {
    if (event.key === "Enter") {
      ChangeTitle();
      setEditing(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      if (isEditing) {
        inputRef.current.style.width = `${
          inputRef.current.value.length * 12
        }px`;
      } else {
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
      }
    }
  }, [isEditing]);

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };
  const handleTitleChangeNSent = () => {
    ChangeTitle();
  };
  const ChangeTitle = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/updateName/${title}/${schedule?.scheduleId}`
      );
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const changeStatePrivate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/publish/${schedule?.scheduleId}`,
        { isPublish: false }
      );
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };
  const changeStatePublish = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/publish/${schedule?.scheduleId}`,
        { isPublish: true }
      );
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };
  const handleChange2Publish = async () => {
    await changeStatePublish();
    setPublist(true);

    console.log("Change stute to ublish complete");
  };
  const handleChange2Private = async () => {
    await changeStatePrivate();
    setPublist(false);
    console.log("Change stute to private complete");
  };

  if (auth.isLoading) {
    return <Loading />;
  }

  const width = 140;
  const height = 35;
  const space = 7.5;
  const downloadWidth = 80;
  const downloadHeight = 40;
  const downloadSpace = 7.5;

  return (
    <>
      <Modal
        isOpen={openPublishModal}
        onClose={(): void => {
          setPublishModal(false);
        }}
      >
        <div className="relative h-[280px] w-[full] bg-Grey-200 flex justify-between flex-col text-Green-500">
          <button
            className="absolute -right-4 -top-4 z-40"
            onClick={handlePublishModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 cursor-pointer"
              onClick={() => {}}
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {/* Title */}
          <div className=" flex items-center ">
            <h1 className="text-2xl font-bold flex-1 text-Green-500 flex justify-center font-noto">
              ใครจะเห็นตารางคุณบ้าง
            </h1>
          </div>
          {/* Description */}
          <div className=" text-xl w-full flex flex-col justify-center items-start space-y-3 ">
            <button
              className={clsx(
                !isPublished && "border-2 border-Grey-500 rounded",
                isPublished && "border-2 border-Grey-200",
                "flex flex-row justify-start items-center space-x-3 p-2 w-full border-2 border-Grey-200 hover:bg-Grey-300 hover:rounded"
              )}
              onClick={() => {
                handleChange2Private();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="16"
                fill="currentColor"
                className="bi bi-lock-fill"
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
              </svg>
              <div className="flex flex-col justify-center items-start font-noto">
                <div>ส่วนตัว</div>
                <div className="text-lg ">เฉพาะคุณเท่านั้นที่ดูได้</div>
              </div>
            </button>
            <button
              className={clsx(
                isPublished && "border-2 border-Grey-500 rounded",
                !isPublished && "border-2 border-Grey-200",
                "flex flex-row justify-start items-center space-x-3 p-2 w-full border-2 border-Grey-200 hover:bg-Grey-300 hover:rounded"
              )}
              onClick={() => {
                handleChange2Publish();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                fill="currentColor"
                className="bi bi-globe"
              >
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
              </svg>
              <div className="flex flex-col justify-center items-start font-noto">
                <div>สาธารณะ</div>
                <div className="text-lg">
                  ทุกคนที่อยู่คณะและสาขาเดียวกันกับคุณที่ใช้ ScheduleUP
                </div>
              </div>
            </button>
          </div>
          {/* Button */}
          <div className="flex justify-end space-x-[16px] text-lg">
            <button
              className="h-[40px] w-[100px] rounded bg-Blue-500 text-white font-noto"
              onClick={() => {
                handlePublishModal();
              }}
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </Modal>
      {imageModalOpen ? (
        <>
          {imageModalOpen ? (
            <>
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto font-noto">
                <div className="relative w-auto bg-white rounded-md">
                  <div className="relative flex flex-col w-full bg-opacity-15 rounded-lg shadow-lg p-3">
                    {/* Schedule content */}
                    <div className="p-2" ref={divRef}>
                      <div
                        className="rounded-md"
                        style={{
                          backgroundImage:
                            "url(https://cdn.hero.page/wallpapers/121fb583-c65c-4988-bd92-06e0e9b0ed2e-minimalist-mountain-peaks-wallpaper-wallpaper-1.png)",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div>
                          <ScheduleTable
                            timeSlot={timeSlot}
                            tableSubjects={tableSubjects}
                            width={downloadWidth}
                            height={downloadHeight}
                            space={downloadSpace}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-end px-2">
                      <button
                        className="hover:bg-red-500 bg-red-600 text-sm font-medium px-5 py-2 rounded-md shadow hover:shadow-lg mr-3"
                        type="button"
                        onClick={() => setImageModalOpen(false)}
                      >
                        Close
                      </button>
                      <button
                        className="hover:bg-[#014e91] bg-[#003D72] text-white text-sm font-medium px-5 py-2 rounded-md shadow hover:shadow-lg"
                        type="button"
                        onClick={captureDiv}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
      <div>
        <div className="h-auto w-full font-noto">
          <div
            className="fixed min-h-screen flex items-center justify-center w-full dark:bg-gray-950"
            style={{
              backgroundImage:
                "url(https://eila.psu.ac.th/wp-content/uploads/2023/03/img-journey-3d-place-psu-00026.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <NavigationBar />
          <div className="relative min-h-screen w-full px-5 py-6">
            <div
              style={{
                background: "rgba( 0, 0, 0, 0.3 )",
                boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
                backdropFilter: "blur( 20px )",
                WebkitBackdropFilter: "blur( 20px )",
                borderRadius: "10px",
              }}
              className="p-5"
            >
              <div className="flex flex-row space-x-4 mb-2 justify-between">
                <div className="flex flex-row justify-center items-center space-x-2">
                  <button
                    onClick={() => setOption(false)}
                    className={`${
                      option
                        ? "bg-opacity-0 hover:bg-opacity-15"
                        : "bg-opacity-35 hover:bg-opacity-30"
                    } bg-white py-1 px-2 rounded-lg `}
                  >
                    รายวิชาทั้งหมด
                  </button>
                  <button
                    onClick={async () => {
                      setOption(true);
                      await fetchComparedTable(user.bookMark[0].scheduleId);
                    }}
                    className={`${
                      !option
                        ? "bg-opacity-0 hover:bg-opacity-15"
                        : "bg-opacity-35 hover:bg-opacity-30"
                    } bg-white py-1 px-2 rounded-lg`}
                  >
                    เปรียบเทียบตาราง
                  </button>
                  {option ? (
                    <>
                      <div>
                        <Formik
                          initialValues={{
                            bookmark: user.bookMark[0].scheduleId,
                          }}
                          onSubmit={handleSubmit}
                        >
                          {({ values }) => (
                            <Form>
                              <div className="flex flex-row space-x-2">
                                <Field
                                  as="select"
                                  name="bookmark"
                                  onChange={(e) =>
                                    fetchComparedTable(e.target.value)
                                  }
                                  className=" py-1 w-[130px] rounded-md  hover:bg-opacity-30 bg-white bg-opacity-15 appearance-none text-gray-50  px-3 text-center justify-center m-auto focus:outline-none"
                                >
                                  {user?.bookMark &&
                                    user?.bookMark.map(
                                      (bookmark: any, index: any) => (
                                        <option
                                          key={index}
                                          value={bookmark.scheduleId}
                                        >
                                          {bookmark.scheduleName}
                                        </option>
                                      )
                                    )}
                                </Field>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="relative flex justify-end">
                  <div
                    className=" w-[780px] h-[40px] flex flex-row items-center justify-between px-2"
                    onMouseEnter={() => setHoveredEdit(true)}
                    onMouseLeave={() => setHoveredEdit(false)}
                  >
                    {/*name and publisher */}
                    <div className="max-w-[240px] flex flex-row items-center space-x-1">
                      <div className="max-w-[200px] text-lg font-normal w-auto py-1 w-[130px] rounded-md  text-gray-50  px-3 text-center justify-center m-auto  font-noto">
                        {isEditing ? (
                          <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            onSubmit={handleTitleChangeNSent}
                            onKeyPress={handleEnterPress}
                            ref={inputRef}
                            className="border border-b-2 border-black border-dotted border-t-0 border-l-0 border-r-0 outline-0 w-auto max-w-[200px] text-black "
                            // disabled={!isEditing}
                          />
                        ) : (
                          <div className="text-ellipsis overflow-hidden max-w-[240px] line-clamp-1">
                            {title}
                          </div>
                        )}
                      </div>

                      {hoveredEdit ? (
                        <div>
                          {isEditing ? (
                            <button onClick={() => handleEditOff()}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-check-circle-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                              </svg>
                            </button>
                          ) : (
                            <div>
                              <button
                                className="text-gray-50 "
                                onClick={() => handleEditTitle()}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-pencil-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          handlePublishModal();
                        }}
                      >
                        {isPublished ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-globe text-gray-50"
                          >
                            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="19"
                            height="16"
                            fill="currentColor"
                            className="bi bi-lock-fill text-gray-50"
                          >
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-full flex flex-row mx-auto justify-center space-x-2">
                {owner ? (
                  <div className="flex flex-col h-auto w-1/2 rounded-xl space-y-2">
                    {option ? (
                      <div className="relative p-2 bg-white rounded-md bg-opacity-25 border-2 border-white border-opacity-35 mb-3">
                        <button
                          onClick={() => {
                            setImageModalOpen(true);
                          }}
                          className="z-50 rounded-full p-1.5 bg-[#003D72] bg-opacity-80 absolute bottom-4 right-4 border-2 border-white border-opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            class="size-5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                        </button>
                        <ScheduleTable
                          timeSlot={compareTimeSlot}
                          tableSubjects={compareTableSubjects}
                          width={width}
                          height={height}
                          space={space}
                        />
                      </div>
                    ) : null}

                    <Formik
                      initialValues={{ search: "", semester: "1/2563" }}
                      onSubmit={handleSubmit}
                    >
                      {({ values }) => (
                        <Form>
                          <div className="flex flex-row space-x-2">
                            <div className="items-center py-1 w-full h-[35px] hover:bg-opacity-50 bg-white bg-opacity-35 rounded-md font-medium flex flex-row px-2 justify-center my-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="white"
                                className="bi bi-search my-auto mr-3"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                              </svg>
                              <Field
                                type="text"
                                name="search"
                                className="bg-transparent w-full focus:outline-none placeholder-gray-300"
                                placeholder="ค้นหารายวิชา"
                              />
                            </div>
                            <Field
                              as="select"
                              name="semester"
                              className="py-1 w-[130px] rounded-md  hover:bg-opacity-50 bg-white bg-opacity-35 appearance-none text-gray-50 font-normal px-3 text-center justify-center m-auto focus:outline-none"
                            >
                              <option className="text-gray-500" value="1/2563">
                                1/2563
                              </option>
                              <option className="text-gray-500" value="2/2563">
                                2/2563
                              </option>
                              <option className="text-gray-500" value="1/2564">
                                1/2564
                              </option>
                              <option className="text-gray-500" value="2/2564">
                                2/2564
                              </option>
                            </Field>
                            <button
                              type="submit"
                              title="search-button"
                              className="flex w-[70px] h-[35px] hover:bg-[#014e91] bg-[#003D72] items-center rounded-md "
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="currentColor"
                                className="bi bi-search m-auto"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                              </svg>
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                    <div className="flex flex-col space-y-2 overflow-y-auto text-black">
                      {searchResult.map((subject, index) => (
                        <div
                          key={index}
                          className="hover:bg-opacity-20 bg-white bg-opacity-15 py-1.5 w-full h-full rounded-md text-gray-500 font-medium flex flex-col mb-1 px-2 border-2 border-white border-opacity-35 hover:border-opacity-55"
                        >
                          <div
                            className={`flex flex-row w-full h-auto cursor-pointer`}
                            onClick={() => {
                              setExpandedIndex((prevIndex) =>
                                prevIndex === index ? null : index
                              );
                            }}
                          >
                            <div className="flex w-full h-auto flex-col text-gray-300">
                              <span className="text-[13px] font-semibold text-white">
                                {subject.subjectCode} {subject.subjectNameEng}
                              </span>
                              <span className="text-[12px]">
                                {subject.subjectNameThai}
                              </span>
                              <span className="text-[12px]">
                                ภาคการศึกษา: {subject.eduTerm}/{subject.eduYear}
                              </span>
                              <span className="text-[12px]">
                                ประเภทวิชา: {subject.subjectTypeDesc}
                              </span>
                              <span className="text-[12px]">
                                หน่วยกิต: {subject.totalCredit}
                              </span>
                            </div>
                            <div className="flex w-fit h-auto text-[14px] font-semibold text-center text-black justify-end">
                              <svg
                                className={`w-5 h-5 transition-transform duration-500 ${
                                  expandedIndex === index
                                    ? "transform rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="white"
                                strokeOpacity={0.8}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </div>
                          </div>

                          <div
                            className={clsx(
                              "transition-all ease-in-out duration-500 overflow-hidden text-gray-300 mt-2",
                              {
                                "max-h-0": expandedIndex !== index,
                                "max-h-screen": expandedIndex === index,
                              }
                            )}
                          >
                            {subject.sections?.map((section, sectionIndex) => (
                              <div
                                key={sectionIndex}
                                className="flex flex-row justify-between space-x-2"
                              >
                                <div className="w-full h-auto p-2 flex flex-col rounded-md space-y-1 bg-black bg-opacity-15  ">
                                  <span className="text-gray-300 text-[13px] font-semibold">
                                    ตอน: {section.section}
                                  </span>
                                  {/* <div className="flex w-full h-auto flex-row items-center justify-between">
                                    <button
                                    className="flex h-[25px] text-[12px] text-center items-center justify-center px-4 bg-[#003D72] text-white rounded-lg"
                                    onClick={() =>
                                      addSubject(section.section, subject)
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="2"
                                      width="15"
                                      height="15"
                                      stroke="white"
                                      className="m-auto"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                      />
                                    </svg>
                                  </button>
                                  </div> */}
                                  <span className="text-[12px]">
                                    <span className="font-bold">
                                      อาจารย์ผู้สอน:{" "}
                                    </span>
                                    {section.lecturerNameThai}
                                  </span>
                                  {section.classSchedule.map(
                                    (schedule, scheduleIndex) => (
                                      <div
                                        key={scheduleIndex}
                                        className="text-[12px] mt-1"
                                      >
                                        <span>
                                          <span className="font-bold">
                                            วัน
                                            {schedule.classDateDesc}
                                            {": "}
                                          </span>
                                          {(
                                            (parseFloat(
                                              schedule.startTime
                                            ) as number) / 100
                                          ).toFixed(2)}{" "}
                                          -{" "}
                                          {(
                                            (parseFloat(
                                              schedule.stopTime
                                            ) as number) / 100
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                                <button
                                  className="flex h-auto text-[16px] text-center items-center justify-center px-4 hover:bg-[#014e91] bg-[#003D72] text-white rounded-lg"
                                  onClick={() =>
                                    addSubject(section.section, subject)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    width="15"
                                    height="15"
                                    stroke="white"
                                    className="m-auto"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div
                  className={clsx(
                    !owner && "h-full w-full",
                    owner && "h-full w-1/2"
                  )}
                >
                  <div className="relative p-2 bg-white rounded-md bg-opacity-25 border-2 border-white border-opacity-35">
                    <button
                      onClick={() => {
                        setImageModalOpen(true);
                      }}
                      className="z-50 rounded-full p-1.5 bg-[#003D72] bg-opacity-80 absolute bottom-4 right-4 border-2 border-white border-opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </button>

                    <ScheduleTable
                      timeSlot={timeSlot}
                      tableSubjects={tableSubjects}
                      width={width}
                      height={height}
                      space={space}
                    />
                  </div>

                  {subjects.length ? (
                    <div className=" flex flex-col overflow-y-auto mt-5 h-full">
                      <p className="font-semibold text-white">รายวิชาทั้งหมด</p>

                      {subjects &&
                        subjects.map((subject: any, index: any) => (
                          <div
                            key={index}
                            className="hover:bg-opacity-20 bg-white bg-opacity-15 py-1.5 mt-1 w-full h-full rounded-md text-white font-medium flex flex-row mb-1 px-2 border-2 border-white border-opacity-35 hover:border-opacity-55 justify-between items-center"
                          >
                            <p className="text-[13px] font-semibold ">
                              {subject.subjectCode} {subject.subjectNameThai}{" "}
                              ตอน: {subject.section}
                            </p>
                            <button
                              onClick={() => {
                                deleteSubject(subject.subjectId);
                              }}
                              title="delete-button"
                              className="flex w-[50px] h-[35px]  items-center rounded-md"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                width="20"
                                height="20"
                                stroke="#ff9e9e"
                                className="m-auto"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;
