import Image from "next/image";
import { Inter } from "next/font/google";
import { useAuth } from "react-oidc-context";
import NavigationBar from "@/components/NavBar";
import ScheduleCard from "@/components/ProfileScheduleCard";
import axios from "axios";
import Modal from "@/components/modal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loading from "@/components/Loading";
import { z } from "zod";
import { useRouter } from "next/router";
import { Field, Form, Formik } from "formik";
import clsx from "clsx";

interface BookMark {
  scheduleId: string;
  scheduleName: string;
}
export type ProfileProps = {
  studentId: string;
  titleName: string;
  studNameThai: string;
  studSnameThai: string;
  majorNameThai: string;
  deptNameThai: string;
  pictureBase64: string;
  studyLevelName: string;
  BookMark: BookMark[];
};

export const StudentDataScheme = z.object({
  _id: z.string(),
  studentId: z.string(),
  titleNameThai: z.string(),
  studNameThai: z.string(),
  studSnameThai: z.string(),
  studNameEng: z.string(),
  studSnameEng: z.string(),
  majorNameThai: z.string(),
  deptNameThai: z.string(),
  studyLevelName: z.string(),
  stillStudent: z.string(),
  pictureBase64: z.string(),
});

export type StudentData = z.infer<typeof StudentDataScheme>;

interface scheduleSchme {
  scheduleId: string;
  scheduleName: string;
  isPublic: boolean;

  scheduleSubject: any[];

  createdAt: Date;

  updatedAt: Date;
}

interface dataProps {
  schedule: scheduleSchme;
}
const Home = ({ schedule }: dataProps) => {
  const auth = useAuth();
  const router = useRouter();

  const [studData, setStudData] = useState<StudentData | null>(null);
  const [schedules, setSchedules] = useState<scheduleSchme[] | null>(null);

  useEffect(() => {
    const fetchStudDataNSchedule = async () => {
      try {
        const result = await axios.get(`http://localhost:8080/user/userData`, {
          headers: {
            token: auth.user?.access_token,
          },
        });
        console.log(result.data);

        try {
          const response = await axios.get("http://localhost:8080/schedule", {
            headers: {
              token: auth.user?.access_token,
            },
          });
          // const data = result.data.schedules;
          // const allSchedules = data.filter((schedule: any) => schedule.isPublic);

          console.log(response.data);
          setSchedules(response.data);
        } catch (error) {
          console.error("Error creating schedule:", error);
        }
        setStudData(result.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (auth.user) {
      setToken(auth.user?.access_token);
      fetchStudDataNSchedule();
    }
  }, [auth.user, auth.user?.access_token]);

  const [search, setSearch] = useState<scheduleSchme[] | null>(null);

  const fetchSchedule = async (values: { search: string }) => {
    try {
      const result = await axios.get(
        `http://localhost:8080/schedule/search?query=${values.search}`
      );
      console.log(result.data);
      setSearch(result.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const createSchedule = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/schedule",
        {}, // empty data payload
        {
          headers: {
            token: auth.user?.access_token,
          },
        }
      );
      // console.log(response.data); // Assuming you want to log the response data
      router.push("/schedule/" + response.data.scheduleId);
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const findSchedule = useCallback(async () => {
    try {
      const result = await axios.get(`http://localhost:8080/user/userData`, {
        headers: {
          token: auth.user?.access_token,
        },
      });
      console.log(result.data);

      try {
        const response = await axios.get("http://localhost:8080/schedule", {
          headers: {
            token: auth.user?.access_token,
          },
        });
        console.log(response.data);
        setSchedules(response.data);
      } catch (error) {
        console.error("Error creating schedule:", error);
      }

      setStudData(result.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [auth.user?.access_token]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWindowClick = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setTypeOpen(false);
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const [isTypeOpen, setTypeOpen] = useState(false);
  const handleTypeOpen = () => {
    setTypeOpen(!isTypeOpen);
  };

  const [typeState, setTypeState] = useState<boolean | null>(null);

  const handleChange2All = async () => {
    console.log("All");
    setTypeState(null);
    try {
      findSchedule();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };
  const handleChange2Private = async () => {
    console.log("Private");
    setTypeState(false);
    try {
      findSchedule();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };
  const handleChange2Publish = async () => {
    console.log("Publish");
    setTypeState(true);
    try {
      findSchedule();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const handleScheduleDelete = (scheduleId: string) => {
    if (schedules)
      setSchedules(
        schedules.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
  };

  const filtered = useMemo(() => {
    console.log(typeState);
    if (typeState === null) {
      return schedules;
    }
    return schedules?.filter(
      (schedule) => (schedule.isPublic === typeState) === true
    );
  }, [schedules, typeState]);

  const [openImportModal, setImportModal] = useState(false);
  const handleImportModal = () => {
    setImportModal(!openImportModal);
  };
  const [openBookmarkModal, setBookmarkModal] = useState(false);
  const handleBookmarkModal = () => {
    setBookmarkModal(!openBookmarkModal);
  };
  const [token, setToken] = useState<string | null>(null);

  const importSchedule = useCallback(
    async (values: { scheduleId: string }) => {
      try {
        const response = await axios.post(
          `http://localhost:8080/schedule/copySchedule/${values.scheduleId}`,
          {}, // empty data payload
          {
            headers: {
              token: token,
            },
          }
        );
        try {
          findSchedule();
        } catch (error) {
          console.error("Error fetching schedule:", error);
        }
        console.log(response.data); // Assuming you want to log the response data
      } catch (error) {
        console.error("Error creating schedule:", error);
      }
    },
    [findSchedule, token]
  );

  const handleImportSubmit = useCallback(
    async (values: any): Promise<void> => {
      await importSchedule(values);
      setImportModal(false);
    },
    [importSchedule]
  );

  const importBookmark = async (values: { scheduleId: string }) => {
    try {
      const result = await axios.get(
        `http://localhost:8080/schedule/search?query=${values.scheduleId}`
      );
      console.log(result.data);
      await handleBookmark(result.data.scheduleId, result.data.scheduleName);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const handleBookmarkSubmit = async (values: any): Promise<void> => {
    await importBookmark(values);
    setBookmarkModal(false);
  };

  const handleSubmit = async (values: any): Promise<void> => {
    setTypeState(null);
    await fetchSchedule(values);
  };

  const handleOnUpdate = async (): Promise<void> => {
    try {
      findSchedule();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const handleBookmark = async (scheduleId: string, scheduleName: string) => {
    try {
      const result = await axios.patch(
        `http://localhost:8080/user/bookmark`,
        {
          data: {
            scheduleName: scheduleName,
            scheduleId: scheduleId,
          },
        },
        {
          headers: { token: auth.user?.access_token },
        }
      );
      console.log(result.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };
  if (auth.isLoading) {
    return <Loading />;
  }
  if (filtered)
    return (
      <>
        <div>
          <div
            className="fixed min-h-screen flex items-center justify-center w-full dark:bg-gray-950 font-noto"
            style={{
              backgroundImage:
                "url(https://eila.psu.ac.th/wp-content/uploads/2023/03/img-journey-3d-place-psu-00026.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <NavigationBar />

          <div className="relative min-h-screen w-full px-10 py-6 space-y-5 font-noto">
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
              {studData ? (
                <div>
                  <div className="min-h-[600px] flex justify-start items-center flex-col">
                    <div className="flex flex-col  w-full  p-5 font-noto text-Green-500 space-y-4 items-center">
                      <div className="flex flex-row w-3/5 space-x-3">
                        {/*Search Bar*/}
                        <div className="w-10/12">
                          <Formik
                            initialValues={{ search: "" }}
                            onSubmit={handleSubmit}
                            enableReinitialize={true}
                          >
                            {({ values, setFieldValue, submitForm }) => (
                              <Form>
                                <div className="items-center text-white py-1 w-full h-[40px] hover:bg-opacity-50 bg-white bg-opacity-35 rounded-md font-medium flex flex-row px-2 justify-center my-auto">
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
                                    placeholder="ค้นหาตารางของคุณ"
                                    value={values.search}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      setFieldValue("search", e.target.value);
                                      submitForm();
                                    }}
                                  />
                                </div>
                              </Form>
                            )}
                          </Formik>
                        </div>

                        {/*Type of card*/}
                        <div className="relative text-Green-500">
                          {isTypeOpen ? (
                            <div className="absolute flex mx-auto my-auto flex-col items-center w-full py-2 h-auto bg-white border-2 border-Grey-500 rounded-md text-base top-11 z-40 font-normal ">
                              <button
                                className={clsx(
                                  typeState === null && "bg-Grey-400",
                                  typeState !== null && "bg-white",
                                  "flex flex-row space-x-2 items-center justify-center  w-full rounded-sm transition-colors duration-0 hover:bg-gray-100 dark:text-Green-500 dark:hover:bg-red-700 dark:hover:text-white"
                                )}
                                onClick={() => {
                                  handleChange2All();
                                }}
                              >
                                <div>ทั้งหมด</div>
                              </button>
                              <button
                                className={clsx(
                                  typeState === false && "bg-Grey-400",
                                  typeState !== false && "bg-white",
                                  "flex flex-row space-x-2 items-center justify-center  w-full rounded-sm transition-colors duration-0 hover:bg-gray-100 dark:text-Green-500 dark:hover:bg-red-700 dark:hover:text-white"
                                )}
                                onClick={() => {
                                  handleChange2Private();
                                }}
                              >
                                <div>ส่วนตัว</div>
                              </button>
                              <button
                                className={clsx(
                                  typeState === true && "bg-Grey-400",
                                  typeState !== true && "bg-white",
                                  "flex flex-row space-x-2 items-center justify-center  w-full rounded-sm transition-colors duration-0 hover:bg-gray-100 dark:text-Green-500  dark:hover:bg-red-700 dark:hover:text-white"
                                )}
                                onClick={() => {
                                  handleChange2Publish();
                                }}
                              >
                                <div>สาธารณะ</div>
                              </button>
                            </div>
                          ) : null}
                          <div ref={dropdownRef}>
                            <button
                              className="flex items-center text-gray-500 font-base py-1 px-2 w-1.5/12 h-[40px] bg-Grey-300 rounded-[10px] space-x-1"
                              onClick={() => {
                                handleTypeOpen();
                              }}
                            >
                              <div>ประเภท</div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-compact-down"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/*Create Modal (Route to Create page)*/}
                        <button
                          // onClick={createSchedule}
                          className="flex items-center text-white text-base flex-row justify-center py-1 w-2/12 px-2 my-auto bg-Blue-500 rounded-[10px] h-[40px] space-x-1"
                          onClick={async () => {
                            await createSchedule();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                            className="w-[16px] h-[16px]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                          <div>สร้างตาราง</div>
                        </button>
                      </div>
                    </div>
                    <div className=" w-auto flex flex-col text-md space-y-3 justify-center p-5">
                      <div className=" flex text-Green-500 items-start text-base justify-start  font-noto mb-[20px]  ">
                        <span className="flex text-white items-center font-semibold text-xl text-md justify-around">
                          ตารางทั้งหมด
                        </span>
                      </div>
                      <div className="justify-center flex">
                        {search !== null ? (
                          <div>
                            {search.length !== 0 ? (
                              <div className="grid grid-cols-4 gap-12 items-stretch">
                                {search.map((e: scheduleSchme, index) => (
                                  <ScheduleCard
                                    key={e.scheduleId}
                                    scheduleName={e.scheduleName}
                                    scheduleId={e.scheduleId}
                                    isPublic={e.isPublic}
                                    owner={true}
                                    onDelete={handleScheduleDelete}
                                    onUpdate={handleOnUpdate}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="flex text-Green-500 items-center text-2xl justify-center font-noto">
                                ขออภัย ไม่พบตารางที่ค้นหา
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-12 items-stretch">
                            {filtered.map((e: scheduleSchme, index) => (
                              <ScheduleCard
                                key={e.scheduleId}
                                scheduleName={e.scheduleName}
                                scheduleId={e.scheduleId}
                                isPublic={e.isPublic}
                                owner={true}
                                onDelete={handleScheduleDelete}
                                onUpdate={handleOnUpdate}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : studData == null ? (
                <div className="flex flex-col bg-white text-black font-noto items-center justify-center">
                  <Modal
                    isOpen={true}
                    // onClose={(): void => {
                    //   router.push("/")
                    // }}
                  >
                    <div className="relative h-[210px] w-[full] bg-Grey-200 flex justify-between flex-col text-Green-500">
                      <button
                        className="absolute -right-4 -top-4 z-40"
                        onClick={(): void => {
                          router.push("/");
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6 cursor-pointer"
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
                        <h1 className="text-2xl font-bold flex-1 text-Green-500 flex justify-center">
                          ไม่พบเจอผู้ใช้งาน?
                        </h1>
                      </div>
                      {/* Description */}
                      <div className="mb-[12px] text-xl line-clamp-3 flex w-full flex-col justify-center items-center">
                        <div>{`ไม่พบข้อมูลผู้ใช้ "${router.query.studId}" กรุณาลองใหม่อีกครั้ง`}</div>
                      </div>
                      {/* Button */}
                      <div className="flex justify-center text-lg">
                        <button
                          className="h-[40px] w-[100px] rounded bg-Blue-500 text-white p-2"
                          onClick={(): void => {
                            router.push("/");
                          }}
                        >
                          กลับหน้าแรก
                        </button>
                      </div>
                    </div>
                  </Modal>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
};
export default Home;
